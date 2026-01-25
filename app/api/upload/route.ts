import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, getContentType } from '@/lib/do-spaces';
import { authenticate } from '@/lib/auth-middleware';

/**
 * POST /api/upload
 * 
 * Unified file upload endpoint using DigitalOcean Spaces.
 * All files are uploaded as public.
 * 
 * Form data:
 * - file: The file to upload
 * - folder: (optional) The folder/category for organization (default: 'uploads')
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    await authenticate(request);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get content type
    const contentType = file.type || getContentType(file.name);

    // Upload to DO Spaces
    const result = await uploadFile(buffer, folder, file.name, contentType);

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        key: result.key,
        filename: file.name,
        size: file.size,
        contentType,
      },
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}

// Handle client-side upload token generation (for backwards compatibility)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Use POST to upload files' },
    { status: 405 }
  );
}
