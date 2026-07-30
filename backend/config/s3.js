import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

export const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
export const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
export const AWS_S3_ENDPOINT = process.env.AWS_S3_ENDPOINT || null;

/**
 * Validates whether AWS S3 credentials and bucket name are fully configured.
 * @returns {boolean} True if S3 environment variables are active.
 */
export const isS3Configured = () => {
  return Boolean(
    AWS_S3_BUCKET_NAME &&
      AWS_ACCESS_KEY_ID &&
      AWS_SECRET_ACCESS_KEY &&
      !AWS_ACCESS_KEY_ID.includes('placeholder') &&
      !AWS_SECRET_ACCESS_KEY.includes('placeholder')
  );
};

/**
 * AWS SDK v3 S3 Client Singleton Instance
 */
export const s3Client = isS3Configured()
  ? new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      },
      ...(AWS_S3_ENDPOINT ? { endpoint: AWS_S3_ENDPOINT, forcePathStyle: true } : {})
    })
  : null;
