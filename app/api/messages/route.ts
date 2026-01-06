import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { notify } from '@/lib/notifications/orchestrator';
import { NotificationType } from '@/generated/prisma/enums';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    const userId = payload.userId;

    // Get all unique users interacted with (sent to or received from)
    // This is a bit complex in Prisma. 
    // We want to find the latest message for each unique conversation partner.
    
    // 1. Find all messages sent or received by user
    // Optimization: This might get heavy. For now, we'll fetch recent messages and process in JS.
    // A better approach in raw SQL would be using DISTINCT ON or Group By.
    
    // Fetch last 100 messages involving the user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true, image: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true, image: true } }
      },
      take: 100 // Reasonable limit for now
    });

    // Group by conversation partner
    const conversationsMap = new Map();

    for (const msg of messages) {
      const isSender = msg.senderId === userId;
      const partner = isSender ? msg.receiver : msg.sender;
      
      if (!conversationsMap.has(partner.id)) {
        conversationsMap.set(partner.id, {
          partner,
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            isRead: msg.isRead,
            amISender: isSender
          },
          unreadCount: 0
        });
      }
      
      // Count unread messages where I am the receiver
      if (!isSender && !msg.isRead) {
        conversationsMap.get(partner.id).unreadCount++;
      }
    }

    const conversations = Array.from(conversationsMap.values());

    return successResponse(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return errors.internal('Failed to fetch conversations');
  }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await authenticate(request);
        const userId = payload.userId;
        const body = await request.json();
        const { receiverId, content } = body;

        if (!receiverId || !content) {
            return errors.validation("Receiver and content are required");
        }

        const message = await prisma.message.create({
            data: {
                senderId: userId,
                receiverId,
                content
            },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
            }
        });

        // Notify Receiver
        try {
            const receiver = await prisma.user.findUnique({
                where: { id: receiverId },
                select: { email: true, fcmTokens: true }
            });

            if (receiver) {
                notify({
                    userId: receiverId,
                    title: `New Message from ${message.sender.firstName}`,
                    message: content.substring(0, 50),
                    type: NotificationType.INFO,
                    email: { to: receiver.email },
                    push: { tokens: receiver.fcmTokens },
                    metadata: {
                        link: `/messages/${userId}`,
                        messageId: message.id
                    }
                });
            }
        } catch (err) {
            console.error("Failed to send message notification", err);
        }

        return successResponse(message);

    } catch (error) {
        console.error('Send message error:', error);
        return errors.internal('Failed to send message');
    }
}
