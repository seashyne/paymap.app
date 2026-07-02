import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"
import { ok, handleError, zodError, notFound } from "@/lib/api-response"
import { auditLog } from "@/server/audit/audit-service"
import { eventBus } from "@/server/events/event-bus"
import { realtime } from "@/server/realtime/realtime-service"
import { cacheDelete } from "@/server/cache/cache-service"

const updateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  content: z.string().max(2000).optional().nullable(),
  dueAt: z.string().datetime().optional().nullable().or(z.literal("")),
  priority: z.coerce.number().min(1).max(3).optional(),
  status: z.enum(["open", "done", "archived"]).optional(),
  relatedPath: z.string().max(255).optional().nullable(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error
    const existing = await prisma.plannerEntry.findFirst({ where: { id: params.id, userId: auth.user.id } })
    if (!existing) return notFound("ไม่พบรายการ planner")
    const data = updateSchema.parse(await req.json())
    const updated = await prisma.plannerEntry.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.content !== undefined ? { content: data.content || null } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.relatedPath !== undefined ? { relatedPath: data.relatedPath || null } : {}),
        ...(data.dueAt !== undefined ? { dueAt: data.dueAt ? new Date(data.dueAt) : null } : {}),
      },
    })
    await cacheDelete(`planner:${auth.user.id}:${existing.workspace}`)
    eventBus.emit("planner.entry_updated", { userId: auth.user.id, workspaceId: existing.workspace, entryId: updated.id, status: updated.status })
    realtime.publish(`workspace:${existing.workspace}`, { type: "planner.entry_updated", entryId: updated.id, status: updated.status, workspaceId: existing.workspace })
    await auditLog({ actorId: auth.user.id, workspaceId: existing.workspace, action: "planner.update", metadata: { entryId: updated.id } })
    return ok(updated, "อัปเดตรายการ planner แล้ว")
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error
  const existing = await prisma.plannerEntry.findFirst({ where: { id: params.id, userId: auth.user.id } })
  if (!existing) return notFound("ไม่พบรายการ planner")
  await prisma.plannerEntry.delete({ where: { id: params.id } })
  await cacheDelete(`planner:${auth.user.id}:${existing.workspace}`)
  eventBus.emit("planner.entry_deleted", { userId: auth.user.id, workspaceId: existing.workspace, entryId: existing.id })
  realtime.publish(`workspace:${existing.workspace}`, { type: "planner.entry_deleted", entryId: existing.id, workspaceId: existing.workspace })
  await auditLog({ actorId: auth.user.id, workspaceId: existing.workspace, action: "planner.delete", metadata: { entryId: existing.id } })
  return ok(null, "ลบรายการแล้ว")
}
