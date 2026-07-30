import { PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  s3Client,
  isS3Configured,
  AWS_S3_BUCKET_NAME,
  AWS_REGION,
  AWS_S3_ENDPOINT
} from '../config/s3.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_INVOICES_DIR = path.join(__dirname, '..', 'invoices');

if (!fs.existsSync(LOCAL_INVOICES_DIR)) {
  fs.mkdirSync(LOCAL_INVOICES_DIR, { recursive: true });
}

/**
 * -----------------------------------------------------------------------------
 * ☁️ STORAGE SERVICE — CLEAN ARCHITECTURE STORAGE PROVIDER
 * -----------------------------------------------------------------------------
 * Encapsulates object storage operations. Primary target: AWS S3.
 * Supports automatic fallback to local disk storage when AWS S3 is not configured
 * (e.g. offline sandbox or unit testing environments).
 */
export class StorageService {
  /**
   * Uploads an invoice PDF buffer to AWS S3 or fallback local storage.
   * 
   * @param {Buffer} fileBuffer - The PDF binary buffer
   * @param {string} key - S3 Key / Filename (e.g. `invoices/invoice_ORDER_ID.pdf`)
   * @param {string} contentType - MIME type (default `application/pdf`)
   * @returns {Promise<{ invoiceUrl: string, storageProvider: 'AWS_S3' | 'LOCAL' }>}
   */
  static async uploadInvoice(fileBuffer, key, contentType = 'application/pdf') {
    const fileName = path.basename(key);

    if (isS3Configured() && s3Client) {
      try {
        console.log(`☁️ [S3 Storage Service] Uploading ${key} to AWS S3 bucket "${AWS_S3_BUCKET_NAME}"...`);

        const uploadCommand = new PutObjectCommand({
          Bucket: AWS_S3_BUCKET_NAME,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
          ContentDisposition: `inline; filename="${fileName}"`
        });

        await s3Client.send(uploadCommand);

        // Construct public URL based on S3 configuration
        let s3Url;
        if (AWS_S3_ENDPOINT) {
          s3Url = `${AWS_S3_ENDPOINT}/${AWS_S3_BUCKET_NAME}/${key}`;
        } else {
          s3Url = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
        }

        console.log(`✅ [S3 Storage Service] Successfully uploaded to AWS S3: ${s3Url}`);
        return {
          invoiceUrl: s3Url,
          storageProvider: 'AWS_S3'
        };
      } catch (s3Error) {
        console.error(`💥 [S3 Storage Service Error]: Upload failed: ${s3Error.message}. Falling back to local storage...`);
      }
    } else {
      console.log(`ℹ️ [Storage Service] AWS S3 credentials not present in .env. Storing invoice locally in sandbox mode...`);
    }

    // Fallback: Store locally
    const localFilePath = path.join(LOCAL_INVOICES_DIR, fileName);
    fs.writeFileSync(localFilePath, fileBuffer);

    const backendPort = process.env.PORT || 5000;
    const localUrl = `http://127.0.0.1:${backendPort}/api/orders/invoice/${fileName.replace('invoice_', '').replace('.pdf', '')}`;

    console.log(`📁 [Storage Service] Saved locally at ${localFilePath}`);
    return {
      invoiceUrl: localUrl,
      storageProvider: 'LOCAL'
    };
  }
}
