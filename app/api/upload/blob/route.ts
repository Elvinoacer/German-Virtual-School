import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth.config";

// Maximum file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Allowed document types
const ALLOWED_DOCUMENT_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  // Images (for thumbnails/attachments)
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
];

// Blocked file extensions (security)
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.jar',
  '.msi', '.dll', '.scr', '.pif', '.application', '.gadget'
];

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();

  if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'STUDENT' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  // Check for blocked extensions
  const lowerFilename = filename.toLowerCase();
  const isBlocked = BLOCKED_EXTENSIONS.some(ext => lowerFilename.endsWith(ext));
  if (isBlocked) {
    console.warn(`[UPLOAD] Blocked file type attempt: ${filename} by user ${session.user.id}`);
    return NextResponse.json({ 
      error: 'File type not allowed for security reasons' 
    }, { status: 400 });
  }

  // Get content-type and content-length headers
  const contentType = request.headers.get('content-type');
  const contentLength = request.headers.get('content-length');

  // Validate file size if content-length is provided
  if (contentLength) {
    const fileSize = parseInt(contentLength, 10);
    if (fileSize > MAX_FILE_SIZE) {
      console.warn(`[UPLOAD] File too large: ${filename} (${Math.round(fileSize / 1024 / 1024)}MB) by user ${session.user.id}`);
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        maxSize: MAX_FILE_SIZE,
        yourSize: fileSize
      }, { status: 413 });
    }
  }

  // Validate content type (optional - some browsers may not send it correctly)
  if (contentType && !ALLOWED_DOCUMENT_TYPES.includes(contentType)) {
    // Don't block, just log - content-type can be unreliable
    console.log(`[UPLOAD] Unusual content-type: ${contentType} for ${filename}`);
  }

  try {
    console.log(`[UPLOAD] Starting upload: ${filename} (${contentLength ? Math.round(parseInt(contentLength) / 1024) + 'KB' : 'unknown size'}) by user ${session.user.id}`);

    const blob = await put(filename, request.body!, {
      access: 'public',
      addRandomSuffix: true,
    });

    console.log(`[UPLOAD] Complete: ${filename} -> ${blob.url}`);

    return NextResponse.json({
      ...blob,
      uploadedBy: session.user.id,
      uploadedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[UPLOAD] Error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'Upload failed';
    if (error.message?.includes('size')) {
      errorMessage = 'File too large for upload';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Upload timed out. Please try again with a stable connection.';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
