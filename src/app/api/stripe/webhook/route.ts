import { NextRequest, NextResponse } from "next/server"
import { getStripe, resolveProductFromPriceId, getPlanFromPriceId } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  if (!stripe) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 })

  const body = await req.text()
  const sig  = req.headers.get("stripe-signature") ?? ""
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret ?? "")
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {

      // ── checkout.session.completed ─────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as any
        const userId  = session.metadata?.userId
        const priceId = session.metadata?.priceId
        if (!userId || !priceId) {
          console.warn("[webhook] missing userId/priceId in metadata", session.id)
          break
        }

        const resolved = resolveProductFromPriceId(priceId)
        if (!resolved) {
          console.warn("[webhook] unknown priceId:", priceId)
          break
        }

        const { product, tier } = resolved

        // ✅ upsert ProductSubscription สำหรับทุก product (personal/business/merchant)
        await prisma.productSubscription.upsert({
          where: { userId_product: { userId, product: product as any } },
          update: {
            planTier: tier,
            status: "active",
            stripeSubscriptionId: String(session.subscription ?? ""),
            stripePriceId: priceId,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
          },
          create: {
            userId,
            product: product as any,
            planTier: tier,
            status: "active",
            stripeSubscriptionId: String(session.subscription ?? ""),
            stripePriceId: priceId,
          },
        })

        // ✅ อัปเดต user.plan เฉพาะโหมด personal (business/merchant ใช้ productSubscription)
        if (product === "personal") {
          const plan = getPlanFromPriceId(priceId) ?? "free"
          await prisma.user.update({
            where: { id: userId },
            data: { plan: plan as any, stripeCustomerId: session.customer },
          })
        } else {
          // business/merchant — แค่อัปเดต stripeCustomerId
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: session.customer },
          })
        }

        console.log(`[webhook] checkout.completed: userId=${userId} product=${product} tier=${tier}`)
        break
      }

      // ── subscription updated / deleted ────────────────────────────────
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as any
        const stripeSubId = sub.id
        const isActive = sub.status === "active" || sub.status === "trialing"

        const existing = await prisma.productSubscription.findFirst({
          where: { stripeSubscriptionId: stripeSubId },
        })

        if (existing) {
          await prisma.productSubscription.update({
            where: { id: existing.id },
            data: {
              status: isActive ? "active" : "canceled",
              cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
              currentPeriodEnd: sub.current_period_end
                ? new Date(sub.current_period_end * 1000)
                : undefined,
            },
          })

          // downgrade plan field เฉพาะ personal
          if (existing.product === "personal" && !isActive) {
            await prisma.user.update({
              where: { id: existing.userId },
              data: { plan: "free" },
            })
          }

          console.log(`[webhook] subscription ${event.type}: subId=${stripeSubId} active=${isActive}`)
        } else {
          console.warn("[webhook] subscription not found in DB:", stripeSubId)
        }
        break
      }


      // ── invoice.paid ───────────────────────────────────────────────
      case "invoice.paid": {
        const invoice = event.data.object as any
        const stripeSubId = String(invoice.subscription ?? "")
        const stripeInvoiceId = String(invoice.id ?? "")
        if (!stripeSubId || !stripeInvoiceId) break

        const existing = await prisma.productSubscription.findFirst({
          where: { stripeSubscriptionId: stripeSubId },
        })

        if (!existing) {
          console.warn("[webhook] payment invoice subscription not found:", stripeSubId)
          break
        }

        const amountPaid = Number(invoice.amount_paid ?? 0)
        const currency = String(invoice.currency ?? "thb").toUpperCase()
        const periodStartUnix = invoice.lines?.data?.[0]?.period?.start ?? invoice.period_start
        const periodEndUnix = invoice.lines?.data?.[0]?.period?.end ?? invoice.period_end

        await prisma.stripePayment.upsert({
          where: { stripeInvoiceId },
          update: {
            amountPaid,
            currency,
            status: String(invoice.status ?? "paid"),
            plan: existing.product === "personal"
              ? ((existing.planTier === "family" ? "family" : existing.planTier === "pro" ? "pro" : "free") as any)
              : "free",
            periodStart: periodStartUnix ? new Date(periodStartUnix * 1000) : new Date(),
            periodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : new Date(),
            invoiceUrl: invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null,
          },
          create: {
            userId: existing.userId,
            stripeInvoiceId,
            amountPaid,
            currency,
            status: String(invoice.status ?? "paid"),
            plan: existing.product === "personal"
              ? ((existing.planTier === "family" ? "family" : existing.planTier === "pro" ? "pro" : "free") as any)
              : "free",
            periodStart: periodStartUnix ? new Date(periodStartUnix * 1000) : new Date(),
            periodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : new Date(),
            invoiceUrl: invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null,
          },
        })

        await prisma.productSubscription.update({
          where: { id: existing.id },
          data: {
            status: "active",
            currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : existing.currentPeriodEnd,
          },
        })

        console.log(`[webhook] invoice.paid: subId=${stripeSubId} invoice=${stripeInvoiceId}`)
        break
      }

      // ── invoice.payment_failed ──────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as any
        const stripeSubId = invoice.subscription
        if (!stripeSubId) break

        const existing = await prisma.productSubscription.findFirst({
          where: { stripeSubscriptionId: stripeSubId },
        })
        if (existing) {
          await prisma.productSubscription.update({
            where: { id: existing.id },
            data: { status: "past_due" },
          })
          console.log(`[webhook] payment_failed: subId=${stripeSubId}`)
        }
        break
      }
    }
  } catch (err) {
    console.error("[webhook] handler error:", err)
  }

  return NextResponse.json({ received: true })
}
