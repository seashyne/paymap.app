// v1.8: Global Search API — ค้นทุกอย่างใน payMap ใน request เดียว
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { ok, handleError } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error

    const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
    if (q.length < 2) return ok({ results: [], total: 0 })

    const userId = auth.user.id
    const lq     = q.toLowerCase()

    // Run all searches in parallel
    const [txHits, goalHits, subHits, orgData] = await Promise.all([
      // Transactions: search by note
      prisma.transaction.findMany({
        where: {
          userId,
          deletedAt: null,  // v1.9: exclude soft-deleted
          note: { contains: q, mode: "insensitive" },
        },
        include: { category: { select: { name: true, color: true, icon: true } } },
        orderBy: { happenedAt: "desc" },
        take: 5,
      }),

      // Savings Goals: search by name
      prisma.savingsGoal.findMany({
        where: { userId, name: { contains: q, mode: "insensitive" } },
        take: 3,
      }),

      // Subscriptions: search by name
      prisma.subscription.findMany({
        where: { userId, name: { contains: q, mode: "insensitive" } },
        take: 3,
      }),

      // Business: employees + invoices (if org exists)
      prisma.organization.findFirst({
        where: { ownerId: userId },
        select: {
          id: true,
          employees: {
            where: {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { position: { contains: q, mode: "insensitive" } },
              ],
            },
            take: 3,
          },
          invoices: {
            where: {
              OR: [
                { number: { contains: q, mode: "insensitive" } },
                { customerName: { contains: q, mode: "insensitive" } },
              ],
            },
            take: 3,
          },
        },
      }),
    ])

    type SearchResult = {
      type: string
      id: string
      title: string
      subtitle?: string
      amount?: number
      badge?: string
      badgeColor?: string
      href: string
      icon: string
    }

    const results: SearchResult[] = []

    // Transactions
    for (const tx of txHits) {
      results.push({
        type: "transaction",
        id: tx.id,
        title: tx.note ?? `${tx.type === "income" ? "รายรับ" : "รายจ่าย"}`,
        subtitle: `${tx.category?.name ?? "ไม่ระบุหมวด"} · ${new Date(tx.happenedAt).toLocaleDateString("th-TH")}`,
        amount: Number(tx.amount),
        badge: tx.type === "income" ? "รายรับ" : "รายจ่าย",
        badgeColor: tx.type === "income" ? "#22c55e" : "#f43f5e",
        href: "/dashboard?tab=overview",
        icon: tx.category?.icon ?? (tx.type === "income" ? "💰" : "💸"),
      })
    }

    // Savings Goals
    for (const g of goalHits) {
      const pct = Number(g.targetAmount) > 0 ? Math.round(Number(g.savedAmount) / Number(g.targetAmount) * 100) : 0
      results.push({
        type: "goal",
        id: g.id,
        title: g.name,
        subtitle: `ออมแล้ว ${pct}% · ฿${Number(g.savedAmount).toLocaleString()}`,
        badge: "เป้าออม",
        badgeColor: "#f59e0b",
        href: "/dashboard?tab=overview",
        icon: g.icon ?? "🎯",
      })
    }

    // Subscriptions
    for (const s of subHits) {
      results.push({
        type: "subscription",
        id: s.id,
        title: s.name,
        subtitle: `฿${Number(s.amount).toLocaleString()} · ${s.billingCycle}`,
        amount: Number(s.amount),
        badge: s.status,
        badgeColor: s.status === "active" ? "#22c55e" : "#6b7280",
        href: "/dashboard?tab=overview",
        icon: "🔁",
      })
    }

    // Employees
    if (orgData?.employees) {
      for (const e of orgData.employees) {
        results.push({
          type: "employee",
          id: e.id,
          title: e.name,
          subtitle: `${e.position ?? "พนักงาน"} · ฿${Number(e.baseSalary).toLocaleString()}/เดือน`,
          badge: "พนักงาน",
          badgeColor: "#38bdf8",
          href: "/business?tab=overview",
          icon: "👤",
        })
      }
    }

    // Invoices
    if (orgData?.invoices) {
      for (const inv of orgData.invoices) {
        results.push({
          type: "invoice",
          id: inv.id,
          title: `Invoice #${inv.number}`,
          subtitle: `${inv.customerName} · ฿${Number(inv.totalAmount).toLocaleString()}`,
          amount: Number(inv.totalAmount),
          badge: inv.status,
          badgeColor: inv.status === "paid" ? "#22c55e" : inv.status === "overdue" ? "#f43f5e" : "#f59e0b",
          href: "/business?tab=overview",
          icon: "📄",
        })
      }
    }

    // Quick nav suggestions based on query
    const navSuggestions: SearchResult[] = []
    const navMap: Array<{ keywords: string[]; label: string; href: string; icon: string }> = [
      { keywords: ["dashboard", "หน้าหลัก", "personal", "ส่วนตัว"], label: "Personal Dashboard", href: "/dashboard", icon: "🏠" },
      { keywords: ["business", "ธุรกิจ", "hr", "พนักงาน", "payroll", "เงินเดือน"], label: "Business Workspace", href: "/business", icon: "🏢" },
      { keywords: ["merchant", "ร้าน", "pos", "ขาย", "สต็อก", "inventory"], label: "Merchant POS", href: "/merchant", icon: "🏪" },
      { keywords: ["report", "รายงาน", "สรุป"], label: "Reports", href: "/reports", icon: "📊" },
      { keywords: ["setting", "ตั้งค่า", "profile"], label: "Settings", href: "/settings", icon: "⚙️" },
      { keywords: ["billing", "plan", "สมัคร", "upgrade"], label: "Billing & Plans", href: "/billing", icon: "💳" },
      { keywords: ["tax", "ภาษี", "ลดหย่อน"], label: "คำนวณภาษี", href: "/dashboard?tab=overview", icon: "🧾" },
    ]
    for (const nav of navMap) {
      if (nav.keywords.some(kw => lq.includes(kw) || kw.includes(lq))) {
        navSuggestions.push({ type: "nav", id: nav.href, title: nav.label, href: nav.href, icon: nav.icon })
      }
    }

    const allResults = [...results, ...navSuggestions].slice(0, 12)

    return ok({ results: allResults, total: allResults.length, query: q })
  } catch (e) {
    return handleError(e)
  }
}
