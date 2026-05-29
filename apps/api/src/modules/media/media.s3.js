import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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
  const base = env.AWS_S3_PUBLIC_URL
    ? env.AWS_S3_PUBLIC_URL.replace(/\/$/, '')
    : `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`;
  return `${base}/${key}`;
};
