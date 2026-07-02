export const dynamic = "force-dynamic"
import { ok } from "@/lib/api-response"
import { PLAN_PRICING, PLAN_LIMITS, BUSINESS_PRICING, BUSINESS_PLAN_LIMITS, MERCHANT_PRICING, MERCHANT_PLAN_LIMITS, getStripePrices } from "@/lib/stripe"
import { requireApiUser } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error

  const [user, sub, productSubs] = await Promise.all([
    prisma.user.findUnique({ where: { id: auth.user.id }, select: { plan: true } }),
    prisma.stripeSubscription.findUnique({ where: { userId: auth.user.id } }),
    prisma.productSubscription.findMany({ where: { userId: auth.user.id }, select: { product: true, planTier: true, status: true, currentPeriodEnd: true } }),
  ])

  const prices = getStripePrices()

  return ok({
    currentPlan: user?.plan ?? "free",
    subscription: sub ? { status: sub.status, currentPeriodEnd: sub.currentPeriodEnd, cancelAtPeriodEnd: sub.cancelAtPeriodEnd } : null,
    productSubscriptions: productSubs,
    personalPlans: (["free", "pro", "family"] as const).map((k) => ({
      key: k,
      ...PLAN_PRICING[k],
      limits: PLAN_LIMITS[k],
      priceIds: k === "free" ? null : prices.personal[k],
    })),
    businessPlans: (["free", "sme", "scale", "enterprise"] as const).map((k) => ({
      key: k,
      ...BUSINESS_PRICING[k],
      limits: BUSINESS_PLAN_LIMITS[k],
      priceIds: k === "free" || k === "enterprise" ? null : prices.business[k],
    })),
    merchantPlans: (["free", "starter", "growth", "scale", "enterprise"] as const).map((k) => ({
      key: k,
      ...MERCHANT_PRICING[k],
      limits: MERCHANT_PLAN_LIMITS[k],
      priceIds: k === "free" || k === "enterprise" ? null : prices.merchant[k],
    })),
  })
}
