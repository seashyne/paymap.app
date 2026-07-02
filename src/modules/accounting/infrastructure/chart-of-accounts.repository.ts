import { prisma } from "@/lib/prisma"
import { DEFAULT_CHART_OF_ACCOUNTS } from "@/lib/accounting/chart-of-accounts"

export async function ensureDefaultAccountsForUser(userId: string) {
  const existing = await prisma.chartOfAccount.findMany({ where: { userId }, select: { code: true } })
  const existingCodes = new Set(existing.map((item) => item.code))
  const missing = DEFAULT_CHART_OF_ACCOUNTS.filter((item) => !existingCodes.has(item.code))
  if (!missing.length) return

  await prisma.chartOfAccount.createMany({
    data: missing.map((item) => ({
      userId,
      code: item.code,
      name: item.name,
      nameTH: item.nameTH,
      type: item.type,
      isSystem: true,
    })),
    skipDuplicates: true,
  })
}

export async function getAccountIdByCode(userId: string, code: string) {
  await ensureDefaultAccountsForUser(userId)
  const account = await prisma.chartOfAccount.findFirst({ where: { userId, code }, select: { id: true } })
  if (!account) throw new Error(`Missing chart of account ${code}`)
  return account.id
}
