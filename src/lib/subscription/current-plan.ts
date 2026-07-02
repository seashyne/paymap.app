export type SupportedAccountMode = "personal" | "business" | "merchant"

type ProductSubscriptionLike = {
  product?: string | null
  planTier?: string | null
  status?: string | null
}

type UserPlanLike = {
  plan?: string | null
  accountMode?: string | null
  productSubscriptions?: ProductSubscriptionLike[] | null
}

export function getCurrentPlan(
  user: UserPlanLike,
  mode?: SupportedAccountMode | string | null,
  fallback = "free"
) {
  const resolvedMode = (mode ?? user.accountMode ?? "personal") as string
  const active = (user.productSubscriptions ?? []).find(
    (subscription) => subscription.product === resolvedMode && subscription.status === "active"
  )
  return active?.planTier ?? user.plan ?? fallback
}
