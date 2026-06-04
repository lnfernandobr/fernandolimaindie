import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { INSTAGRAM_ERRORS, INSTAGRAM_VIDEO } from '../../constants/instagram.js';

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';

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
      else reject(new Error(`${INSTAGRAM_ERRORS.FFMPEG_FAILED}: ${bin} (${code}) ${err.slice(-400)}`));
    });
  });

const msToSec = (ms) => (ms / 1000).toFixed(3);
const framesFor = (ms) => Math.max(1, Math.round((INSTAGRAM_VIDEO.FPS * ms) / 1000));

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

// Quebra o texto em linhas de até maxChars respeitando palavras inteiras.
export const wrapText = (text, maxChars = INSTAGRAM_VIDEO.TEXT_WRAP_CHARS) => {
  const words = String(text ?? '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (!line) line = word;
    else if (`${line} ${word}`.length <= maxChars) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.join('\n');
};

// Escreve o texto (já quebrado) num arquivo pra usar com drawtext textfile=...
export const writeTextFile = async (dir, name, text) => {
  const file = path.join(dir, name);
  await writeFile(file, wrapText(text), 'utf8');
  return file;
};

export const makeSilence = async (file, ms) => {
  await run(FFMPEG, [
    '-y',
    '-f', 'lavfi',
    '-i', `anullsrc=r=44100:cl=mono`,
    '-t', msToSec(ms),
    '-c:a', 'libmp3lame', '-q:a', '9',
    file,
  ]);
  return file;
};

// Estica/preenche um áudio até a duração exata (silêncio no fim).
export const padAudioToDuration = async (input, output, ms) => {
  await run(FFMPEG, [
    '-y',
    '-i', input,
    '-af', 'apad',
    '-t', msToSec(ms),
    '-c:a', 'libmp3lame', '-q:a', '4',
    output,
  ]);
  return output;
};

// Concatena segmentos de áudio (já com as durações certas) numa trilha só.
export const concatAudio = async (files, output) => {
  if (files.length === 1) {
    await run(FFMPEG, ['-y', '-i', files[0], '-c:a', 'libmp3lame', '-q:a', '4', output]);
    return output;
  }
  const inputs = files.flatMap((f) => ['-i', f]);
  const filter = `${files.map((_, i) => `[${i}:a]`).join('')}concat=n=${files.length}:v=0:a=1[a]`;
  await run(FFMPEG, [
    '-y',
    ...inputs,
    '-filter_complex', filter,
    '-map', '[a]',
    '-c:a', 'libmp3lame', '-q:a', '4',
    output,
  ]);
  return output;
};

// Mixa a narração com a trilha (em loop, volume baixo) cortando no fim da narração.
export const mixMusic = async (narration, music, output, volume = INSTAGRAM_VIDEO.MUSIC_VOLUME) => {
  await run(FFMPEG, [
    '-y',
    '-i', narration,
    '-stream_loop', '-1', '-i', music,
    '-filter_complex',
    `[1:a]volume=${volume}[m];[0:a][m]amix=inputs=2:duration=first:dropout_transition=0[a]`,
    '-map', '[a]',
    '-c:a', 'libmp3lame', '-q:a', '4',
    output,
  ]);
  return output;
};

const drawtextFilter = ({ textFile, fontFile, fontSize, marginBottom }) =>
  [
    `drawtext=fontfile='${fontFile}'`,
    `textfile='${textFile}'`,
    'expansion=none',
    'fontcolor=white',
    `fontsize=${fontSize}`,
    'line_spacing=14',
    'box=1',
    'boxcolor=black@0.45',
    'boxborderw=30',
    'x=(w-text_w)/2',
    `y=h-text_h-${marginBottom}`,
  ].join(':');

// Monta o filtergraph de um slide (Ken Burns + texto) para um formato.
const buildSlideFilter = ({ format, durationMs, textFile, fontFile }) => {
  const frames = framesFor(durationMs);
  const { ZOOM_MAX, UPSCALE, BLUR, FPS } = INSTAGRAM_VIDEO;
  const incr = ((ZOOM_MAX - 1) / frames).toFixed(6);
  const zoom = `z='min(zoom+${incr},${ZOOM_MAX})'`;
  const center = `x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`;

  if (format.key === 'square') {
    const up = format.width * UPSCALE;
    const fontSize = 52;
    const text = textFile
      ? `,${drawtextFilter({ textFile, fontFile, fontSize, marginBottom: 110 })}`
      : '';
    return (
      `[0:v]scale=${up}:${up}:force_original_aspect_ratio=increase,crop=${up}:${up},` +
      `zoompan=${zoom}:${center}:d=${frames}:s=${format.width}x${format.height}:fps=${FPS}` +
      `${text},format=yuv420p[v]`
    );
  }

  // vertical 9:16: fundo desfocado animado + imagem quadrada centralizada
  const fgUp = format.width * UPSCALE;
  const bgZoom = `z='min(zoom+${(0.05 / frames).toFixed(6)},1.05)'`;
  const fontSize = 58;
  const text = textFile
    ? `,${drawtextFilter({ textFile, fontFile, fontSize, marginBottom: 320 })}`
    : '';
  return (
    `[0:v]split=2[a][b];` +
    `[a]scale=${format.width}:${format.height}:force_original_aspect_ratio=increase,` +
    `crop=${format.width}:${format.height},` +
    `zoompan=${bgZoom}:d=${frames}:s=${format.width}x${format.height}:fps=${FPS},` +
    `boxblur=${BLUR}:1[bg];` +
    `[b]scale=${fgUp}:${fgUp}:force_original_aspect_ratio=increase,crop=${fgUp}:${fgUp},` +
    `zoompan=${zoom}:${center}:d=${frames}:s=${format.width}x${format.width}:fps=${FPS}[fg];` +
    `[bg][fg]overlay=(W-w)/2:(H-h)/2${text},format=yuv420p[v]`
  );
};

// Renderiza um clipe de slide (sem áudio) para um formato.
export const renderSlideClip = async ({ image, durationMs, format, textFile, fontFile, output }) => {
  await run(FFMPEG, [
    '-y',
    '-i', image,
    '-filter_complex', buildSlideFilter({ format, durationMs, textFile, fontFile }),
    '-map', '[v]',
    '-r', String(INSTAGRAM_VIDEO.FPS),
    '-an',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
    '-pix_fmt', 'yuv420p',
    output,
  ]);
  return output;
};

// Concatena os clipes (mesmos codecs/dimensões) num vídeo só, sem reencodar.
export const concatClips = async (files, listFile, output) => {
  const list = files.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n');
  await writeFile(listFile, list, 'utf8');
  await run(FFMPEG, [
    '-y',
    '-f', 'concat', '-safe', '0',
    '-i', listFile,
    '-c', 'copy',
    output,
  ]);
  return output;
};

// Junta o vídeo (mudo) com a trilha de áudio final.
export const muxVideoAudio = async (video, audio, output) => {
  await run(FFMPEG, [
    '-y',
    '-i', video,
    '-i', audio,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '160k',
    '-shortest',
    '-movflags', '+faststart',
    output,
  ]);
  return output;
};
