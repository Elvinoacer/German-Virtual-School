
import "server-only";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications/orchestrator";
import { User } from "next-auth";

export async function notifyAdminsOfNewUser(user: User) {
  try {
    console.log(`[AuthEvents] Processing new user notification for: ${user.email}`);
    
    // 1. Find all admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, email: true }
    });

    if (admins.length === 0) {
      console.warn("[AuthEvents] No admins found to notify.");
      return;
    }

    console.log(`[AuthEvents] Found ${admins.length} admins to notify.`);

    // 2. Send notification to each admin
    const notificationPromises = admins.map(admin => {
      return notify({
        userId: admin.id,
        type: "INFO", // Using INFO as generic type
        title: "New Student Registration",
        message: `A new student has registered: ${user.firstName || user.name || user.email}. Pending verification.`,
        metadata: {
          studentId: user.id,
          action: "verify",
          link: `/admin/students?search=${user.email}` 
        },
        push: {
            data: {
              title: "New Student Registration",
              body: `A new student has registered: ${user.firstName || user.name}`
            }
        },
        // Optional: Send email to admin too?
        email: {
            to: admin.email,
            subject: "🎓 New Student Registration Pending Approval",
            html: `
                <div style="margin-bottom: 24px;">
                  <h1 style="color: #1a1a2e; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">
                    New Student Registration
                  </h1>
                  <p style="color: #64748b; font-size: 14px; margin: 0;">
                    A new student has registered and is awaiting your verification.
                  </p>
                </div>
                
                <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #667eea;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 100px;">Name</td>
                      <td style="padding: 8px 0; color: #1a1a2e; font-size: 14px; font-weight: 600;">${user.firstName || ''} ${user.lastName || ''}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
                      <td style="padding: 8px 0; color: #1a1a2e; font-size: 14px; font-weight: 600;">${user.email}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Status</td>
                      <td style="padding: 8px 0;">
                        <span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px;">
                          Pending Verification
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <div style="text-align: center; margin-top: 32px;">
                  <a href="${process.env.NEXTAUTH_URL}/admin/students?search=${encodeURIComponent(user.email || '')}" 
                     style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.35);">
                    Verify Student →
                  </a>
                </div>
            `
        }
      });
    });

    await Promise.allSettled(notificationPromises);
    console.log("[AuthEvents] Notifications sent to admins.");

  } catch (error) {
    console.error("[AuthEvents] Failed to notify admins:", error);
  }
}
