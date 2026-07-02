export const dynamic = "force-dynamic"
import { requireApiUser } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { ok, handleError } from "@/lib/api-response"

export async function GET() {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error

    const [payments, subscriptions] = await Promise.all([
      prisma.stripePayment.findMany({
        where: { userId: auth.user.id },
        orderBy: { createdAt: "desc" },
        take: 24,
      }),
      prisma.productSubscription.findMany({
        where: { userId: auth.user.id },
        orderBy: { updatedAt: "desc" },
      }),
    ])

    return ok({
      payments: payments.map((payment) => ({
        id: payment.id,
        stripeInvoiceId: payment.stripeInvoiceId,
        amountPaid: payment.amountPaid,
        currency: payment.currency,
        status: payment.status,
        plan: payment.plan,
        periodStart: payment.periodStart,
        periodEnd: payment.periodEnd,
        invoiceUrl: payment.invoiceUrl,
        createdAt: payment.createdAt,
      })),
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        product: sub.product,
        planTier: sub.planTier,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        updatedAt: sub.updatedAt,
      })),
    })
  } catch (error) {
    return handleError(error)
  }
}
