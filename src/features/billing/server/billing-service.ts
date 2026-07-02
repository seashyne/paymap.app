import { prisma } from "@/server/db/prisma"
import { getStripe } from "@/server/billing/stripe"
import { auditLog } from "@/server/audit/audit-service"
import { analytics } from "@/server/analytics/analytics-service"
import { enqueueJob } from "@/server/jobs/queue"
import { createInAppNotification } from "@/server/notifications/service"
import { getStripePrices } from "@/lib/stripe"

type BillingUser = { id: string; email: string; accountMode: "personal" | "business" | "merchant"; productSubscriptions: Array<{ product: string; planTier: string; status: string }> }

function getAllowedPriceIds(mode: BillingUser["accountMode"]) {
  const prices = getStripePrices()
  if (mode === "personal") {
    return [
      prices.personal.pro.monthly,
      prices.personal.pro.yearly,
      prices.personal.family.monthly,
      prices.personal.family.yearly,
    ].filter(Boolean)
  }
  if (mode === "business") {
    return [
      prices.business.sme.monthly,
      prices.business.sme.yearly,
      prices.business.scale.monthly,
      prices.business.scale.yearly,
    ].filter(Boolean)
  }
  return [
    prices.merchant.starter.monthly,
    prices.merchant.starter.yearly,
    prices.merchant.growth.monthly,
    prices.merchant.growth.yearly,
    prices.merchant.scale.monthly,
    prices.merchant.scale.yearly,
  ].filter(Boolean)
}

function getSafeReturnPath(input: any, fallback: string) {
  const raw = String(input?.returnTo ?? "").trim()
  if (!raw.startsWith("/")) return fallback
  if (raw.startsWith("//")) return fallback
  return raw
}

function inferPlanTierFromPriceId(priceId: string, mode: BillingUser['accountMode']) {
  const p = priceId.toLowerCase()
  if (mode === 'personal') {
    if (p.includes('family')) return 'family'
    if (p.includes('pro')) return 'pro'
    return 'free'
  }
  if (mode === 'business') {
    if (p.includes('enterprise')) return 'enterprise'
    if (p.includes('scale')) return 'scale'
    if (p.includes('sme')) return 'sme'
    return 'free'
  }
  if (p.includes('enterprise')) return 'enterprise'
  if (p.includes('scale')) return 'scale'
  if (p.includes('growth')) return 'growth'
  if (p.includes('starter')) return 'starter'
  return 'free'
}

export async function openBillingPortal(userId: string) {
  const stripe = getStripe()
  if (!stripe) return { ok: true as const, data: { url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/billing#history`, local: true } }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true, email: true, accountMode: true } })
  if (!user?.stripeCustomerId) return { ok: true as const, data: { url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/billing#history`, local: true } }
  const session = await stripe.billingPortal.sessions.create({ customer: user.stripeCustomerId, return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/billing` })
  await auditLog({ actorId: userId, workspaceId: user.accountMode, action: "billing.portal_opened", metadata: { customerId: user.stripeCustomerId } })
  await analytics.track({ userId, workspaceId: user.accountMode, event: "billing_portal_opened" })
  return { ok: true as const, data: { url: session.url } }
}

export async function createCheckoutSession(user: BillingUser, input: any) {
  const priceId = String(input?.priceId ?? "").trim()
  if (!priceId) return { ok: false as const, status: 400, error: "Please select a plan before starting checkout." }

  const allowedPriceIds = getAllowedPriceIds(user.accountMode)
  if (!allowedPriceIds.includes(priceId)) {
    return { ok: false as const, status: 400, error: "Selected plan is not available for this workspace." }
  }

  const stripe = getStripe()
  if (!stripe) {
    const planTier = inferPlanTierFromPriceId(priceId, user.accountMode)
    const current = user.productSubscriptions.find((item) => item.product === user.accountMode)
    if (current) {
      await prisma.productSubscription.updateMany({ where: { userId: user.id, product: user.accountMode }, data: { planTier, status: 'active', currentPeriodEnd: null, cancelAtPeriodEnd: false } })
    } else {
      await prisma.productSubscription.create({ data: { userId: user.id, product: user.accountMode, planTier, status: 'active' } as any })
    }
    if (user.accountMode === 'personal' && (planTier === 'pro' || planTier === 'family')) {
      await prisma.user.update({ where: { id: user.id }, data: { plan: planTier as any } }).catch(() => undefined)
    }
    await prisma.auditLog.create({ data: { userId: user.id, action: 'billing.local_plan_change', metadata: { mode: user.accountMode, planTier, priceId } } }).catch(() => undefined)
    await createInAppNotification(user.id, 'Plan updated', `Your ${user.accountMode} workspace is now on ${planTier}.`, 'monthly_report').catch(() => undefined)
    return { ok: true as const, data: { url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/billing?upgraded=${planTier}&local=1` } }
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { stripeCustomerId: true, email: true, accountMode: true } })
  let customerId = dbUser?.stripeCustomerId ?? null
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id, accountMode: user.accountMode } })
    customerId = customer.id
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } }).catch(() => undefined)
  }

  const returnPath = getSafeReturnPath(input, "/billing")
  const success_url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${returnPath}`
  const cancel_url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/billing`
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url,
    cancel_url,
    allow_promotion_codes: true,
    metadata: { userId: user.id, accountMode: user.accountMode, priceId },
  })

  await enqueueJob("analytics.flush", { userId: user.id, event: "billing_checkout_started", mode: user.accountMode, priceId }).catch(() => undefined)
  await createInAppNotification(user.id, "Checkout started", "Your subscription setup has started. Complete payment to unlock your upgraded workspace.", "monthly_report").catch(() => undefined)
  await auditLog({ actorId: user.id, workspaceId: user.accountMode, action: "billing.checkout_started", metadata: { priceId } })
  await analytics.track({ userId: user.id, workspaceId: user.accountMode, event: "billing_checkout_started", properties: { priceId } })

  return { ok: true as const, data: { url: session.url } }
}
