const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_BUCKET_NAME;

if (!REGION || !BUCKET) {
  // eslint-disable-next-line no-console
  console.warn('AWS_REGION or AWS_BUCKET_NAME is not set. S3 uploads will fail until configured.');
}

const s3Client = new S3Client({
  region: REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

async function uploadProductImage({ buffer, originalName, mimeType }) {
  if (!buffer) {
    throw new Error('File buffer is required for upload');
  }

  const ext = path.extname(originalName || '').toLowerCase() || '.jpg';
  const key = `products/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType || 'application/octet-stream',
  });

  await s3Client.send(command);

  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  return url;
}

module.exports = {
  uploadProductImage,
};

