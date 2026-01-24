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

    // 1. Create the report record as PENDING
    const report = await prisma.systemReport.create({
      data: {
        name,
        type,
        format,
        status: 'PENDING',
        url: '#', // Initial placeholder
        generatedById: payload.userId
      }
    });

    // 2. Simulate an async generation process
    // In a real environment, this would be a background job / Celery task
    (async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate work
            await prisma.systemReport.update({
                where: { id: report.id },
                data: {
                    status: 'READY',
                    url: `/api/admin/reports/download/${report.id}` // Simulated download path
                }
            });
            console.log(`✅ Report ${report.id} is now READY`);
        } catch (err) {
            console.error(`❌ Failed to finalize report ${report.id}:`, err);
        }
    })();

    // 3. Return the pending record immediately
    return successResponse(report, 'Report generation started (Pending)', 201);
  } catch (error) {
    console.error('Generate report error:', error);
    return errors.internal('Failed to generate report');
  }
}
