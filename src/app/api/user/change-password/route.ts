export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { requireApiUser } from "@/lib/authz"
import { ok, badRequest, handleError, zodError } from "@/lib/api-response"

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8).regex(/[A-Z]/, "ต้องมีตัวพิมพ์ใหญ่").regex(/[0-9]/, "ต้องมีตัวเลข"),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error
    const { currentPassword, newPassword } = schema.parse(await req.json())
    const user = await prisma.user.findUnique({ where: { id: auth.user.id } })
    if (!user?.passwordHash) return badRequest("บัญชีนี้ใช้ Google Login — ไม่มี Password ให้เปลี่ยน")
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return badRequest("Password เดิมไม่ถูกต้อง")
    await prisma.user.update({ where: { id: auth.user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } })
    return ok(null, "เปลี่ยน Password สำเร็จ")
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}
