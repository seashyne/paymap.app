import { prisma } from "@/server/db/prisma"

type ProductMode = "personal" | "business" | "merchant"

const LIMITS: Record<ProductMode, Record<string, { wallets?: number; plannerEntries?: number; teamMembers?: number; inventoryItems?: number }>> = {
  personal: {
    free: { wallets: 3, plannerEntries: 50 },
    pro: { wallets: 20, plannerEntries: 1000 },
    family: { wallets: 40, plannerEntries: 3000 },
  },
  business: {
    free: { teamMembers: 3, plannerEntries: 100, wallets: 10 },
    sme: { teamMembers: 25, plannerEntries: 3000, wallets: 50 },
    scale: { teamMembers: 100, plannerEntries: 20000, wallets: 200 },
    enterprise: { teamMembers: 1000, plannerEntries: 100000, wallets: 1000 },
  },
  merchant: {
    free: { inventoryItems: 50, plannerEntries: 100 },
    starter: { inventoryItems: 500, plannerEntries: 3000 },
    growth: { inventoryItems: 5000, plannerEntries: 25000 },
    scale: { inventoryItems: 20000, plannerEntries: 100000 },
    enterprise: { inventoryItems: 100000, plannerEntries: 250000 },
  },
}

export async function getUsageSummary(userId: string, mode: ProductMode, planTier = "free") {
  const counts = await Promise.all([
    prisma.wallet.count({ where: { userId, isArchived: false } }).catch(() => 0),
    prisma.plannerEntry.count({ where: { userId, workspace: mode, status: { not: "archived" } } }).catch(() => 0),
    prisma.organizationMember.count({ where: { userId } }).catch(() => 0),
    prisma.merchantProduct.count({ where: { store: { userId } } }).catch(() => 0),
  ])

  const limit = LIMITS[mode][planTier] ?? LIMITS[mode].free
  const [wallets, plannerEntries, teamMembers, inventoryItems] = counts
  return {
    mode,
    planTier,
    items: [
      { key: "wallets", label: "Wallets", used: wallets, limit: limit.wallets ?? null },
      { key: "plannerEntries", label: "Planner entries", used: plannerEntries, limit: limit.plannerEntries ?? null },
      { key: "teamMembers", label: "Team members", used: teamMembers, limit: limit.teamMembers ?? null },
      { key: "inventoryItems", label: "Inventory items", used: inventoryItems, limit: limit.inventoryItems ?? null },
    ].filter((item) => item.limit !== null),
  }
}
