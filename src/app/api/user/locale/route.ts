export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireApiUser } from "@/lib/authz"
import { ok, handleError, zodError } from "@/lib/api-response"
import { CURRENCIES, CURRENCY_LIST } from "@/lib/i18n/currencies"
import { COUNTRY_LIST } from "@/lib/i18n/countries"
import { signSession, getCurrentSession, getSessionCookieOptions } from "@/lib/session"

const schema = z.object({
  country:  z.string().length(2).optional(),
  currency: z.string().min(3).max(3).optional(),
  locale:   z.string().optional(),
  timezone: z.string().optional(),
})

export async function GET() {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error
  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { country:true, currency:true, locale:true, timezone:true },
  })
  return ok({ ...user, currencies: CURRENCY_LIST, countries: COUNTRY_LIST })
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error
    const data = schema.parse(await req.json())
    if (data.currency && !CURRENCIES[data.currency.toUpperCase()])
      return ok(null, "สกุลเงินที่เลือกยังไม่รองรับ")

    const updated = await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        ...(data.country  && { country:  data.country.toUpperCase()  }),
        ...(data.currency && { currency: data.currency.toUpperCase() }),
        ...(data.locale   && { locale:   data.locale   }),
        ...(data.timezone && { timezone: data.timezone }),
      },
      select: { country:true, currency:true, locale:true, timezone:true, name:true, email:true, role:true, plan:true, emailVerified:true, image:true, provider:true },
    })

    // v0.4: re-sign JWT so locale changes take effect immediately without re-login
    const session = await getCurrentSession()
    if (session) {
      const newJwt = await signSession({
        sub:           auth.user.id,
        email:         updated.email,
        name:          updated.name,
        role:          updated.role as any,
        plan:          updated.plan as any,
        subscriptions: session.subscriptions ?? [],
        emailVerified: !!updated.emailVerified,
        picture:       updated.image,
        provider:      updated.provider ?? undefined,
        country:       updated.country,
        currency:      updated.currency,
        locale:        updated.locale,
        timezone:      updated.timezone,
        accountMode:   session.accountMode,
        workspaceMode: session.accountMode,
        isDemo:        session.isDemo,
        activeOrgId:   session.activeOrgId,
      })
      const cookieOpts = getSessionCookieOptions()
      const response = NextResponse.json({ ok: true, data: updated, message: "อัปเดตการตั้งค่าสำเร็จ" })
      response.cookies.set(cookieOpts.name, newJwt, cookieOpts.options)
      return response
    }

    return ok(updated, "อัปเดตการตั้งค่าสำเร็จ")
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}
