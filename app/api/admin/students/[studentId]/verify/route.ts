import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit';
import { notify } from '@/lib/notifications/orchestrator';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const payload = await authenticate(request);
    
    // Ensure only admins access this
    if (payload.role !== 'ADMIN') {
      return errors.forbidden('Access denied');
    }

    const { studentId } = await params;

    const student = await prisma.user.findUnique({
      where: { id: studentId, role: 'STUDENT' }
    });

    if (!student) {
      return errors.notFound('Student');
    }

    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: { isVerified: true },
      select: {
         id: true,
         firstName: true,
         lastName: true,
         isVerified: true
      }
    });

    // Audit log the verification
    await createAuditLog({
      userId: payload.userId,
      action: "VERIFY",
      entity: "Student",
      entityId: studentId,
      details: { studentName: `${updatedStudent.firstName} ${updatedStudent.lastName}` }
    });

    // Notify the student
    await notify({
      userId: studentId,
      type: "SUCCESS",
      title: "Account Verified",
      message: "Your account has been verified! Please log out and log in again to access the dashboard.",
      email: {
        subject: "Your Account is Verified - German Virtual School",
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h1 style="color: #0d121b;">You are verified! 🎉</h1>
            <p>Hello ${updatedStudent.firstName},</p>
            <p>Your student account has been approved by the administration.</p>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #166534;">⚠️ Action Required</p>
              <p style="margin: 8px 0 0;">To update your access permissions, please <strong>Log Out</strong> and then <strong>Log In</strong> again.</p>
            </div>
            <p>You can now access your dashboard and enrolled courses.</p>
            <a href="${process.env.NEXTAUTH_URL}/login" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Login</a>
          </div>
        `
      }
    });

    return successResponse(updatedStudent, 'Student verified successfully');

  } catch (error) {
    console.error('Verify student error:', error);
    return errors.internal('Failed to verify student');
  }
}

