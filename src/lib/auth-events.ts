
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
        data: {
          studentId: user.id,
          action: "verify",
          link: `/admin/students?search=${user.email}` 
        },
        push: {
            title: "New Student Registration",
            body: `A new student has registered: ${user.firstName || user.name}`
        },
        // Optional: Send email to admin too?
        email: {
            to: admin.email,
            subject: "New Student Registration Pending Approval",
            html: `
                <p>Hello Admin,</p>
                <p>A new student has registered and is awaiting verification.</p>
                <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><a href="${process.env.NEXTAUTH_URL}/admin/students">Manually Verify User</a></p>
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
