export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiRole } from "@/lib/authz"
import { ok } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  const auth = await requireApiRole("admin")
  if ("error" in auth) return auth.error

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  const action = req.nextUrl.searchParams.get("action")?.trim() ?? ""
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? "120") || 120, 200)

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(action ? { action } : {}),
      ...(q ? {
        OR: [
          { action: { contains: q, mode: "insensitive" } },
          { user: { email: { contains: q, mode: "insensitive" } } },
          { user: { name: { contains: q, mode: "insensitive" } } },
        ],
      } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { id: true, email: true, name: true } } },
  })

  return ok(logs)
}
