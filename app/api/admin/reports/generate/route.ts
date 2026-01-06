import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'ADMIN') return errors.forbidden('Access denied');

    const body = await request.json();
    const { name, type, format } = body;

    if (!name || !type || !format) {
      return errors.badRequest('Missing required fields');
    }

    // In a real app, this would trigger an async job to generate the file.
    // For now, we'll simulate success and create a record.
    const report = await prisma.systemReport.create({
      data: {
        name,
        type,
        format,
        status: 'READY',
        url: '#', // Placeholder for the actual file link
        generatedById: payload.userId
      }
    });

    return successResponse(report, 'Report generated successfully', 201);
  } catch (error) {
    console.error('Generate report error:', error);
    return errors.internal('Failed to generate report');
  }
}
