import { prisma } from "@/lib/prisma"

export async function getOwnedBusinessOrg(userId: string) {
  return prisma.organization.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
  })
}
