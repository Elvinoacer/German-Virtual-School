import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file to Cloudinary
 * @param file - The file buffer to upload
 * @param folder - The folder path (e.g., 'avatars', 'assignments', 'resources')
 * @param originalFilename - The original filename (used for public_id if needed, or metadata)
 * @param contentType - The MIME type of the file
 * @returns The public URL and key (public_id) of the uploaded file
 */
export async function uploadFile(
  file: Buffer,
  folder: string,
  originalFilename: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  
  return new Promise((resolve, reject) => {
    // Generate a unique public_id (optional, Cloudinary can do this but let's control it slightly or just let Cloudinary handle it)
    // We'll let Cloudinary generate a unique ID but put it in the correct folder.
    // To keep original name, we can use `use_filename: true` and `unique_filename: true`
    
    // Determine resource type based on content type
    let resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto';
    if (contentType.startsWith('image/')) resourceType = 'image';
    else if (contentType.startsWith('video/')) resourceType = 'video';
    else resourceType = 'raw'; // For PDFs, Docs, etc. 'raw' is often safer for non-media, or 'auto' might detect it as 'image' (pdf). 
    // Cloudinary 'auto' is good but sometimes PDFs are treated as images. For documents, 'raw' or 'auto' is fine.
    // Let's use 'auto' which is generally smart enough, or 'raw' for specific non-media types if needed.
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        filename_override: originalFilename // Keeps the original name in metadata/URL generation if possible
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(new Error(error.message || 'Cloudinary upload failed'));
        }
        if (!result) {
          return reject(new Error('Cloudinary upload returned no result'));
        }
        
        resolve({
          url: result.secure_url,
          key: result.public_id
        });
      }
    );

    uploadStream.end(file);
  });
}

/**
 * Delete a file from Cloudinary
 * @param keyOrUrl - The key (public_id) or full URL of the file to delete
 */
export async function deleteFile(keyOrUrl: string): Promise<void> {
  let publicId = keyOrUrl;

  // Extract public_id from URL if a full URL is provided
  // Cloudinary URLs: https://res.cloudinary.com/<cloud_name>/<resource_type>/upload/v<version>/<public_id>.<ext>
  // This is complex to parse reliably with regex for all cases, so passing the public_id (key) is preferred.
  // However, for backward compatibility or ease, we try to extract it.
  if (keyOrUrl.startsWith('http')) {
      try {
        const parts = keyOrUrl.split('/upload/');
        if (parts.length > 1) {
            // content after /upload/ (usually has v12345/folder/id.ext or just folder/id.ext)
            let path = parts[1];
            // Remove version if present (v1234...)
            path = path.replace(/^v\d+\//, '');
            // Remove extension
            publicId = path.substring(0, path.lastIndexOf('.'));
        }
      } catch (e) {
          console.warn('Failed to parse Cloudinary URL for deletion, using as-is:', e);
      }
  }

  // We need to know resource_type for deletion (image, video, raw). 
  // We'll try 'image' first (default), but if we don't track it, it might fail for videos/raw.
  // Ideally, the caller knows the type or we store it. 
  // For now, we default to 'image' or allow API to try getting it. 
  // Cloudinary destroy API defaults to image.
  
  try {
      await cloudinary.uploader.destroy(publicId);
  } catch (error) {
       console.error('Cloudinary delete error (image):', error);
       // Retry as video or raw if needed? For now, just log.
  }
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
