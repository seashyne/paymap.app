"use client"
// v24.0: Achievements & Gamification UI
import { useEffect, useState, useCallback } from "react"
import { Trophy, Zap, Flame, RefreshCw, Star } from "lucide-react"

type Stats = {
  xp: number; level: number; nextLevelXP: number | null; xpProgress: number
  savingStreak: number; budgetStreak: number; totalBadges: number
}
type Achievement = {
  code: string; title: string; description: string; icon: string
  xpReward: number; earned: boolean; earnedAt: string | null
}

const LEVEL_TITLES: Record<number, string> = {
  1: "มือใหม่", 2: "ผู้เริ่มต้น", 3: "นักออมหน้าใหม่", 4: "นักออมมือโปร",
  5: "ผู้เชี่ยวชาญ", 6: "นักการเงิน", 7: "ผู้เชี่ยวชาญระดับสูง",
  8: "ปรมาจารย์", 9: "ตำนาน", 10: "เทพแห่งการเงิน",
}

export default function AchievementsClient() {
  const [data, setData] = useState<{ stats: Stats; achievements: Achievement[]; newlyEarned: string[] } | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch("/api/gamification")
      const d = await r.json()
      if (d.success) setData(d.data)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="animate-spin text-yellow-500" size={28}/></div>
  if (!data) return null

  const { stats, achievements } = data
  const earned   = achievements.filter(a => a.earned)
  const unearned = achievements.filter(a => !a.earned)

  return (
    <div className="space-y-6">
      {/* Level Card */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">Level {stats.level}</p>
            <p className="text-2xl font-bold">{LEVEL_TITLES[stats.level] ?? "นักการเงิน"}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            {stats.level}
          </div>
        </div>
        {/* XP Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs opacity-80">
            <span>{stats.xp.toLocaleString()} XP</span>
            <span>{stats.nextLevelXP ? `${stats.nextLevelXP.toLocaleString()} XP` : "MAX"}</span>
          </div>
          <div className="h-2.5 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${stats.xpProgress}%` }}/>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 text-center">
          <Flame className="mx-auto mb-1 text-orange-500" size={22}/>
          <p className="text-2xl font-bold text-orange-600">{stats.savingStreak}</p>
          <p className="text-xs text-gray-500">วันออม streak</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center">
          <Star className="mx-auto mb-1 text-blue-500" size={22}/>
          <p className="text-2xl font-bold text-blue-600">{stats.budgetStreak}</p>
          <p className="text-xs text-gray-500">เดือนรักษางบ</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4 text-center">
          <Trophy className="mx-auto mb-1 text-yellow-500" size={22}/>
          <p className="text-2xl font-bold text-yellow-600">{stats.totalBadges}</p>
          <p className="text-xs text-gray-500">badges</p>
        </div>
      </div>

      {/* Earned Achievements */}
      {earned.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Trophy size={16} className="text-yellow-500"/> ความสำเร็จที่ได้รับ ({earned.length})</h2>
          <div className="grid grid-cols-2 gap-3">
            {earned.map(a => (
              <div key={a.code} className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs text-gray-500">{a.description}</p>
                    <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1"><Zap size={10}/> +{a.xpReward} XP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {unearned.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3 text-gray-400">🔒 ยังไม่ได้รับ ({unearned.length})</h2>
          <div className="grid grid-cols-2 gap-3">
            {unearned.map(a => (
              <div key={a.code} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 opacity-60">
                <div className="flex items-start gap-2">
                  <span className="text-2xl grayscale">{a.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-500">{a.title}</p>
                    <p className="text-xs text-gray-400">{a.description}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Zap size={10}/> +{a.xpReward} XP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
