// v24.0: Gamification helpers
// XP, Levels, Achievements, Streaks

import { prisma } from "@/lib/prisma"

export const LEVEL_TABLE = [
  { level: 1,  minXP: 0    },
  { level: 2,  minXP: 100  },
  { level: 3,  minXP: 250  },
  { level: 4,  minXP: 500  },
  { level: 5,  minXP: 900  },
  { level: 6,  minXP: 1400 },
  { level: 7,  minXP: 2100 },
  { level: 8,  minXP: 3000 },
  { level: 9,  minXP: 4200 },
  { level: 10, minXP: 6000 },
]

export function calcLevel(xp: number) {
  let lv = 1
  for (const row of LEVEL_TABLE) {
    if (xp >= row.minXP) lv = row.level
  }
  const next = LEVEL_TABLE.find(r => r.level === lv + 1)
  return { level: lv, nextLevelXP: next?.minXP ?? null }
}

export const ACHIEVEMENTS: Array<{
  code:        string
  title:       string
  description: string
  icon:        string
  xpReward:    number
  check:       (stats: any) => boolean
}> = [
  {
    code: "first_transaction",
    title: "ก้าวแรก",
    description: "บันทึกธุรกรรมแรก",
    icon: "🎯",
    xpReward: 20,
    check: (s) => s.transactionCount >= 1,
  },
  {
    code: "saving_10",
    title: "นักออม",
    description: "ออมเงินครบ 10 วันติดต่อกัน",
    icon: "🐷",
    xpReward: 50,
    check: (s) => s.savingStreak >= 10,
  },
  {
    code: "saving_30",
    title: "นักออมมือโปร",
    description: "ออมเงินครบ 30 วันติดต่อกัน",
    icon: "💰",
    xpReward: 150,
    check: (s) => s.savingStreak >= 30,
  },
  {
    code: "budget_keeper",
    title: "รักษางบ",
    description: "ไม่เกินงบประมาณ 3 เดือนติด",
    icon: "📊",
    xpReward: 100,
    check: (s) => s.budgetStreak >= 3,
  },
  {
    code: "goal_complete",
    title: "ทำได้!",
    description: "บรรลุเป้าหมายการออมครั้งแรก",
    icon: "🏆",
    xpReward: 200,
    check: (s) => s.completedGoals >= 1,
  },
  {
    code: "loan_settled",
    title: "หนี้สะอาด",
    description: "ชำระหนี้ครบ 1 รายการ",
    icon: "✨",
    xpReward: 80,
    check: (s) => s.settledLoans >= 1,
  },
  {
    code: "investor",
    title: "นักลงทุน",
    description: "เพิ่มการลงทุน 1 รายการ",
    icon: "📈",
    xpReward: 50,
    check: (s) => s.investmentCount >= 1,
  },
]

export async function grantXP(userId: string, amount: number, _reason?: string) {
  const stats = await prisma.userStats.upsert({
    where: { userId },
    create: { userId, xp: amount, level: 1 },
    update: { xp: { increment: amount } },
  })
  const { level } = calcLevel(stats.xp)
  if (level !== stats.level) {
    await prisma.userStats.update({ where: { userId }, data: { level } })
  }
  return stats
}

export async function checkAndGrantAchievements(userId: string) {
  // Gather stats needed for checks
  const [txCount, completedGoals, settledLoans, investCount, userStats] = await Promise.all([
    prisma.transaction.count({ where: { userId, deletedAt: null } }),
    prisma.savingsGoal.count({ where: { userId, completedAt: { not: null } } }),
    prisma.loan.count({ where: { userId, status: "settled" } }),
    prisma.investment.count({ where: { userId } }),
    prisma.userStats.findUnique({ where: { userId } }),
  ])

  const stats = {
    transactionCount: txCount,
    savingStreak:    userStats?.savingStreak  ?? 0,
    budgetStreak:    userStats?.budgetStreak  ?? 0,
    completedGoals,
    settledLoans,
    investmentCount: investCount,
  }

  const earned: string[] = []
  for (const ach of ACHIEVEMENTS) {
    if (!ach.check(stats)) continue
    // upsert — skip if already has it
    const existing = await prisma.achievement.findUnique({
      where: { userId_code: { userId, code: ach.code } },
    })
    if (existing) continue

    await prisma.achievement.create({
      data: {
        userId,
        code:        ach.code,
        title:       ach.title,
        description: ach.description,
        icon:        ach.icon,
        xpReward:    ach.xpReward,
      },
    })
    await grantXP(userId, ach.xpReward, `achievement:${ach.code}`)
    earned.push(ach.code)
  }
  return earned
}
