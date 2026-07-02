export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, created, handleError } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"
import { z } from "zod"

const supplierSchema = z.object({
  storeId: z.string(),
  name: z.string().min(1),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
  paymentTerms: z.number().int().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await requireModeUser("merchant")
    if ("error" in auth) return auth.error
    const storeId = new URL(req.url).searchParams.get("storeId")
    if (!storeId) return ok([])
    const store = await prisma.store.findFirst({ where: { id: storeId, userId: auth.user.id } })
    if (!store) return ok([])
    const suppliers = await prisma.supplier.findMany({ where: { storeId }, orderBy: { name: "asc" } })
    return ok(suppliers)
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("merchant")
    if ("error" in auth) return auth.error
    const body = await req.json()
    const parsed = supplierSchema.safeParse(body)
    if (!parsed.success) return handleError(parsed.error)
    const store = await prisma.store.findFirst({ where: { id: parsed.data.storeId, userId: auth.user.id } })
    if (!store) return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 })
    const supplier = await prisma.supplier.create({ data: parsed.data })
    return created(supplier, "เพิ่ม supplier สำเร็จ")
  } catch (e) { return handleError(e) }
}
