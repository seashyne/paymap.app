// v1.8: AI Financial Advisor — powered by Claude Sonnet
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { requireApiUser, hasAIAdvisor } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/auth-helpers"

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error

    // v2.1: AI Advisor available on Pro or AI add-on plan
    // Free users get 3 messages/day as preview
    const user2 = await import("@/lib/prisma").then(m => m.prisma.user.findUnique({
      where: { id: auth.user.id },
      include: { productSubscriptions: { select: { product: true, planTier: true, status: true, currentPeriodEnd: true } } }
    }))
    const isAIPlan = user2 ? hasAIAdvisor(user2) : false
    const rateLimit = isAIPlan ? 300 : 3  // 3/day free preview
    const rl = await checkRateLimit(`ai:${auth.user.id}`, rateLimit, isAIPlan ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
    if (!rl.allowed) {
      return NextResponse.json({
        error: isAIPlan ? "ใช้งาน AI เกินโควต้า กรุณารอ 1 ชั่วโมง" : "ใช้งาน AI ฟรีได้ 3 ครั้ง/วัน — อัปเกรดเป็น Pro หรือ AI Add-on เพื่อใช้งานไม่จำกัด",
        upgradeRequired: !isAIPlan,
      }, { status: 429 })
    }

    const { message, sessionHistory = [] } = await req.json()
    if (!message?.trim()) return NextResponse.json({ error: "กรุณาพิมพ์คำถาม" }, { status: 400 })

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const [monthlyAgg, budgets, goals, subs, recentTx, user] = await Promise.all([
      prisma.transaction.groupBy({ by: ["type"], where: { userId: auth.user.id, happenedAt: { gte: startOfMonth, lte: endOfMonth } }, _sum: { amount: true } }),
      prisma.budget.findMany({ where: { userId: auth.user.id, year: now.getFullYear(), month: now.getMonth() + 1 }, include: { category: { select: { name: true } } } }),
      prisma.savingsGoal.findMany({ where: { userId: auth.user.id } }),
      prisma.subscription.findMany({ where: { userId: auth.user.id, status: "active" } }),
      prisma.transaction.findMany({ where: { userId: auth.user.id, deletedAt: null, happenedAt: { gte: startOfMonth } }, include: { category: { select: { name: true } } }, orderBy: { happenedAt: "desc" }, take: 20 }),
      prisma.user.findUnique({ where: { id: auth.user.id }, select: { name: true, currency: true } }),
    ])

    const monthIncome  = Number(monthlyAgg.find(r => r.type === "income")?._sum.amount ?? 0)
    const monthExpense = Number(monthlyAgg.find(r => r.type === "expense")?._sum.amount ?? 0)
    const savingsRate  = monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : 0

    // Budget status (parallel)
    const budgetStatus = await Promise.all(budgets.map(async b => {
      const spent = await prisma.transaction.aggregate({
        where: { userId: auth.user.id, categoryId: b.categoryId, type: "expense", happenedAt: { gte: startOfMonth } },
        _sum: { amount: true },
      })
      const spentAmt = Number(spent._sum.amount ?? 0)
      const limit = Number(b.limitAmount)
      return { category: b.category.name, spent: spentAmt, limit, percent: limit > 0 ? Math.round(spentAmt/limit*100) : 0 }
    }))

    const systemPrompt = `คุณคือ "payMap AI Advisor" ที่ปรึกษาการเงินส่วนตัว พูดภาษาไทย เป็นกันเอง แต่ข้อมูลแม่นยำ

ข้อมูลการเงินของ ${user?.name ?? "ผู้ใช้"} เดือนนี้:
รายรับ ฿${monthIncome.toLocaleString()} | รายจ่าย ฿${monthExpense.toLocaleString()} | อัตราออม ${savingsRate}%

Budget: ${budgetStatus.map(b => `${b.category} ${b.percent}%${b.percent>=100?" ⚠️":b.percent>=80?" ⚡":""}`).join(", ") || "ยังไม่ตั้ง"}

เป้าออม: ${goals.map(g => `${g.name} ${Math.round(Number(g.savedAmount)/Number(g.targetAmount)*100)}%`).join(", ") || "ยังไม่มี"}

Subscriptions: ${subs.length} รายการ ฿${subs.reduce((s, x) => s + Number(x.amount), 0).toLocaleString()}/เดือน

รายการล่าสุด: ${recentTx.slice(0, 6).map(tx => `${tx.type==="income"?"+":"-"}฿${Number(tx.amount).toLocaleString()} ${tx.note ?? ""}`).join(" | ")}

ตอบสั้น actionable ไม่เกิน 200 คำ ใช้ข้อมูลจริงด้านบน`

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "AI Advisor ยังไม่ได้ตั้งค่า API key — กรุณาเพิ่ม ANTHROPIC_API_KEY ใน .env.local", setup: true }, { status: 503 })
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system: systemPrompt,
        messages: [...sessionHistory.slice(-8), { role: "user", content: message }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "AI advisor ไม่พร้อมใช้งาน ลองใหม่อีกครั้ง" }, { status: 503 })
    }

    const data = await response.json()
    const reply = data.content?.find((c: any) => c.type === "text")?.text ?? "ไม่สามารถตอบได้"
    return NextResponse.json({ reply, remaining: rl.remaining })
  } catch (e) {
    console.error("[AI Advisor]", e)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
