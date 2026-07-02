import { BUSINESS_PLAN_LIMITS, type BusinessPlanKey } from "@/lib/stripe"

export function checkBusinessLimit(plan: BusinessPlanKey, feature: keyof typeof BUSINESS_PLAN_LIMITS.free, current?: number) {
  const limit = BUSINESS_PLAN_LIMITS[plan][feature]
  if (typeof limit === "boolean") return { allowed: limit, limit }
  if (typeof current === "number") return { allowed: current < (limit as number), limit: limit as number, current }
  return { allowed: true, limit: limit as number }
}

export function getBusinessPlan(planTier: string): BusinessPlanKey {
  if (planTier === "sme" || planTier === "scale" || planTier === "enterprise") return planTier as BusinessPlanKey
  return "free"
}
