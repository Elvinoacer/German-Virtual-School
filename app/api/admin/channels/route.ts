import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";
import { notify } from "@/lib/notifications/orchestrator";
import { UserRole } from "@/generated/prisma/client";

// GET - List all channels (admin view, includes inactive)
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== "ADMIN") {
      return errors.forbidden("Only admins can view all channels");
    }

    const channels = await prisma.communicationChannel.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return successResponse({ channels }, "Channels retrieved successfully");
  } catch (error) {
    console.error("Get channels error:", error);
    return errors.internal("Failed to retrieve channels");
  }
}

// POST - Create new channel (admin only)
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    if (payload.role !== "ADMIN") {
      return errors.forbidden("Only admins can create channels");
    }

    const body = await request.json();
    const { name, type, link, description, iconUrl } = body;

    if (!name || !type || !link) {
      return errors.badRequest("Name, type, and link are required");
    }

    // Validate channel type
    const validTypes = [
      "WHATSAPP",
      "TELEGRAM",
      "DISCORD",
      "FACEBOOK",
      "INSTAGRAM",
      "TWITTER",
      "OTHER",
    ];
    if (!validTypes.includes(type.toUpperCase())) {
      return errors.badRequest(`Invalid channel type. Valid types: ${validTypes.join(", ")}`);
    }

    // Create the channel
    const channel = await prisma.communicationChannel.create({
      data: {
        name,
        type: type.toUpperCase(),
        link,
        description,
        iconUrl,
        createdById: payload.userId,
      },
    });

    // Broadcast notification to all students about the new channel
    const students = await prisma.user.findMany({
      where: { role: UserRole.STUDENT, isVerified: true },
      select: { id: true, email: true, fcmTokens: true },
    });

    console.log(`[Channels] Broadcasting new channel to ${students.length} students`);

    // Send notifications in parallel
    const notifications = students.map((student) =>
      notify({
        userId: student.id,
        title: "🎉 New Communication Channel Available!",
        message: `Join our ${name} ${type.toLowerCase()} group to connect with fellow students and receive updates.`,
        type: "INFO",
        email: {
          to: student.email,
          subject: `📢 New ${type} Channel: ${name}`,
          html: `
            <h2 style="color: #1a4d8f;">New Communication Channel Available!</h2>
            <p>Hello!</p>
            <p>We've created a new <strong>${name}</strong> ${type.toLowerCase()} group for our community.</p>
            ${description ? `<p>${description}</p>` : ""}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" 
                 style="display: inline-block; padding: 14px 32px; background-color: #1a4d8f; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Join ${type}
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              You can also find all our communication channels on your dashboard.
            </p>
          `,
        },
        push: { tokens: student.fcmTokens },
        metadata: {
          channelId: channel.id,
          channelType: type.toUpperCase(),
          channelLink: link,
        },
      })
    );

    // Fire and don't wait (to avoid timeout on large student base)
    Promise.allSettled(notifications).then((results) => {
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      console.log(`[Channels] Notification broadcast complete: ${succeeded}/${students.length} sent`);
    });

    return successResponse(
      { channel },
      `Channel created and ${students.length} students notified`
    );
  } catch (error) {
    console.error("Create channel error:", error);
    return errors.internal("Failed to create channel");
  }
}
