import Link from "next/link"
import { Plus, CreditCard, Building2, Store, ChevronRight, Sparkles, ArrowRight } from "lucide-react"
import { requireUser } from "@/lib/authz"
import { listUserWorkspaces } from "@/lib/v23/workspace-bridge"
import { LogoFull } from "@/components/ui/Logo"
import { getRoutesByMode } from "@/lib/v151-route-map"
import { prisma } from "@/lib/prisma"
import { inferWorkspaceModeFromPath } from "@/lib/workspace"
import { detectSiteLang, getWorkspaceFlowMessages } from "@/lib/i18n/site"

const MODE_META = {
  personal: { icon: CreditCard, color: "#7c3aed", bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.25)", label: "Personal" },
  business: { icon: Building2,  color: "#0ea5e9", bg: "rgba(14,165,233,0.1)",  border: "rgba(14,165,233,0.25)",  label: "Business" },
  merchant: { icon: Store,      color: "#e11d48", bg: "rgba(225,29,72,0.1)",   border: "rgba(225,29,72,0.25)",   label: "Merchant" },
} as const

export default async function WorkspaceSelectPage({
  searchParams,
}: {
  searchParams?: { from?: string; next?: string }
}) {
  const user = await requireUser()
  const lang = detectSiteLang()
  const copy = getWorkspaceFlowMessages(lang).select
  const accountMode = (user as any).accountMode ?? "personal"
  const safeNext = searchParams?.next && searchParams.next.startsWith("/") ? searchParams.next : null
  const requestedMode = inferWorkspaceModeFromPath(safeNext)

  const accounts = await prisma.user.findMany({
    where: { email: user.email },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      accountMode: true,
      productSubscriptions: { where: { status: "active" }, select: { product: true, planTier: true, status: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  const workspaceSets = await Promise.all(
    accounts.map(async (account) => ({
      mode: account.accountMode,
      workspaces: (await listUserWorkspaces(account as any)).filter((workspace) => workspace.type === account.accountMode),
    })),
  )

  const workspaces = workspaceSets.flatMap((entry) => entry.workspaces)
  const routeHighlights = Array.from(
    new Map(
      accounts.flatMap((account) =>
        getRoutesByMode(account.accountMode as any).slice(0, 2).map((item) => [item.path, item]),
      ),
    ).values(),
  ).slice(0, 6)

  const personal = workspaces.filter(w => w.type === "personal")
  const business = workspaces.filter(w => w.type === "business")
  const merchant = workspaces.filter(w => w.type === "merchant")
  const hasOnlyPersonalAccount = accounts.length === 1 && accounts[0]?.accountMode === "personal"
  const personalWorkspace = personal[0] ?? null
  const isWelcomeState = hasOnlyPersonalAccount && business.length === 0 && merchant.length === 0 && !!personalWorkspace

  const grouped = [
    { type: "personal" as const, items: personal, hasAccount: accounts.some((account) => account.accountMode === "personal") },
    { type: "business" as const, items: business, hasAccount: accounts.some((account) => account.accountMode === "business") },
    { type: "merchant" as const, items: merchant, hasAccount: accounts.some((account) => account.accountMode === "merchant") },
  ].filter(g => g.items.length > 0 || (g.type !== "personal"))

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "var(--bg)", fontFamily: "var(--font-sans)" }}>

      {/* bg glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-[0.04] blur-[100px]"
          style={{ background: "#7c3aed" }} />
      </div>

      <div className="w-full max-w-[480px]">
        <div className="flex justify-center mb-10">
          <Link href="/"><LogoFull height={26} className="text-[var(--text)]" /></Link>
        </div>

        <h1 className="text-2xl font-black mb-1" style={{ color: "var(--text)" }}>{copy.title}</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
          {isWelcomeState ? copy.welcomeIntro : copy.intro}
        </p>

        {isWelcomeState ? (
          <section className="mb-8 rounded-[28px] border border-[rgba(91,71,211,0.16)] bg-[linear-gradient(180deg,rgba(91,71,211,0.12),rgba(255,255,255,0.96))] p-6 shadow-[0_30px_90px_rgba(91,71,211,0.10)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(91,71,211,0.16)] bg-white/70 px-3 py-1.5 text-xs font-bold text-[#5b47d3]">
              <Sparkles size={12} /> {copy.welcomeBadge}
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em]" style={{ color: "var(--text)" }}>
              {copy.welcomeTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">
              {copy.welcomeBody}
            </p>

            <div className="mt-6 grid gap-3">
              <Link
                href={safeNext && requestedMode === "personal" ? safeNext : personalWorkspace.href}
                className="rounded-[24px] border border-[rgba(91,71,211,0.18)] bg-white px-5 py-5 shadow-[0_18px_40px_rgba(91,71,211,0.08)] transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(91,71,211,0.18)] bg-[rgba(91,71,211,0.10)] text-[#5b47d3]">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div className="text-base font-black text-[var(--text)]">{copy.openPersonal}</div>
                      <div className="mt-1 text-sm text-[var(--text-3)]">{copy.openPersonalBody}</div>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-[#5b47d3]" />
                </div>
              </Link>

              <div className="grid gap-3 md:grid-cols-2">
                <Link
                  href="/register?mode=business"
                  className="rounded-[22px] border px-4 py-4 transition-transform hover:-translate-y-0.5"
                  style={{ borderColor: MODE_META.business.border, background: MODE_META.business.bg }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border" style={{ borderColor: MODE_META.business.border, color: MODE_META.business.color }}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div className="font-black" style={{ color: MODE_META.business.color }}>{copy.addBusiness}</div>
                      <div className="mt-1 text-xs text-[var(--text-3)]">{copy.addBusinessBody}</div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/register?mode=merchant"
                  className="rounded-[22px] border px-4 py-4 transition-transform hover:-translate-y-0.5"
                  style={{ borderColor: MODE_META.merchant.border, background: MODE_META.merchant.bg }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border" style={{ borderColor: MODE_META.merchant.border, color: MODE_META.merchant.color }}>
                      <Store size={18} />
                    </div>
                    <div>
                      <div className="font-black" style={{ color: MODE_META.merchant.color }}>{copy.addMerchant}</div>
                      <div className="mt-1 text-xs text-[var(--text-3)]">{copy.addMerchantBody}</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <div className="space-y-6">
          {grouped.map(({ type, items, hasAccount }) => {
            const meta = MODE_META[type]
            const Icon = meta.icon
            const canCreateAccount = type !== "personal" && !hasAccount
            const canCreateWorkspace = type !== "personal" && hasAccount
            return (
              <div key={type}>
                {/* Section label */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={13} style={{ color: meta.color }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-3)" }}>
                      {items.length > 0 ? `· ${items.length} ${copy.workspaceCount}` : ""}
                    </span>
                  </div>
                  {canCreateAccount && (
                    <Link href={`/register?mode=${type}`}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all"
                      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                      <Plus size={11} /> {copy.addMode}
                    </Link>
                  )}
                  {!canCreateAccount && canCreateWorkspace && (
                    <Link href={`/workspace/new?type=${type}`}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all"
                      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                      <Plus size={11} /> {copy.createNew}
                    </Link>
                  )}
                </div>

                {/* Workspace cards */}
                <div className="space-y-2">
                  {items.map((ws) => {
                    const isVirtual = ws.source === "virtual"
                    const targetHref = safeNext && requestedMode === ws.type ? safeNext : ws.href
                    const linkHref = ws.type === accountMode
                      ? targetHref
                      : `/api/auth/switch-mode?mode=${ws.type}&redirect=${encodeURIComponent(targetHref)}`
                    return (
                      <Link key={ws.slug} href={linkHref}
                        className="flex items-center gap-4 p-4 rounded-2xl transition-all group"
                        style={{ background: "var(--card)", border: `1px solid var(--border)` }}>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                          <Icon size={18} style={{ color: meta.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm truncate" style={{ color: "var(--text)" }}>{ws.name}</div>
                          <div className="text-xs flex items-center gap-2 mt-0.5" style={{ color: "var(--text-3)" }}>
                            <span className="capitalize">{ws.plan}</span>
                            {isVirtual && <span>· {copy.defaultTag}</span>}
                            {ws.type === accountMode && <span>· {copy.activeTag}</span>}
                          </div>
                        </div>
                        <ChevronRight size={16} style={{ color: "var(--text-3)" }}
                          className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )
                  })}

                  {/* Empty state for mode that has no workspace yet */}
                  {items.length === 0 && canCreateAccount && (
                    <Link href={`/register?mode=${type}`}
                      className="flex items-center gap-4 p-4 rounded-2xl border-dashed transition-all"
                      style={{ border: `1.5px dashed ${meta.border}`, background: meta.bg }}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: "rgba(0,0,0,0.05)" }}>
                        <Plus size={18} style={{ color: meta.color }} />
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: meta.color }}>
                          {copy.addAccount.replace("{label}", meta.label)}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                          {copy.addAccountBody}
                        </div>
                      </div>
                    </Link>
                  )}

                  {items.length === 0 && !canCreateAccount && canCreateWorkspace && (
                    <Link href={`/workspace/new?type=${type}`}
                      className="flex items-center gap-4 p-4 rounded-2xl border-dashed transition-all"
                      style={{ border: `1.5px dashed ${meta.border}`, background: meta.bg }}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: "rgba(0,0,0,0.05)" }}>
                        <Plus size={18} style={{ color: meta.color }} />
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: meta.color }}>
                          {copy.createFirst.replace("{label}", meta.label)}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                          {copy.createFirstBody}
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--text-3)" }}>{copy.routeHighlights}</div>
          <div className="mt-3 grid gap-2">
            {routeHighlights.map((item) => (
              <Link key={item.path} href={item.path.includes("[") ? "/dashboard" : item.path} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold">
                <span>{item.name}</span>
                <span style={{ color: "var(--text-3)" }}>{item.path}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>
            {copy.useAnother}{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "var(--text-2)" }}>
              {copy.loginAnother} →
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
