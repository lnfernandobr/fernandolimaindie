import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../config/env.js';
import { MEDIA_ERRORS } from '../../constants/media.js';

const buildClient = () => {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_S3_BUCKET) {
    throw new Error(MEDIA_ERRORS.S3_NOT_CONFIGURED);
  }
  return new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
};

// URL assinada (temporária) de GET — deixa serviços externos (ex: fal.ai) baixarem um
// objeto privado do S3 sem tornar o bucket público.
export const presignedGetUrl = (key, expiresIn = 600) =>
  getSignedUrl(buildClient(), new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }), {
    expiresIn,
  });

// URL pública de um objeto no S3 (usada, por ex., pra passar a imagem pro i2v da fal.ai).
export const publicUrl = (key) => {
  const base = env.AWS_S3_PUBLIC_URL
    ? env.AWS_S3_PUBLIC_URL.replace(/\/$/, '')
    : `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`;
  return `${base}/${key}`;
};

export const uploadBuffer = async ({ key, buffer, contentType }) => {
  const client = buildClient();
  await client.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  return publicUrl(key);
};

// Baixa um objeto do S3 como Buffer; devolve null se a chave não existir.
export const downloadBuffer = async (key) => {
  const client = buildClient();
  try {
    const res = await client.send(
      new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }),
    );
    const chunks = [];
    for await (const chunk of res.Body) chunks.push(chunk);
    return Buffer.concat(chunks);
  } catch (err) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) return null;
    throw err;
  }
};
