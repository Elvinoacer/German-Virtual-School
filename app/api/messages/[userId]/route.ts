import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const payload = await authenticate(request);
    const myId = payload.userId;
    const { userId } = await params;
    const otherUserId = userId;

    // Fetch messages between these two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId },
        ],
      },
      orderBy: { createdAt: "asc" }, // Oldest first for chat history
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Mark received messages as read
    // We update messages where Sender = Other AND Receiver = Me AND isRead = false
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: myId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return successResponse({ messages, myId });
  } catch (error) {
    console.error("Get chat history error:", error);
    return errors.internal("Failed to fetch chat history");
  }
}
