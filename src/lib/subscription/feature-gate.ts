import { getPersonalPlan, type CurrentUser } from "@/lib/authz"
import {
  FEATURE_META,
  type FeatureKey,
  PERSONAL_PLAN_FEATURES,
  BUSINESS_PLAN_FEATURES,
  MERCHANT_PLAN_FEATURES,
} from "@/lib/subscription/plan-matrix"

export type { FeatureKey } from "@/lib/subscription/plan-matrix"

function getBusinessPlan(user: Pick<CurrentUser, "productSubscriptions" | "role">): keyof typeof BUSINESS_PLAN_FEATURES {
  if (user.role === "admin") return "enterprise"
  const tier = user.productSubscriptions.find((s) => s.product === "business" && s.status === "active")?.planTier
  if (tier === "sme" || tier === "scale" || tier === "enterprise") return tier
  return "free"
}

function getMerchantPlan(user: Pick<CurrentUser, "productSubscriptions" | "role">): keyof typeof MERCHANT_PLAN_FEATURES {
  if (user.role === "admin") return "enterprise"
  const tier = user.productSubscriptions.find((s) => s.product === "merchant" && s.status === "active")?.planTier
  if (tier === "starter" || tier === "growth" || tier === "scale" || tier === "enterprise") return tier
  return "free"
}

export function getPlanSnapshot(user: CurrentUser) {
  const personal = getPersonalPlan(user)
  const business = getBusinessPlan(user)
  const merchant = getMerchantPlan(user)
  const enterprise = business === "enterprise" || merchant === "enterprise" || user.role === "admin"
  return { personal, business, merchant, enterprise }
}

export function hasFeatureAccess(user: CurrentUser, feature: FeatureKey): boolean {
  if (user.role === "admin") return true
  const snapshot = getPlanSnapshot(user)
  if ((PERSONAL_PLAN_FEATURES[snapshot.personal] as readonly FeatureKey[]).includes(feature)) return true
  if ((BUSINESS_PLAN_FEATURES[snapshot.business] as readonly FeatureKey[]).includes(feature)) return true
  if ((MERCHANT_PLAN_FEATURES[snapshot.merchant] as readonly FeatureKey[]).includes(feature)) return true
  if (snapshot.enterprise && (feature === "enterprise_controls" || feature === "enterprise_reports")) return true
  return false
}

export function getUpgradeHref(user: Pick<CurrentUser, "accountMode"> | null, feature: FeatureKey) {
  const meta = FEATURE_META[feature]
  const product = meta.upgradeProduct === "enterprise" ? "business" : meta.upgradeProduct
  const returnTo = user?.accountMode === "merchant" ? "/merchant" : user?.accountMode === "business" ? "/business" : "/dashboard"
  return `/pricing?focus=${product}&feature=${feature}&returnTo=${encodeURIComponent(returnTo)}`
}

export function getFeatureRequirementLabel(feature: FeatureKey) {
  const meta = FEATURE_META[feature]
  if (meta.upgradeProduct === "enterprise") return "Enterprise"
  if (meta.upgradeProduct === "business") return `Business ${meta.minimumPlan.toUpperCase()}`
  if (meta.upgradeProduct === "merchant") return `Merchant ${meta.minimumPlan.toUpperCase()}`
  return `Personal ${meta.minimumPlan.toUpperCase()}`
}