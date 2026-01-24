import "server-only";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export const runtime = "nodejs";

export type AuditAction = 
  | "CREATE"
  | "UPDATE" 
  | "DELETE"
  | "VERIFY"
  | "DEACTIVATE"
  | "LOGIN"
  | "LOGOUT"
  | "VIEW"
  | "EXPORT"
  | "SETTINGS_UPDATE";

export type AuditEntity = 
  | "User"
  | "Student"
  | "Teacher"
  | "Course"
  | "Enrollment"
  | "Payment"
  | "Invoice"
  | "Settings"
  | "Report"
  | "Notification";

interface AuditLogParams {
  userId: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  details?: Record<string, any>;
}

/**
 * Create an audit log entry for admin actions
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  const { userId, action, entity, entityId, details } = params;

  try {
    // Get IP and user agent from headers
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || headersList.get("x-real-ip") 
      || "unknown";
    const userAgent = headersList.get("user-agent") || undefined;

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress,
        userAgent,
      },
    });

    console.log(`[Audit] ${action} ${entity} ${entityId || ""} by ${userId}`);
  } catch (error) {
    // Don't throw - audit logging should not break the main flow
    console.error("[Audit] Failed to create audit log:", error);
  }
}

/**
 * Query audit logs with filters
 */
export async function getAuditLogs(filters: {
  userId?: string;
  action?: AuditAction;
  entity?: AuditEntity;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const { userId, action, entity, startDate, endDate, limit = 50, offset = 0 } = filters;

  const where: any = {};
  
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (entity) where.entity = entity;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}
