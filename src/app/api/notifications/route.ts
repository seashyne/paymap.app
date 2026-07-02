// v1.6: In-app notifications — list & mark as read
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handleError } from "@/lib/api-response"
import { requireApiUser } from "@/lib/authz"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: auth.user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({ where: { userId: auth.user.id, readAt: null } }),
    ])
    return ok({ notifications, unreadCount })
  } catch(e) { return handleError(e) }
}

export async function PATCH(req: NextRequest) {
  // Mark all as read, or specific id
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error
    const { id } = await req.json().catch(() => ({}))
    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: auth.user.id },
        data: { readAt: new Date() },
      })
    } else {
      await prisma.notification.updateMany({
        where: { userId: auth.user.id, readAt: null },
        data: { readAt: new Date() },
      })
    }
    return ok({ ok: true })
  } catch(e) { return handleError(e) }
}
