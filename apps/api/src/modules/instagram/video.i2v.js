import { existsSync, readFileSync } from 'node:fs';
import { logger } from '../../config/logger.js';

// Image-to-video via API de fila da fal.ai. Sem dependência nova.
const FAL_BASE = 'https://queue.fal.run';
const KEY_FILE = process.env.FAL_KEY_FILE || '/opt/media/secrets/fal.key';
const POLL_MS = 6000;
const TIMEOUT_MS = 6 * 60 * 1000; // i2v pode levar minutos

const DEFAULT_PROMPT =
  'subtle cinematic motion, gentle parallax, slow and smooth camera, calm and reverent, no warping';

// Modelos suportados. Trocar via env I2V_MODEL (default: kling). LTX é mais barato
// (mas deprecated — usar só pra validar). Kling 1.6 std é o de produção.
const MODELS = {
  kling: {
    id: 'fal-ai/kling-video/v1.6/standard/image-to-video',
    body: ({ imageUrl, prompt, durationMs }) => ({
      image_url: imageUrl,
      prompt: prompt || DEFAULT_PROMPT,
      duration: durationMs > 6000 ? '10' : '5',
    }),
  },
  ltx: {
    id: 'fal-ai/ltx-video-v095/image-to-video',
    body: ({ imageUrl, prompt, aspect }) => ({
      image_url: imageUrl,
      prompt: prompt || DEFAULT_PROMPT,
      resolution: '720p',
      aspect_ratio: aspect === 'vertical' ? '9:16' : '16:9',
    }),
  },
};
// Modelo ativo: lê de um arquivo no host (troca LTX<->Kling sem deploy) ou de I2V_MODEL.
const MODEL_FILE = process.env.I2V_MODEL_FILE || '/opt/media/secrets/i2v_model';
const activeModelKey = () => {
  try {
    if (existsSync(MODEL_FILE)) {
      const m = readFileSync(MODEL_FILE, 'utf8').trim().toLowerCase();
      if (MODELS[m]) return m;
    }
  } catch {
    /* ignora */
  }
  const env = (process.env.I2V_MODEL || '').toLowerCase();
  return MODELS[env] ? env : 'kling';
};
const activeModel = () => MODELS[activeModelKey()];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const auth = (key) => ({ Authorization: `Key ${key}` });

// A chave vem de um arquivo protegido no host (precedência) ou de FAL_KEY no ambiente.
export const resolveFalKey = () => {
  try {
    if (existsSync(KEY_FILE)) {
      const k = readFileSync(KEY_FILE, 'utf8').trim();
      if (k) return k;
    }
  } catch {
    /* sem acesso ao arquivo — cai no env */
  }
  return process.env.FAL_KEY || '';
};

export const hasFal = () => !!resolveFalKey();

// Anima uma imagem (URL pública) num clipe MP4 (buffer). Lança em qualquer falha —
// o pipeline trata e cai no Ken Burns.
export const generateHookClip = async ({ imageUrl, prompt, durationMs, aspect }) => {
  const key = resolveFalKey();
  if (!key) throw new Error('FAL_KEY ausente');
  const model = activeModel();

  const submit = await fetch(`${FAL_BASE}/${model.id}`, {
    method: 'POST',
    headers: { ...auth(key), 'Content-Type': 'application/json' },
    body: JSON.stringify(model.body({ imageUrl, prompt, durationMs, aspect })),
  });
  if (!submit.ok) throw new Error(`fal submit ${submit.status}: ${(await submit.text()).slice(0, 160)}`);
  const submitData = await submit.json();
  const id = submitData?.request_id;
  if (!id) throw new Error('fal: sem request_id');

  // Usa as URLs que a fal RETORNA (construí-las na mão quebra o poll).
  const statusUrl = submitData.status_url || `${FAL_BASE}/${model.id}/requests/${id}/status`;
  const resultUrl = submitData.response_url || `${FAL_BASE}/${model.id}/requests/${id}`;
  const deadline = Date.now() + TIMEOUT_MS;
  for (;;) {
    if (Date.now() > deadline) throw new Error('fal: timeout');
    await sleep(POLL_MS);
    const st = await fetch(statusUrl, { headers: auth(key) }).catch(() => null);
    if (!st?.ok) continue;
    const s = await st.json().catch(() => ({}));
    if (s.status === 'COMPLETED') break;
    if (s.status === 'FAILED' || s.status === 'ERROR') throw new Error(`fal: job ${s.status}`);
  }

  const res = await fetch(resultUrl, { headers: auth(key) });
  if (!res.ok) throw new Error(`fal result ${res.status}`);
  const data = await res.json();
  const url = data?.video?.url;
  if (!url) throw new Error('fal: sem video.url');
  const vid = await fetch(url);
  if (!vid.ok) throw new Error(`download i2v ${vid.status}`);
  logger.info({ model: model.id }, 'i2v hook gerado');
  return Buffer.from(await vid.arrayBuffer());
};
