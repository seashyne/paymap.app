import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { buildPromptPayPayload, buildPromptPayQrUrl } from "@/lib/promptpay"
import { ok, badRequest, notFound, handleError } from "@/lib/api-response"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json().catch(() => ({}))
    const amount = body.amount === "" || body.amount == null ? undefined : Number(body.amount)
    const note = String(body.note ?? "").slice(0, 160)
    if (amount !== undefined && (!Number.isFinite(amount) || amount <= 0 || amount > 9_999_999)) {
      return badRequest("Invalid amount")
    }

    const profile = await prisma.payProfile.findUnique({ where: { slug: params.slug } })
    if (!profile || !profile.isActive || !profile.promptpayId) return notFound("Pay profile not found")

    const payload = buildPromptPayPayload(profile.promptpayId, amount)
    await prisma.payProfile.update({ where: { id: profile.id }, data: { totalReceived: { increment: 1 }, lastViewedAt: new Date() } }).catch(() => undefined)

    return ok({
      slug: profile.slug,
      amount: amount ?? null,
      note: note || null,
      promptpayId: profile.promptpayId,
      payload,
      qrUrl: buildPromptPayQrUrl(payload, 420),
      openUrl: `https://promptpay.io/${profile.promptpayId}${amount ? `/${amount}` : ""}`,
    })
  } catch (error) {
    return handleError(error)
  }
}
