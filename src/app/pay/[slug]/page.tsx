import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PayPageClient from "./PayPageClient"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const profile = await prisma.payProfile.findUnique({ where: { slug: params.slug } })
  if (!profile) return { title: "ไม่พบหน้านี้" }
  return {
    title: `ชำระเงินให้ ${profile.displayName} — payMap`,
    description: profile.bio ?? `ชำระเงินให้ ${profile.displayName} ผ่าน PromptPay`,
  }
}

export default async function PublicPayPage({ params }: { params: { slug: string } }) {
  const profile = await prisma.payProfile.findUnique({
    where: { slug: params.slug },
    include: { user: { select: { name: true, image: true, country: true } } },
  })

  if (!profile || !profile.isActive) notFound()

  // bump view count (fire-and-forget)
  prisma.payProfile.update({
    where: { id: profile.id },
    data: { totalReceived: { increment: 1 }, lastViewedAt: new Date() },
  }).catch(() => {})

  return <PayPageClient profile={{
    ...profile,
    presetAmounts: profile.presetAmounts as number[],
    promptpayType: profile.promptpayType as "PHONE" | "NID" | "TAX" | null,
    workspaceType: profile.workspaceType as "personal" | "business" | "merchant",
    ownerName: profile.user.name,
    ownerImage: profile.user.image,
    coverStyle:    profile.coverStyle    ?? "color",
    frameStyle:    profile.frameStyle    ?? "rounded",
    fontStyle:     profile.fontStyle     ?? "default",
    layoutStyle:   profile.layoutStyle   ?? "center",
  }} />
}
