// PayMap v5 — Accounting Journal API
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { requireApiFeature } from "@/lib/subscription/api-guard"
import { prisma } from "@/lib/prisma"
import { createJournalEntry, validateJournal } from "@/lib/accounting/engine"
import { ok, handleError } from "@/lib/api-response"
import { z } from "zod"

const lineSchema = z.object({
  accountId: z.string().min(1),
  debit:     z.number().min(0).optional().default(0),
  credit:    z.number().min(0).optional().default(0),
  note:      z.string().optional(),
})

const createSchema = z.object({
  description: z.string().optional(),
  date:        z.string().optional(),
  sourceType:  z.string().optional(),
  sourceId:    z.string().optional(),
  lines:       z.array(lineSchema).min(2),
})

// POST /api/accounting/journal — create journal entry
export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiFeature("business_accounting")
    if ("error" in auth) return auth.error

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { description, date, sourceType, sourceId, lines } = parsed.data

    try {
      validateJournal(lines)
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 422 })
    }

    const entry = await createJournalEntry({
      userId: auth.user.id,
      description,
      date:       date ? new Date(date) : undefined,
      sourceType,
      sourceId,
      lines,
    })

    return NextResponse.json({ ok: true, entry }, { status: 201 })
  } catch (err: any) {
    console.error("[journal POST]", err)
    return handleError(err)
  }
}

// GET /api/accounting/journal — list journal entries
export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiFeature("business_accounting")
    if ("error" in auth) return auth.error

    const { searchParams } = new URL(req.url)
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)))
    const skip  = (page - 1) * limit

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where:   { userId: auth.user.id },
        include: { lines: { include: { account: { select: { code: true, name: true } } } } },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.journalEntry.count({ where: { userId: auth.user.id } }),
    ])

    return ok({ entries, total, page, limit })
  } catch (err: any) {
    return handleError(err)
  }
}
