// หน้า onboarding สำหรับ user ใหม่ เลือก template แล้ว redirect ไป dashboard
// ถ้าเคย onboard แล้ว → redirect ไป dashboard ทันที

import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { ONBOARDING_TEMPLATES } from "@/lib/onboarding-templates"
import OnboardingClient from "./OnboardingClient"
import { detectSiteLang } from "@/lib/i18n/site"
import LocalFirstOnboardingClient from "@/components/local-first/LocalFirstOnboardingClient"

export const metadata = { title: "Get started — PayMap" }

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { mode?: string; skip?: string }
}) {
  const session = await getCurrentSession()
  const lang = detectSiteLang()
  if (!session?.sub) redirect("/login")

  let user: { bio: string | null; accountMode: "personal" | "business" | "merchant"; currency: string } | null = null
  try {
    // ตรวจว่า onboard แล้วหรือยัง (bio มี "onboarding:")
    user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { bio: true, accountMode: true, currency: true },
    })
  } catch (error) {
    console.error("OnboardingPage user lookup failed", error)
    const fallbackMode = (session.accountMode ?? "personal") as "personal" | "business" | "merchant"
    redirect(fallbackMode === "business" ? "/business" : fallbackMode === "merchant" ? "/merchant" : "/dashboard")
  }

  // ถ้า skip=1 หรือ onboard แล้ว → ไป dashboard
  if (searchParams.skip === "1" || user?.bio?.startsWith("onboarding:")) {
    const mode = user?.accountMode ?? "personal"
    redirect(mode === "business" ? "/business" : mode === "merchant" ? "/merchant" : "/dashboard")
  }

  const mode = (user?.accountMode ?? "personal") as "personal" | "business" | "merchant"

  return (
    <LocalFirstOnboardingClient lang={lang} />
  )
}
