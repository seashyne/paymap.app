export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireApiRole } from "@/lib/authz"
import { eventBus } from "@/server/events/event-bus"

const updateSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "admin"]).optional(),
  accountMode: z.enum(["personal", "business", "merchant"]).optional(),
  plan: z.enum(["free", "pro", "family"]).optional(),
})

export async function GET() {
  const auth = await requireApiRole("admin")
  if ("error" in auth) return auth.error

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      plan: true,
      createdAt: true,
      loginCount: true,
      accountMode: true,
      _count: { select: { transactions: true } },
    },
  })

  eventBus.emit("admin.viewed", { userId: auth.user.id, workspaceId: auth.user.accountMode, view: "users" })
  return NextResponse.json({ ok: true, data: users })
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiRole("admin")
  if ("error" in auth) return auth.error
  try {
    const input = updateSchema.parse(await req.json())
    const target = await prisma.user.findUnique({ where: { id: input.id }, select: { id: true, email: true } })
    if (!target) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 })

    const data: Record<string, unknown> = {}
    if (input.role) data.role = input.role
    if (input.accountMode) data.accountMode = input.accountMode
    if (input.plan) data.plan = input.plan

    const updated = await prisma.user.update({
      where: { id: input.id },
      data,
      select: { id: true, name: true, email: true, role: true, plan: true, accountMode: true, createdAt: true, loginCount: true, _count: { select: { transactions: true } } },
    })

    const metadata: Prisma.InputJsonObject = {
      targetUserId: updated.id,
      changes: data as Prisma.InputJsonObject,
    }

    await prisma.auditLog.create({
      data: { userId: auth.user.id, action: "admin.user_updated", metadata },
    }).catch(() => undefined)

    return NextResponse.json({ ok: true, data: updated, message: `Updated ${target.email}` })
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    return NextResponse.json({ ok: false, error: error?.message ?? "Update failed" }, { status: 500 })
  }
}
