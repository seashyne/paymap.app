import type { ReactNode, CSSProperties } from "react"
import Link from "next/link"
import LogoutButton from "@/components/auth/LogoutButton"
import { HeaderActions, FloatingActions } from "@/components/layout/AppShell"
import { LucideIcon, Home, CreditCard, Settings as SettingsIcon, Building2, Store, LineChart, Wallet } from "lucide-react"
import { LogoFull, LogoIcon } from "@/components/ui/Logo"
import ContextSwitcher, { type WorkspaceContext } from "@/components/layout/ContextSwitcher"
import { getCurrentSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { getUiPreferenceCssVars, mergeUiPreferences } from "@/lib/ui-preferences"
import { getTemplateCssVars, getTemplatePreset } from "@/lib/ui-template-presets"
import { getTemplateNavLabel } from "@/lib/ui-template-content"
import { detectSiteLang, type SiteLang } from "@/lib/i18n/site"
import { getAppMessages } from "@/lib/i18n/app"

export type AppNavItem = {
  href: string
  label: string
  icon?: LucideIcon
  accent?: string
  active?: boolean
}

async function loadUserUiState(currentMode?: WorkspaceContext): Promise<{ availableModes: WorkspaceContext[]; preferences: ReturnType<typeof mergeUiPreferences> }> {
  try {
    const session = await getCurrentSession()
    if (!session?.email) {
      return { availableModes: (currentMode ? [currentMode] : []) as WorkspaceContext[], preferences: mergeUiPreferences(null) }
    }

    const [accounts, currentUser] = await Promise.all([
      prisma.user.findMany({
        where: { email: session.email },
        select: { accountMode: true },
      }),
      session.sub ? prisma.user.findUnique({ where: { id: session.sub }, select: { uiPreferences: true } }) : Promise.resolve(null),
    ])

    const modes: WorkspaceContext[] = Array.from(new Set(accounts.map((account) => account.accountMode as WorkspaceContext)))
    if (currentMode && !modes.includes(currentMode)) modes.unshift(currentMode)
    return { availableModes: modes, preferences: mergeUiPreferences(currentUser?.uiPreferences) }
  } catch (error) {
    console.error("Failed to load AppFrame UI state", error)
    return { availableModes: (currentMode ? [currentMode] : []) as WorkspaceContext[], preferences: mergeUiPreferences(null) }
  }
}

function ContextSwitcherInline({ currentMode, availableModes }: { currentMode: WorkspaceContext; availableModes: WorkspaceContext[] }) {
  if (!availableModes.length) return null
  return <ContextSwitcher currentContext={currentMode} availableContexts={availableModes} compact />
}

function normalizeLabel(label: string) {
  return label.toLowerCase()
}

function scoreNavByTemplate(item: AppNavItem, template: string) {
  const label = normalizeLabel(item.label)
  const href = item.href.toLowerCase()
  if (template === "business") {
    if (label.includes("business") || label.includes("payroll") || label.includes("accounting") || href.includes("/business")) return 0
    if (label.includes("report") || href.includes("/reports")) return 1
    if (label.includes("workspace") || label.includes("team") || href.includes("workspace")) return 2
    if (label.includes("setting") || href.includes("/settings")) return 4
    return 3
  }
  if (template === "merchant") {
    if (label.includes("merchant") || label.includes("sales") || label.includes("inventory") || href.includes("/merchant")) return 0
    if (label.includes("report") || href.includes("/reports")) return 1
    if (label.includes("wallet") || label.includes("billing")) return 2
    if (label.includes("setting") || href.includes("/settings")) return 4
    return 3
  }
  if (template === "family") {
    if (label.includes("family")) return 0
    if (label.includes("dashboard") || href.includes("/dashboard")) return 1
    if (label.includes("wallet") || href.includes("/wallet")) return 2
    if (label.includes("report") || href.includes("/reports")) return 3
    return 4
  }
  if (label.includes("dashboard") || href.includes("/dashboard")) return 0
  if (label.includes("wallet") || href.includes("/wallet")) return 1
  if (label.includes("report") || href.includes("/reports")) return 2
  if (label.includes("setting") || href.includes("/settings")) return 4
  return 3
}

function orderNavByTemplate(nav: AppNavItem[], template: string) {
  return [...nav]
    .map((item) => ({ ...item, label: getTemplateNavLabel(template as any, item.href, item.label) }))
    .sort((a, b) => scoreNavByTemplate(a, template) - scoreNavByTemplate(b, template))
}

export default async function AppFrame({ brand, icon, version, title, subtitle, accent, planLabel, nav, children, accountMode, }: { brand: string; icon: string; version?: string; title: string; subtitle?: string; accent: string; planLabel?: string; nav: AppNavItem[]; children?: ReactNode; accountMode?: WorkspaceContext }) {
  const { availableModes, preferences } = accountMode ? await loadUserUiState(accountMode) : { availableModes: [] as WorkspaceContext[], preferences: mergeUiPreferences(null) }
  const templatePreset = getTemplatePreset(preferences.template)
  const style = { ...getUiPreferenceCssVars(preferences), ...getTemplateCssVars(preferences.template) } as CSSProperties
  const lang = detectSiteLang()
  const t = getAppMessages(lang)
  const orderedNav = orderNavByTemplate(nav, preferences.template)
  const resolvedAccent = preferences.primaryColor || accent
  const activeNav = orderedNav.find((item) => item.active) ?? orderedNav[0]
  const primaryNav = orderedNav.slice(0, 5)
  const secondaryNav = orderedNav.slice(5)
  const workspaceLabel = accountMode ? accountMode.charAt(0).toUpperCase() + accountMode.slice(1) : brand
  const topSummary = subtitle ?? templatePreset.description

  return (
    <div className="app-shell bg-[linear-gradient(180deg,var(--bg)_0%,var(--bg-2)_100%)]" data-template={preferences.template} data-panel-style={templatePreset.shell.panelStyle} style={style}>
      <div className="hero-orb left-[-10rem] top-[-5rem] h-[18rem] w-[18rem] bg-[var(--template-hero-glow)]" />
      <div className="hero-orb right-[-8rem] top-[5rem] h-[16rem] w-[16rem] bg-[var(--amber)]" />

      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <aside className="premium-sidebar border-b border-transparent backdrop-blur-xl lg:sticky lg:top-0 lg:min-h-screen lg:border-b-0" style={{ width: 'var(--sidebar-width, 288px)', background: 'color-mix(in srgb, var(--surface-2) 94%, transparent)' }}>
          <div className="px-4 pb-5 pt-5 lg:px-4">
            <Link href="/" className="flex items-center gap-3 px-2 py-1">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--card)] shadow-[var(--shadow-soft)]">
                <LogoIcon size={20} className="text-[var(--primary)]" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-base font-black text-[var(--primary)]">{brand}</div>
                <div className="truncate text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-3)]">{workspaceLabel}</div>
              </div>
            </Link>
          </div>

          <div className="px-4 pb-5">
            <div className="soft-panel p-4" style={{ borderRadius: '1.5rem', background: 'transparent', border: '0', boxShadow: 'none' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{t.common.activeWorkspace}</div>
                  <div className="mt-2 break-words text-xl font-black leading-tight">{title}</div>
                </div>
                <div className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{workspaceLabel}</div>
              </div>
              <div className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--text-2)]">{topSummary}</div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-3)]">
                  {activeNav?.label ?? t.nav.overview}
                </span>
                <span className="inline-flex items-center rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-3)]">
                  {planLabel ?? "Free"}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-2"><div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Navigation</div></div>
          <nav className="grid gap-1 px-3 pb-4">
            {primaryNav.map((item) => {
              const Icon = item.icon ?? Home
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`sidebar-link ${item.active ? "active" : ""}`}
                  style={item.active ? { borderColor: 'transparent', background: `${item.accent ?? resolvedAccent}20`, color: item.accent ?? resolvedAccent, borderRadius: '1.5rem', boxShadow: 'none' } : { borderRadius: '1.5rem', borderColor: 'transparent', boxShadow: 'none' }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--card)]">
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.active ? <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.accent ?? resolvedAccent }} /> : null}
                </Link>
              )
            })}
          </nav>

          {secondaryNav.length ? (
            <>
              <div className="px-6 pb-2"><div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Tools</div></div>
              <nav className="grid gap-1 px-3 pb-4">
                {secondaryNav.map((item) => {
                  const Icon = item.icon ?? Home
                  return (
                    <Link
                      key={item.href + item.label + "-secondary"}
                      href={item.href}
                      className={`sidebar-link ${item.active ? "active" : ""}`}
                      style={item.active ? { borderColor: 'transparent', background: `${item.accent ?? resolvedAccent}20`, color: item.accent ?? resolvedAccent, borderRadius: '1.5rem', boxShadow: 'none' } : { borderRadius: '1.5rem', borderColor: 'transparent', boxShadow: 'none' }}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--card)]">
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </>
          ) : null}

          <div className="mt-auto px-4 pb-5 lg:pb-6">
            <div className="glass-card p-4" style={{ borderRadius: '1.5rem', background: 'transparent', border: '0', boxShadow: 'none' }}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{t.common.switchWorkspace}</div>
                  <div className="mt-1 break-words text-sm font-bold capitalize">{workspaceLabel}</div>
                  <div className="mt-1 text-xs text-[var(--text-3)]">{t.common.plan}: {planLabel ?? "Free"}</div>
                </div>
                <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{preferences.template}</span>
              </div>
              {accountMode ? <div className="mb-3"><ContextSwitcherInline currentMode={accountMode} availableModes={availableModes} /></div> : null}
              <div className="mt-1 rounded-[20px] bg-[var(--surface-2)] px-3 py-2 text-[11px] leading-6 text-[var(--text-3)]">
                <span className="font-semibold text-[var(--text-2)]">Ctrl+K</span> search
                {" · "}
                <span className="font-semibold text-[var(--text-2)]">G</span> jump
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--text-3)]">
                <Link className="sidebar-mini-link" href="/billing"><CreditCard size={14} /> {t.nav.billing}</Link>
                <Link className="sidebar-mini-link" href="/settings"><SettingsIcon size={14} /> {t.nav.settings}</Link>
              </div>
              <div className="mt-3"><LogoutButton /></div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1" style={{ paddingBottom: preferences.showBottomNav ? '5.5rem' : undefined }}>
          <header className="premium-topbar sticky top-0 z-40 px-5 py-4 backdrop-blur-xl lg:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                  <Link href="/" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[var(--surface-2)] text-[#111318] transition hover:bg-[var(--card)]">
                    <LogoIcon size={22} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{version ?? brand}</span>
                      {activeNav ? (
                        <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-3)]">
                          {activeNav.label}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 break-words text-2xl font-black leading-[0.98] lg:text-[32px]">{title}</div>
                    <div className="mt-2 max-w-3xl text-sm text-[var(--text-2)] line-clamp-2">{topSummary}</div>
                  </div>
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-3 xl:w-auto xl:min-w-[420px] xl:items-end">
                <div className="flex w-full flex-wrap items-center gap-2 xl:justify-end">
                  {accountMode ? <ContextSwitcherInline currentMode={accountMode} availableModes={availableModes} /> : null}
                  <HeaderActions />
                </div>
              </div>
            </div>
          </header>

          <main className="min-w-0 py-6 lg:py-8" style={{ paddingLeft: "var(--page-shell-padding,18px)", paddingRight: "var(--page-shell-padding,18px)" }}><div className="template-page-stack w-full">{children}</div></main>
        </div>
      </div>

      <FloatingActions showQuickActions={preferences.showQuickActions} />
    </div>
  )
}

export function buildPrimaryNav(
  active: "personal" | "business" | "merchant" | "reports" | "billing" | "settings" | "wallets",
  lang: SiteLang = "en"
) {
  const n = getAppMessages(lang).nav
  if (active === "business") {
    return [
      { href: "/business", label: n.business, icon: Building2, accent: "#38bdf8", active: true },
      { href: "/reports", label: n.reports, icon: LineChart, accent: "#14b8a6", active: false },
      { href: "/billing", label: n.billing, icon: CreditCard, accent: "#22c55e", active: false },
      { href: "/settings", label: n.settings, icon: SettingsIcon, accent: "#f59e0b", active: false },
    ]
  }

  if (active === "merchant") {
    return [
      { href: "/merchant", label: n.merchant, icon: Store, accent: "#fb7185", active: true },
      { href: "/reports", label: n.reports, icon: LineChart, accent: "#14b8a6", active: false },
      { href: "/billing", label: n.billing, icon: CreditCard, accent: "#22c55e", active: false },
      { href: "/settings", label: n.settings, icon: SettingsIcon, accent: "#f59e0b", active: false },
    ]
  }

  if (active === "billing") {
    return [
      { href: "/dashboard", label: n.personal, icon: Home, accent: "#8b5cf6", active: false },
      { href: "/wallets", label: n.wallets, icon: Wallet, accent: "#6366f1", active: false },
      { href: "/reports", label: n.reports, icon: LineChart, accent: "#14b8a6", active: false },
      { href: "/billing", label: n.billing, icon: CreditCard, accent: "#22c55e", active: true },
      { href: "/settings", label: n.settings, icon: SettingsIcon, accent: "#f59e0b", active: false },
    ]
  }

  if (active === "settings") {
    return [
      { href: "/dashboard", label: n.personal, icon: Home, accent: "#8b5cf6", active: false },
      { href: "/wallets", label: n.wallets, icon: Wallet, accent: "#6366f1", active: false },
      { href: "/reports", label: n.reports, icon: LineChart, accent: "#14b8a6", active: false },
      { href: "/billing", label: n.billing, icon: CreditCard, accent: "#22c55e", active: false },
      { href: "/settings", label: n.settings, icon: SettingsIcon, accent: "#f59e0b", active: true },
    ]
  }

  if (active === "reports") {
    return [
      { href: "/dashboard", label: n.personal, icon: Home, accent: "#8b5cf6", active: false },
      { href: "/wallets", label: n.wallets, icon: Wallet, accent: "#6366f1", active: false },
      { href: "/reports", label: n.reports, icon: LineChart, accent: "#14b8a6", active: true },
      { href: "/billing", label: n.billing, icon: CreditCard, accent: "#22c55e", active: false },
      { href: "/settings", label: n.settings, icon: SettingsIcon, accent: "#f59e0b", active: false },
    ]
  }

  if (active === "wallets") {
    return [
      { href: "/dashboard", label: n.personal, icon: Home, accent: "#8b5cf6", active: false },
      { href: "/wallets", label: n.wallets, icon: Wallet, accent: "#6366f1", active: true },
      { href: "/reports", label: n.reports, icon: LineChart, accent: "#14b8a6", active: false },
      { href: "/billing", label: n.billing, icon: CreditCard, accent: "#22c55e", active: false },
      { href: "/settings", label: n.settings, icon: SettingsIcon, accent: "#f59e0b", active: false },
    ]
  }

  return [
    { href: "/dashboard", label: n.personal, icon: Home, accent: "#8b5cf6", active: true },
    { href: "/wallets", label: n.wallets, icon: Wallet, accent: "#6366f1", active: false },
    { href: "/reports", label: n.reports, icon: LineChart, accent: "#14b8a6", active: false },
    { href: "/billing", label: n.billing, icon: CreditCard, accent: "#22c55e", active: false },
    { href: "/settings", label: n.settings, icon: SettingsIcon, accent: "#f59e0b", active: false },
  ]
}
