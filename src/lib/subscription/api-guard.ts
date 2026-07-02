import { requireApiUser } from "@/lib/authz"
import { hasFeatureAccess } from "@/lib/subscription/feature-gate"
import type { FeatureKey } from "@/lib/subscription/plan-matrix"

export async function requireApiFeature(feature: FeatureKey) {
  const auth = await requireApiUser()

  if ("error" in auth) {
    return auth
  }

  if (!hasFeatureAccess(auth.user as any, feature)) {
    return {
      error: new Response(
        JSON.stringify({
          error: `Feature ${feature} is locked for current plan`,
          code: "FEATURE_LOCKED",
          feature,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      ),
    }
  }

  return { user: auth.user }
}