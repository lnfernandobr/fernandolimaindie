import { existsSync, readFileSync } from 'node:fs';

// Cliente mínimo da API de fila da fal.ai (compartilhado por i2v e geração de imagem).
const FAL_BASE = 'https://queue.fal.run';
const KEY_FILE = process.env.FAL_KEY_FILE || '/opt/media/secrets/fal.key';
const POLL_MS = 5000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

// Lê um arquivo de config simples no host (ex: i2v_model, image_model) com fallback a env.
export const readConfigFile = (file, envName, fallback) => {
  try {
    if (existsSync(file)) {
      const v = readFileSync(file, 'utf8').trim().toLowerCase();
      if (v) return v;
    }
  } catch {
    /* ignora */
  }
  return (process.env[envName] || fallback || '').toLowerCase();
};

// Submete um job, faz poll até COMPLETED e devolve o JSON do resultado.
export const runFalJob = async (modelId, body, { timeoutMs = 6 * 60 * 1000 } = {}) => {
  const key = resolveFalKey();
  if (!key) throw new Error('FAL_KEY ausente');
  const auth = { Authorization: `Key ${key}` };

  const submit = await fetch(`${FAL_BASE}/${modelId}`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!submit.ok) throw new Error(`fal submit ${submit.status}: ${(await submit.text()).slice(0, 160)}`);
  const sd = await submit.json();
  const id = sd?.request_id;
  if (!id) throw new Error('fal: sem request_id');

  const statusUrl = sd.status_url || `${FAL_BASE}/${modelId}/requests/${id}/status`;
  const resultUrl = sd.response_url || `${FAL_BASE}/${modelId}/requests/${id}`;
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (Date.now() > deadline) throw new Error('fal: timeout');
    await sleep(POLL_MS);
    const st = await fetch(statusUrl, { headers: auth }).catch(() => null);
    if (!st?.ok) continue;
    const s = await st.json().catch(() => ({}));
    if (s.status === 'COMPLETED') break;
    if (s.status === 'FAILED' || s.status === 'ERROR') throw new Error(`fal: job ${s.status}`);
  }

  const res = await fetch(resultUrl, { headers: auth });
  if (!res.ok) throw new Error(`fal result ${res.status}`);
  return res.json();
};

export const downloadFalFile = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download fal ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
};
