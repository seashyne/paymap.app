import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireModeUser("merchant")
  if ("error" in auth) return auth.error

  const product = await prisma.merchantProduct.findFirst({ where: { id: params.id, store: { userId: auth.user.id } } })
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const imageUrl = typeof body.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : null

  const updated = await prisma.merchantProduct.update({
    where: { id: params.id },
    data: { imageUrl },
    select: { id: true, name: true, imageUrl: true },
  })

  return NextResponse.json({ ok: true, product: updated, message: imageUrl ? "บันทึกรูปสินค้าสำเร็จ" : "ลบรูปสินค้าสำเร็จ" })
}
