import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Storage local de imagens geradas.
 *
 * Pasta: `apps/api/uploads/` (gitignored). Servida pelo Express como
 * rota estática `/uploads/*`. Em produção, Caddy faz reverse proxy
 * naturalmente.
 *
 * Tradeoff conhecido: ao trocar de instância (Lightsail down, snapshot,
 * migração), as imagens ficam pra trás. Pra produção em escala, trocar
 * pra S3/Cloudinary mexendo só nesta função.
 */

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

export async function ensureUploadsDir(): Promise<void> {
  await mkdir(UPLOADS_DIR, { recursive: true });
}

export function uploadsDir(): string {
  return UPLOADS_DIR;
}

/**
 * Salva um buffer de imagem em /uploads/<hash>.<ext> e retorna a URL pública.
 */
export async function saveImageBuffer(
  buffer: Buffer,
  ext: 'png' | 'jpg' | 'webp' = 'png',
): Promise<{ filename: string; publicUrl: string; sizeBytes: number }> {
  await ensureUploadsDir();
  const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 16);
  const filename = `${Date.now()}-${hash}.${ext}`;
  const fullPath = path.join(UPLOADS_DIR, filename);
  await writeFile(fullPath, buffer);

  const publicBase = (env.PUBLIC_API_URL || `http://localhost:${env.API_PORT}`).replace(/\/$/, '');
  const publicUrl = `${publicBase}/uploads/${filename}`;

  logger.debug({ filename, sizeBytes: buffer.byteLength }, 'image saved to uploads');
  return { filename, publicUrl, sizeBytes: buffer.byteLength };
}
