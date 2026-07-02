export const dynamic = "force-dynamic"
// v24.0: Gamification API — XP, Level, Achievements, Streaks
import { NextRequest } from "next/server"
import { ok, handleError } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { calcLevel, checkAndGrantAchievements, LEVEL_TABLE, ACHIEVEMENTS } from "@/lib/gamification"

export async function GET() {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    // Check for new achievements
    const newlyEarned = await checkAndGrantAchievements(auth.user.id)

    const [stats, achievements] = await Promise.all([
      prisma.userStats.upsert({
        where:  { userId: auth.user.id },
        create: { userId: auth.user.id },
        update: {},
      }),
      prisma.achievement.findMany({
        where:   { userId: auth.user.id },
        orderBy: { earnedAt: "desc" },
      }),
    ])

    const { level, nextLevelXP } = calcLevel(stats.xp)
    const currentLevelXP = LEVEL_TABLE.find(r => r.level === level)?.minXP ?? 0
    const xpProgress = nextLevelXP
      ? Math.round(((stats.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)
      : 100

    // All possible achievements with earned status
    const allAchievements = ACHIEVEMENTS.map(a => ({
      code:        a.code,
      title:       a.title,
      description: a.description,
      icon:        a.icon,
      xpReward:    a.xpReward,
      earned:      achievements.some(e => e.code === a.code),
      earnedAt:    achievements.find(e => e.code === a.code)?.earnedAt ?? null,
    }))

    return ok({
      stats: {
        xp:           stats.xp,
        level,
        nextLevelXP,
        xpProgress,
        savingStreak: stats.savingStreak,
        budgetStreak: stats.budgetStreak,
        totalBadges:  achievements.length,
      },
      achievements:  allAchievements,
      newlyEarned,   // caller can show toast for these
    })
  } catch (e) {
    return handleError(e)
  }
}
