import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';

// Configure S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION || 'sfo3',
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY!,
  },
  forcePathStyle: false, // DO Spaces uses virtual-hosted style
});

const BUCKET = process.env.DO_SPACES_BUCKET || 'gvs-file-store';

/**
 * Generate a unique filename to prevent collisions
 */
function generateUniqueFilename(originalName: string): string {
  const ext = originalName.split('.').pop() || '';
  const uniqueId = randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${uniqueId}.${ext}`;
}

/**
 * Upload a file to DigitalOcean Spaces
 * @param file - The file buffer to upload
 * @param folder - The folder path (e.g., 'avatars', 'assignments', 'resources')
 * @param originalFilename - The original filename (used for extension)
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  file: Buffer,
  folder: string,
  originalFilename: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  const filename = generateUniqueFilename(originalFilename);
  const key = `${folder}/${filename}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read', // Make the file publicly accessible
    })
  );

  // Construct the public URL
  // Format: https://bucket.region.digitaloceanspaces.com/key
  const url = `https://${BUCKET}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/${key}`;

  return { url, key };
}

/**
 * Delete a file from DigitalOcean Spaces
 * @param keyOrUrl - The key or full URL of the file to delete
 */
export async function deleteFile(keyOrUrl: string): Promise<void> {
  // Extract key from URL if a full URL is provided
  let key = keyOrUrl;
  if (keyOrUrl.startsWith('http')) {
    const urlParts = keyOrUrl.split('.digitaloceanspaces.com/');
    if (urlParts.length > 1) {
      key = urlParts[1];
    }
  }

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

/**
 * Get content type from filename extension
 */
export function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    // Videos
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    // Archives
    zip: 'application/zip',
    rar: 'application/vnd.rar',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
