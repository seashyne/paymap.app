export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiFeature } from "@/lib/subscription/api-guard"
import { badRequest, created, handleError } from "@/lib/api-response"
import { parseStatementCsv } from "@/lib/reconciliation/engine"
import { z } from "zod"

const schema = z.object({
  source: z.string().min(1).default("csv"),
  sourceLabel: z.string().optional(),
  currency: z.string().min(3).max(8).default("THB"),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  csv: z.string().min(1, "ต้องมีข้อมูล statement"),
  organizationId: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiFeature("business_reconciliation")
    if ("error" in auth) return auth.error

    const input = schema.parse(await req.json())
    const parsed = parseStatementCsv(input.csv)
    if (!parsed.length) {
      return badRequest("ไม่พบ statement rows ที่ถูกต้อง")
    }

    const statement = await prisma.bankStatement.create({
      data: {
        userId: auth.user.id,
        organizationId: input.organizationId ?? null,
        source: input.source,
        sourceLabel: input.sourceLabel,
        currency: input.currency,
        accountName: input.accountName,
        accountNumber: input.accountNumber,
        lines: {
          create: parsed.map((line) => ({
            lineNo: line.lineNo,
            bookedAt: line.bookedAt,
            description: line.description,
            reference: line.reference,
            amount: line.amount,
            kind: line.kind,
          })),
        },
      },
      include: { lines: true },
    })

    return created({ statement })
  } catch (error) {
    return handleError(error)
  }
}
