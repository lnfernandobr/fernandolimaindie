import { spawn } from 'node:child_process';
import { INSTAGRAM_ERRORS, INSTAGRAM_VIDEO } from '../../constants/instagram.js';

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';
const { FPS, ZOOM_MAX, UPSCALE, XFADE_MS } = INSTAGRAM_VIDEO;

// Roda ffmpeg/ffprobe com prioridade baixa (nice) pra não competir com a API pela
// CPU — o host é pequeno (2GB / 2 vCPU) e o render é pesado. Resolve com stdout;
// rejeita com o fim do stderr em código != 0.
const run = (bin, args) =>
  new Promise((resolve, reject) => {
    const child = spawn('nice', ['-n', '19', bin, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(`${INSTAGRAM_ERRORS.FFMPEG_FAILED}: ${bin} (${code}) ${err.slice(-500)}`));
    });
  });

const msToSec = (ms) => (ms / 1000).toFixed(3);
const framesFor = (ms) => Math.max(1, Math.round((FPS * ms) / 1000));

export const probeDurationMs = async (file) => {
  const out = await run(FFPROBE, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ]);
  const seconds = Number.parseFloat(out);
  return Number.isFinite(seconds) ? Math.round(seconds * 1000) : 0;
};

// ── Áudio ────────────────────────────────────────────────────────────────

export const makeSilence = async (file, ms) => {
  await run(FFMPEG, [
    '-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono',
    '-t', msToSec(ms), '-c:a', 'libmp3lame', '-q:a', '9', file,
  ]);
  return file;
};

// Estica/preenche um áudio até a duração exata (silêncio no fim).
export const padAudioToDuration = async (input, output, ms) => {
  await run(FFMPEG, [
    '-y', '-i', input, '-af', 'apad', '-t', msToSec(ms),
    '-c:a', 'libmp3lame', '-q:a', '4', output,
  ]);
  return output;
};

// Junta os áudios das cenas com crossfade (mesma duração de transição do vídeo).
export const crossfadeAudio = async (files, output, xfadeMs = XFADE_MS) => {
  if (files.length === 1) {
    await run(FFMPEG, ['-y', '-i', files[0], '-c:a', 'libmp3lame', '-q:a', '4', output]);
    return output;
  }
  const d = msToSec(xfadeMs);
  const inputs = files.flatMap((f) => ['-i', f]);
  const parts = [];
  let prev = '[0:a]';
  for (let i = 1; i < files.length; i += 1) {
    const label = i === files.length - 1 ? '[aout]' : `[a${i}]`;
    parts.push(`${prev}[${i}:a]acrossfade=d=${d}:c1=tri:c2=tri${label}`);
    prev = label;
  }
  await run(FFMPEG, [
    '-y', ...inputs,
    '-filter_complex', parts.join(';'),
    '-map', '[aout]',
    '-c:a', 'libmp3lame', '-q:a', '4', output,
  ]);
  return output;
};

// Trilha de áudio. Com locução, a NARRAÇÃO manda: voz normalizada forte (~-16 LUFS),
// música bem mais baixa (~-30 LUFS) e ainda abaixada sob a fala (ducking forte) — a voz
// fica sempre clara. Sem voz, a música é o foco, em volume agradável. Fade in/out sempre.
export const mixSoundtrack = async ({ narration, music, output, totalMs, hasVoice }) => {
  const durSec = totalMs / 1000;
  const fadeOutStart = Math.max(0.1, durSec - 2.5).toFixed(2);
  const fades = `afade=t=in:st=0:d=1.5,afade=t=out:st=${fadeOutStart}:d=2.5`;

  // 1) Pré-normaliza a faixa (finita) pro volume-alvo. loudnorm direto num stream
  //    em loop infinito trunca o áudio — por isso normalizamos ANTES de loopar.
  const musicNorm = `${output}.mus.mp3`;
  const targetI = hasVoice ? -30 : -23;
  await run(FFMPEG, [
    '-y', '-i', music,
    '-af', `loudnorm=I=${targetI}:TP=-1.5`,
    '-c:a', 'libmp3lame', '-q:a', '4', musicNorm,
  ]);

  // 2) Mix. Com voz: narração forte (loudnorm -16; apad garante o comprimento) +
  //    música em loop com ducking forte sob a fala. Sem voz: só a música, com fades.
  const filter = hasVoice
    ? `[0:a]loudnorm=I=-16:TP=-1.5:LRA=11,apad,asplit=2[voice][vkey];` +
      `[1:a]${fades}[mus];` +
      `[mus][vkey]sidechaincompress=threshold=0.05:ratio=12:attack=5:release=300[musd];` +
      `[voice][musd]amix=inputs=2:duration=first:normalize=0[a]`
    : `[1:a]${fades}[a]`;

  await run(FFMPEG, [
    '-y',
    '-i', narration,
    '-stream_loop', '-1', '-i', musicNorm,
    '-filter_complex', filter,
    '-map', '[a]',
    '-t', durSec.toFixed(3),
    '-c:a', 'libmp3lame', '-q:a', '4',
    output,
  ]);
  return output;
};

// Quando não há música, usa só a narração (cortada no tamanho do vídeo).
export const narrationOnly = async (narration, output, totalMs) => {
  await run(FFMPEG, [
    '-y', '-i', narration, '-t', (totalMs / 1000).toFixed(3),
    '-c:a', 'libmp3lame', '-q:a', '4', output,
  ]);
  return output;
};

// ── Vídeo ──────────────────────────────────────────────────────────────────

// Clipe de UMA cena: Ken Burns (cobre o frame da variante) + legenda .ass opcional.
export const renderSceneClip = async ({ image, durationMs, variant, assFile, output }) => {
  const v = INSTAGRAM_VIDEO.VARIANTS[variant];
  const frames = framesFor(durationMs);
  const incr = ((ZOOM_MAX - 1) / frames).toFixed(6);
  const coverW = Math.round(v.width * UPSCALE);
  const coverH = Math.round(v.height * UPSCALE);
  const kenBurns =
    `[0:v]scale=${coverW}:${coverH}:force_original_aspect_ratio=increase,crop=${coverW}:${coverH},` +
    `zoompan=z='min(zoom+${incr},${ZOOM_MAX})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':` +
    `d=${frames}:s=${v.width}x${v.height}:fps=${FPS},format=yuv420p`;
  const filter = assFile ? `${kenBurns},ass=${assFile}[v]` : `${kenBurns}[v]`;
  await run(FFMPEG, [
    '-y', '-i', image,
    '-filter_complex', filter,
    '-map', '[v]', '-r', String(FPS), '-an',
    '-threads', '1', '-filter_threads', '1',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
    output,
  ]);
  return output;
};

// Transições variadas (rotacionam por cena) pra dar dinâmica e fluidez.
const XFADE_TRANSITIONS = [
  'fade', 'smoothleft', 'dissolve', 'smoothup', 'slideright',
  'circleopen', 'smoothright', 'fadeblack', 'smoothdown', 'slideleft',
];

// Encadeia os clipes das cenas com crossfade (xfade). Devolve vídeo mudo.
export const xfadeClips = async (clips, durationsMs, output, xfadeMs = XFADE_MS) => {
  if (clips.length === 1) {
    await run(FFMPEG, ['-y', '-i', clips[0], '-c', 'copy', output]);
    return output;
  }
  const d = xfadeMs / 1000;
  const inputs = clips.flatMap((c) => ['-i', c]);
  const parts = [];
  let prev = '[0:v]';
  let acc = durationsMs[0] / 1000;
  for (let i = 1; i < clips.length; i += 1) {
    const offset = (acc - d).toFixed(3);
    const label = i === clips.length - 1 ? '[vout]' : `[x${i}]`;
    const trans = XFADE_TRANSITIONS[(i - 1) % XFADE_TRANSITIONS.length];
    parts.push(`${prev}[${i}:v]xfade=transition=${trans}:duration=${d}:offset=${offset}${label}`);
    prev = label;
    acc = acc + durationsMs[i] / 1000 - d;
  }
  await run(FFMPEG, [
    '-y', ...inputs,
    '-filter_complex', parts.join(';'),
    '-map', '[vout]',
    '-r', String(FPS),
    '-threads', '1', '-filter_threads', '1',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
    output,
  ]);
  return output;
};

// Junta o vídeo (mudo) com a trilha de áudio final.
export const muxVideoAudio = async (video, audio, output) => {
  await run(FFMPEG, [
    '-y', '-i', video, '-i', audio,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
    '-shortest', '-movflags', '+faststart',
    output,
  ]);
  return output;
};

// Imagem de cor sólida no tamanho da variante (fallback quando a imagem falha).
export const makeSolidImage = async (color, variant, output) => {
  const v = INSTAGRAM_VIDEO.VARIANTS[variant];
  await run(FFMPEG, [
    '-y', '-f', 'lavfi',
    '-i', `color=c=${String(color).replace('#', '0x')}:s=${v.width}x${v.height}`,
    '-frames:v', '1', output,
  ]);
  return output;
};
