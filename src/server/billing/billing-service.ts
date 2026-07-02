import { getStripe } from "@/server/billing/stripe"

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  const stripe = getStripe()
  if (!stripe) throw new Error("STRIPE_NOT_CONFIGURED")
  return stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl })
}
