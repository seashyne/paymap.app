import { getCurrentSession } from "@/server/auth/session"
import { prisma } from "@/server/db/prisma"

export async function getCurrentUserRecord() {
  const session = await getCurrentSession()
  if (!session?.email) return null
  return prisma.user.findFirst({
    where: { email: session.email, accountMode: session.accountMode ?? session.workspaceMode ?? "personal" },
  })
}
