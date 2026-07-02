export type ProductPlan =
  | "PERSONAL_FREE"
  | "PERSONAL_PRO"
  | "PERSONAL_FAMILY"
  | "MERCHANT_FREE"
  | "MERCHANT_STARTER"
  | "MERCHANT_GROWTH"
  | "MERCHANT_SCALE"
  | "MERCHANT_ENTERPRISE"
  | "BUSINESS_FREE"
  | "BUSINESS_SME"
  | "BUSINESS_SCALE"
  | "BUSINESS_ENTERPRISE"

const FEATURE_GATE_MAP: Record<string, ProductPlan[]> = {
  "personal.export": ["PERSONAL_PRO", "PERSONAL_FAMILY"],
  "personal.subscription_tracker": ["PERSONAL_PRO", "PERSONAL_FAMILY"],
  "merchant.supplier.manage": ["MERCHANT_GROWTH", "MERCHANT_SCALE", "MERCHANT_ENTERPRISE"],
  "merchant.purchase_order.manage": ["MERCHANT_GROWTH", "MERCHANT_SCALE", "MERCHANT_ENTERPRISE"],
  "merchant.branch.multi": ["MERCHANT_SCALE", "MERCHANT_ENTERPRISE"],
  "merchant.api.access": ["MERCHANT_SCALE", "MERCHANT_ENTERPRISE"],
  "business.payroll.bank_export": ["BUSINESS_SME", "BUSINESS_SCALE", "BUSINESS_ENTERPRISE"],
  "business.e_filing": ["BUSINESS_SME", "BUSINESS_SCALE", "BUSINESS_ENTERPRISE"],
  "business.api.access": ["BUSINESS_SCALE", "BUSINESS_ENTERPRISE"],
}

export function canUseFeature(plan: ProductPlan, featureKey: string) {
  const allowedPlans = FEATURE_GATE_MAP[featureKey]
  if (!allowedPlans) return true
  return allowedPlans.includes(plan)
}
