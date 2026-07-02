import { requireUser } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import AppFrame, { buildPrimaryNav } from "@/components/layout/AppFrame"
import PayProfileEditor from "@/components/pay-profile/PayProfileEditor"

import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { getCurrentPlan } from "@/lib/subscription/current-plan"

export const metadata = { title: "Pay Profile — payMap" }

export default async function PayProfilePage() {
  const user = await requireUser()

  const [profile, userData] = await Promise.all([
    prisma.payProfile.findFirst({
      where: { userId: user.id, workspaceType: (user.accountMode ?? "personal") as any },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        plan: true,
        productSubscriptions: { where: { status:"active" }, select: { product:true, planTier:true } }
      }
    }),
  ])

  const resolvedMode = (user.accountMode ?? "personal") as "personal" | "business" | "merchant"
  const subTier = userData?.productSubscriptions.find(s => s.product === resolvedMode)?.planTier
  const currentPlan = getCurrentPlan({ plan: userData?.plan, accountMode: resolvedMode, productSubscriptions: userData?.productSubscriptions ?? [] }, resolvedMode)
  const nav = buildPrimaryNav("settings")

  return (
    <AppFrame brand="payMap" icon="💳" version={`${DASHBOARD_VERSION_LABEL} · Pay Profile`}
      title="Pay Profile" subtitle={profile ? `แชร์ลิงก์รับเงินของคุณ · paymap.app/pay/${profile.slug}` : "ตั้งค่าเทมเพลต รูป และวิธีรับเงินในหน้าเดียว"}
      accent="#10b981" planLabel={currentPlan} accountMode={resolvedMode} nav={nav}>
      <PayProfileEditor
        workspaceType={resolvedMode}
        userPlan={userData?.plan ?? "free"}
        userSubTier={subTier}
        existing={profile ? {
          ...profile,
          presetAmounts: profile.presetAmounts as number[],
          promptpayType: profile.promptpayType as "PHONE" | "NID" | "TAX" | null,
        } : null}
      />
    </AppFrame>
  )
}
