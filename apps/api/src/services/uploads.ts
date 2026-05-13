import { createHash } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Storage de imagens geradas pela camada de IA.
 *
 * Dois modos:
 *  - **S3** (produção): set `UPLOADS_S3_BUCKET`. Salva em S3 e retorna URL pública.
 *    Sobrevive a redeploy/snapshot. Recomendado pra prod por causa do TikTok
 *    PULL_FROM_URL (URL precisa estar disponível em qualquer hora).
 *  - **Disco local** (dev / fallback): salva em `apps/api/uploads/` e serve via
 *    rota estática `/uploads/*`. Cache 30d (hashes imutáveis no nome).
 *
 * O módulo expõe a mesma API (`saveImageBuffer`, `loadImageBuffer`) em ambos
 * os modos pra que steps da pipeline não precisem saber qual está em uso.
 */

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const useS3 = !!env.UPLOADS_S3_BUCKET;

let s3Client: S3Client | null = null;
function getS3(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: env.UPLOADS_S3_REGION ?? 'us-east-1',
      // Em VPS com IAM role anexada, credenciais vêm automaticamente.
      // Em dev/CI, usa AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY do .env.
      ...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
        ? {
            credentials: {
              accessKeyId: env.AWS_ACCESS_KEY_ID,
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            },
          }
        : {}),
    });
  }
  return s3Client;
}

export async function ensureUploadsDir(): Promise<void> {
  if (useS3) return; // S3 não precisa de pasta local
  await mkdir(UPLOADS_DIR, { recursive: true });
}

export function uploadsDir(): string {
  return UPLOADS_DIR;
}

export function isUsingS3(): boolean {
  return useS3;
}

function publicUrlFor(filename: string): string {
  if (useS3) {
    // Se o usuário tem CDN/CloudFront, aponta `UPLOADS_PUBLIC_BASE_URL` pra lá.
    // Senão, URL direta do bucket S3 (precisa ter Block Public Access desligado
    // e bucket policy permitindo GetObject público).
    const base =
      env.UPLOADS_PUBLIC_BASE_URL?.replace(/\/$/, '') ??
      `https://${env.UPLOADS_S3_BUCKET}.s3.${env.UPLOADS_S3_REGION ?? 'us-east-1'}.amazonaws.com`;
    return `${base}/${filename}`;
  }
  const publicBase = (env.PUBLIC_API_URL || `http://localhost:${env.API_PORT}`).replace(/\/$/, '');
  return `${publicBase}/uploads/${filename}`;
}

/**
 * Salva um buffer de imagem e retorna a URL pública.
 */
export async function saveImageBuffer(
  buffer: Buffer,
  ext: 'png' | 'jpg' | 'webp' = 'png',
): Promise<{ filename: string; publicUrl: string; sizeBytes: number }> {
  const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 16);
  const filename = `${Date.now()}-${hash}.${ext}`;
  const contentType = ext === 'jpg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';

  if (useS3) {
    await getS3().send(
      new PutObjectCommand({
        Bucket: env.UPLOADS_S3_BUCKET!,
        Key: filename,
        Body: buffer,
        ContentType: contentType,
        // 30 dias de cache — hashes no nome tornam o arquivo imutável.
        CacheControl: 'public, max-age=2592000, immutable',
      }),
    );
    logger.debug({ filename, sizeBytes: buffer.byteLength, storage: 's3' }, 'image saved');
  } else {
    await ensureUploadsDir();
    await writeFile(path.join(UPLOADS_DIR, filename), buffer);
    logger.debug({ filename, sizeBytes: buffer.byteLength, storage: 'disk' }, 'image saved');
  }

  return { filename, publicUrl: publicUrlFor(filename), sizeBytes: buffer.byteLength };
}

/**
 * Lê bytes de uma imagem previamente salva. Aceita filename (S3 key) ou
 * caminho local absoluto (compat com posts antigos que armazenavam `localPath`).
 */
export async function loadImageBuffer(
  filenameOrPath: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  if (useS3) {
    const filename = filenameOrPath.includes('/') ? path.basename(filenameOrPath) : filenameOrPath;
    const out = await getS3().send(
      new GetObjectCommand({ Bucket: env.UPLOADS_S3_BUCKET!, Key: filename }),
    );
    const chunks: Uint8Array[] = [];
    for await (const chunk of out.Body as AsyncIterable<Uint8Array>) chunks.push(chunk);
    return {
      buffer: Buffer.concat(chunks),
      contentType: out.ContentType ?? 'image/png',
    };
  }
  const fullPath = filenameOrPath.startsWith('/')
    ? filenameOrPath
    : path.join(UPLOADS_DIR, filenameOrPath);
  const buffer = await readFile(fullPath);
  const contentType = fullPath.endsWith('.png')
    ? 'image/png'
    : fullPath.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg';
  return { buffer, contentType };
}
