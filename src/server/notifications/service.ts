import { prisma } from "@/server/db/prisma"
import { enqueueJob } from "@/server/jobs/queue"

export async function createInAppNotification(userId: string, title: string, body: string, type = "system") {
  const notification = await prisma.notification.create({
    data: { userId, title, body, type: type as any },
  }).catch(() => null)

  await enqueueJob("notification.send", { userId, title, body, type }).catch(() => undefined)
  return notification
}
