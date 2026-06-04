import { spawn } from 'node:child_process';
import { INSTAGRAM_ERRORS, INSTAGRAM_VIDEO } from '../../constants/instagram.js';

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';
const { FPS, ZOOM_MAX, UPSCALE, XFADE_MS, MUSIC_VOLUME } = INSTAGRAM_VIDEO;

// Roda um binário e resolve com stdout; rejeita com o fim do stderr em código != 0.
const run = (bin, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
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

// Mixa a narração com a trilha (em loop, volume baixo) cortando no fim da narração.
export const mixMusic = async (narration, music, output, volume = MUSIC_VOLUME) => {
  await run(FFMPEG, [
    '-y', '-i', narration, '-stream_loop', '-1', '-i', music,
    '-filter_complex',
    `[1:a]volume=${volume}[m];[0:a][m]amix=inputs=2:duration=first:dropout_transition=0[a]`,
    '-map', '[a]', '-c:a', 'libmp3lame', '-q:a', '4', output,
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
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
    output,
  ]);
  return output;
};

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
    parts.push(`${prev}[${i}:v]xfade=transition=fade:duration=${d}:offset=${offset}${label}`);
    prev = label;
    acc = acc + durationsMs[i] / 1000 - d;
  }
  await run(FFMPEG, [
    '-y', ...inputs,
    '-filter_complex', parts.join(';'),
    '-map', '[vout]',
    '-r', String(FPS),
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
