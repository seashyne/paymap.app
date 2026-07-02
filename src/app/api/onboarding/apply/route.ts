export const dynamic = "force-dynamic"
// POST /api/onboarding/apply
// Apply template: seed budgets, savings goals, extra categories, update currency

import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getTemplateById } from "@/lib/onboarding-templates"
import { z } from "zod"

const schema = z.object({
  templateId: z.string().min(1),
  workspaceName: z.string().min(1).max(60).optional(),
  currency: z.string().length(3).optional().default("THB"),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error as NextResponse

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.errors }, { status: 400 })
    }

    const { templateId, workspaceName, currency } = parsed.data
    const template = getTemplateById(templateId)
    if (!template) {
      return NextResponse.json({ error: `Template "${templateId}" not found` }, { status: 404 })
    }

    const userId   = auth.user.id
    const now      = new Date()
    const month    = now.getMonth() + 1
    const year     = now.getFullYear()

    // ── 1. อัปเดต currency และ displayName ──────────────────────────────
    await prisma.user.update({
      where: { id: userId },
      data: {
        currency,
        ...(workspaceName ? { displayName: workspaceName } : {}),
      },
    })

    // ── 2. seed extra categories ─────────────────────────────────────────
    if (template.seed.extraCategories?.length) {
      for (const cat of template.seed.extraCategories) {
        await prisma.category.upsert({
          where: { userId_name_type: { userId, name: cat.name, type: cat.type } },
          update: { color: cat.color, icon: cat.icon },
          create: { userId, name: cat.name, type: cat.type, color: cat.color, icon: cat.icon, isSystem: false },
        })
      }
    }

    // ── 3. seed budgets สำหรับเดือนนี้ ──────────────────────────────────
    if (template.seed.budgets?.length) {
      for (const b of template.seed.budgets) {
        // หา category id ที่ตรงกับชื่อ
        const cat = await prisma.category.findFirst({
          where: { userId, name: b.categoryName },
          select: { id: true },
        })
        if (!cat) continue

        // upsert budget เดือนนี้
        await prisma.budget.upsert({
          where: {
            // Prisma unique: userId + categoryId + month + year
            userId_categoryId_month_year: {
              userId,
              categoryId: cat.id,
              month,
              year,
            },
          },
          update: { limitAmount: b.limitAmount, currency },
          create: {
            userId,
            categoryId: cat.id,
            month,
            year,
            limitAmount: b.limitAmount,
            currency,
          },
        })
      }
    }

    // ── 4. seed savings goals ────────────────────────────────────────────
    if (template.seed.savingsGoals?.length) {
      for (const g of template.seed.savingsGoals) {
        // ตรวจว่ามีชื่อเดิมอยู่แล้วไหม (ไม่สร้างซ้ำ)
        const existing = await prisma.savingsGoal.findFirst({
          where: { userId, name: g.name },
          select: { id: true },
        })
        if (existing) continue

        const deadline = g.months
          ? new Date(now.getFullYear(), now.getMonth() + g.months, 1)
          : undefined

        await prisma.savingsGoal.create({
          data: {
            userId,
            name: g.name,
            targetAmount: g.targetAmount,
            savedAmount: 0,
            currency,
            icon: g.icon,
            color: g.color,
            ...(deadline ? { deadline } : {}),
          },
        })
      }
    }

    // ── 5. บันทึกว่า onboarding เสร็จแล้ว (ใช้ field displayName หรือ bio) ─
    // เราเก็บ templateId ไว้ใน bio ถ้ายังไม่มีข้อมูล
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { bio: true },
    })
    if (!currentUser?.bio) {
      await prisma.user.update({
        where: { id: userId },
        data: { bio: `onboarding:${templateId}` },
      })
    }

    return NextResponse.json({
      ok: true,
      templateId,
      templateName: template.name,
      currency,
      seeded: {
        extraCategories: template.seed.extraCategories?.length ?? 0,
        budgets: template.seed.budgets?.length ?? 0,
        savingsGoals: template.seed.savingsGoals?.length ?? 0,
      },
    })
  } catch (err: any) {
    console.error("[onboarding/apply]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
