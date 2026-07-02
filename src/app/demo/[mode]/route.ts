import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { demoConfig, isDemoEnabled, isDemoMode, DEMO_SESSION_DAYS } from '@/lib/demo'
import { getSessionCookieOptions, signSession } from '@/lib/session'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(
  req: NextRequest,
  { params }: { params: { mode: string } }
) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const rl = await checkRateLimit(`demo:${ip}`, 10, 60 * 60 * 1000)

  if (!rl.allowed) {
    return NextResponse.redirect(new URL('/?error=demo-rate-limited', req.url))
  }

  if (!isDemoEnabled()) {
    return NextResponse.redirect(new URL('/pricing?demo=disabled', req.url))
  }

  if (!isDemoMode(params.mode)) {
    return NextResponse.redirect(new URL('/?error=invalid-demo', req.url))
  }

  const cfg = demoConfig[params.mode]

  const user = await prisma.user.findFirst({
    where: { email: cfg.email },
    orderBy: { createdAt: 'asc' },
    include: {
      productSubscriptions: {
        where: { status: 'active' },
      },
    },
  })

  if (!user) {
    return NextResponse.redirect(
      new URL(`/?error=demo-not-seeded&mode=${params.mode}`, req.url)
    )
  }

  const subscriptions = user.productSubscriptions.map(
    (s) => `${s.product}:${s.planTier}`
  )

  const jwt = await signSession(
  {
    sub: user.id,
    email: user.email,
    name: `${cfg.label} Demo`,
    role: user.role,
    plan: user.plan,
    subscriptions,
    emailVerified: true,
    picture: user.image ?? null,
    provider: user.provider,
    country: user.country,
    currency: user.currency,
    locale: user.locale,
    timezone: user.timezone,
    accountMode: params.mode,
    workspaceMode: params.mode,
    activeOrgId: undefined,
    isDemo: true,
  },
  DEMO_SESSION_DAYS
  )

  const response = NextResponse.redirect(new URL(cfg.redirectTo, req.url))
  const cookie = getSessionCookieOptions(DEMO_SESSION_DAYS)
  response.cookies.set(cookie.name, jwt, cookie.options)

  return response
}