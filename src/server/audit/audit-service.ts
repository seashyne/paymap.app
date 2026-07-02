import { prisma } from "@/server/db/prisma"

type AuditEntry = {
  actorId?: string
  workspaceId?: string
  action: string
  metadata?: Record<string, unknown> | null
  ip?: string | null
  userAgent?: string | null
}

export async function auditLog(entry: AuditEntry) {
  if (!entry.actorId) {
    if (process.env.NODE_ENV !== "production") console.info("[audit:skip]", entry)
    return null
  }

  try {
    return await prisma.auditLog.create({
      data: {
        userId: entry.actorId,
        action: entry.action,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
        metadata: {
          ...(entry.metadata ?? {}),
          ...(entry.workspaceId ? { workspaceId: entry.workspaceId } : {}),
        },
      },
    })
  } catch (error) {
    console.error("[audit:error]", error)
    return null
  }
}
