export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"
import { ok, handleError, zodError } from "@/lib/api-response"
import { calculateTax } from "@/lib/tax"

const schema = z.object({
  year: z.number().int().min(2020).max(2100).default(new Date().getFullYear()),
  country: z.string().length(2).optional(),
  salaryIncome: z.number().min(0).default(0),
  otherIncome: z.number().min(0).default(0),
  personalAllowance: z.number().min(0).default(60_000),
  spouseAllowance: z.number().min(0).default(0),
  childAllowance: z.number().min(0).default(0),
  parentAllowance: z.number().min(0).default(0),
  ssf: z.number().min(0).max(200_000).default(0),
  rmf: z.number().min(0).default(0),
  lifeInsurance: z.number().min(0).max(100_000).default(0),
  healthInsurance: z.number().min(0).max(25_000).default(0),
  socialSecurity: z.number().min(0).max(9_000).default(0),
  thaeesp: z.number().min(0).default(0),
  ltf: z.number().min(0).default(0),
  donation: z.number().min(0).default(0),
  homeLoanInterest: z.number().min(0).max(100_000).default(0),
  useActualIncome: z.boolean().default(false),
})

const SUPPORTED = ["TH", "US", "GB", "AU", "DE", "SG", "MY", "JP"]

export async function GET() {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    const user = await prisma.user.findUnique({ where: { id: auth.user.id }, select: { country: true, currency: true } })
    return ok({ supportedCountries: SUPPORTED, defaultCountry: user?.country ?? "TH", currency: user?.currency ?? "THB" })
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    const input = schema.parse(await req.json())
    const user = await prisma.user.findUnique({ where: { id: auth.user.id }, select: { country: true, currency: true } })
    const country = (input.country ?? user?.country ?? "TH").toUpperCase()

    let salaryIncome = input.salaryIncome
    if (input.useActualIncome) {
      const agg = await prisma.transaction.aggregate({
        where: {
          userId: auth.user.id,
          type: "income",
          happenedAt: { gte: new Date(input.year, 0, 1), lte: new Date(input.year, 11, 31, 23, 59, 59) },
        },
        _sum: { amount: true },
      })
      salaryIncome = Number(agg._sum.amount ?? 0)
    }

    const result = calculateTax(country, { ...input, salaryIncome, totalIncome: salaryIncome + input.otherIncome })
    return ok({ ...result, year: input.year, currency: result.currency || user?.currency || "THB", supported: SUPPORTED.includes(country) })
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}
