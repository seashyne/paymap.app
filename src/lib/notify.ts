// v1.6: push in-app notification helper
import { prisma } from "@/lib/prisma"

type NotifyInput = {
  userId: string
  type: "budget_alert" | "subscription_due" | "approval_required" | "monthly_report" | "recurring_detected"
  title: string
  body: string
  payload?: object
}

export async function pushNotification(input: NotifyInput) {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        payload: input.payload as any,
      },
    })
  } catch(e) {
    console.error("[notify] push failed", e)
  }
}
