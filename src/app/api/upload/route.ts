export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/authz"
import { uploadToR2, validateUpload, isR2Configured, deleteFromR2, type UploadCategory } from "@/lib/r2"
import { prisma } from "@/lib/prisma"

const VALID_CATEGORIES: UploadCategory[] = [
  "receipts",
  "invoices",
  "avatars",
  "documents",
  "exports",
  "storeLogos",
  "storeBanners",
  "productImages",
  "payProfileImages",
  "payProfileCovers",
  "userBackgrounds",
]

function isOwnedKey(userId: string, key: string) {
  const prefixes = [
    `receipts/${userId}/`,
    `documents/${userId}/`,
    `avatars/${userId}/`,
    `store-logos/${userId}/`,
    `store-banners/${userId}/`,
    `product-images/${userId}/`,
    `pay-profile-images/${userId}/`,
    `pay-profile-covers/${userId}/`,
    `user-backgrounds/${userId}/`,
  ]
  return prefixes.some((p) => key?.startsWith?.(p))
}

export async function POST(req: NextRequest) {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error

  if (!isR2Configured()) {
    return NextResponse.json({
      error: "ยังไม่ได้ตั้งค่า R2 Storage",
      hint: "เพิ่ม R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME ใน .env.local",
    }, { status: 503 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const category = (formData.get("category") as UploadCategory | null) ?? "documents"
    const linkedId = formData.get("linkedId") as string | null
    const linkedType = formData.get("linkedType") as string | null

    if (!file) return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 })
    if (!VALID_CATEGORIES.includes(category)) return NextResponse.json({ error: "category ไม่ถูกต้อง" }, { status: 400 })

    const err = validateUpload({ size: file.size, type: file.type }, category)
    if (err) return NextResponse.json({ error: err }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadToR2(buffer, {
      userId: auth.user.id,
      category,
      filename: file.name,
      contentType: file.type,
      metadata: { linkedId: linkedId ?? "", linkedType: linkedType ?? "" },
    })

    if (linkedId && linkedType === "transaction") {
      await prisma.transaction.updateMany({
        where: { id: linkedId, userId: auth.user.id },
        data: { receiptUrl: result.url },
      })
    }

    return NextResponse.json({ ok: true, key: result.key, url: result.url, size: result.size, contentType: result.contentType })
  } catch (e: any) {
    console.error("[Upload]", e)
    if (e.message?.includes("R2_NOT_CONFIGURED")) {
      return NextResponse.json({ error: "R2 Storage ยังไม่ได้ตั้งค่า" }, { status: 503 })
    }
    return NextResponse.json({ error: "อัปโหลดไม่สำเร็จ" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error

  const { key } = await req.json()
  if (!isOwnedKey(auth.user.id, key)) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์ลบไฟล์นี้" }, { status: 403 })
  }

  await deleteFromR2(key)
  return NextResponse.json({ ok: true })
}
