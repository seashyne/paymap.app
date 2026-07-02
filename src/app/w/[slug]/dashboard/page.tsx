
import { notFound } from "next/navigation"
import { requireUser } from "@/lib/authz"
import { mergeUiPreferences } from "@/lib/ui-preferences"
import { resolveWorkspaceSlug } from "@/lib/v23/workspace-bridge"
import { buildDashboardProps } from "@/lib/dashboard-data"
import DashboardClient from "@/components/dashboard/DashboardClient"
import FamilyPanel from "@/components/family/FamilyPanel"
import BusinessDashboard from "@/components/business/BusinessDashboard"
import OnboardingWizard from "@/components/business/OnboardingWizard"
import MerchantDashboard from "@/components/merchant/MerchantDashboard"
import AppFrame from "@/components/layout/AppFrame"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/session"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { getBusinessDashboardSnapshot, getMerchantDashboardSnapshot } from "@/lib/server-cache"
import { Home, Heart, CreditCard, Settings, Building2, Users, Store as StoreIcon } from "lucide-react"

export default async function WorkspaceDashboardPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { tab?: string }
}) {
  const user = await requireUser()
  const uiPreferences = mergeUiPreferences((user as any).uiPreferences)
  const session = await getCurrentSession()
  const workspace = await resolveWorkspaceSlug(user, params.slug)
  if (!workspace) notFound()

  if (workspace.type === "personal") {
    const props = await buildDashboardProps(user)
    const tab = searchParams.tab ?? "overview"
    const nav = [
      { href: `/w/${workspace.slug}/dashboard?tab=overview`, label: "Overview", icon: Home, accent: "#8b5cf6", active: tab === "overview" },
      { href: `/w/${workspace.slug}/dashboard?tab=family`, label: "Family", icon: Heart, accent: "#f43f5e", active: tab === "family" },
      { href: "/workspace/select", label: "Workspaces", icon: Building2, accent: "#38bdf8", active: false },
      { href: "/billing", label: "Billing", icon: CreditCard, accent: "#22c55e", active: false },
      { href: "/settings", label: "Settings", icon: Settings, accent: "#f59e0b", active: false },
    ]
    return (
      <AppFrame brand="payMap" icon="₿" version={`${DASHBOARD_VERSION_LABEL} ${session?.isDemo ? "· Demo" : "· Workspace"}`} title={workspace.name} subtitle="Workspace-first route bridge for Personal" accent="#8b5cf6" planLabel={workspace.plan} nav={nav}>
        {tab === "family" ? <FamilyPanel /> : <DashboardClient {...props} showCharts={uiPreferences.showCharts} />}
      </AppFrame>
    )
  }

  if (workspace.type === "merchant") {
    const { resolveStoreFromSlug } = await import("@/lib/v23/workspace-bridge")
    const storeId = workspace.meta?.storeId as string | undefined
      ?? await resolveStoreFromSlug(user.id, params.slug)
    const store = storeId
      ? await prisma.store.findFirst({ where: { id: storeId, userId: user.id } })
      : await prisma.store.findFirst({ where: { userId: user.id } })
    const snapshot = store ? await getMerchantDashboardSnapshot(store.id) : null

    const nav = [
      { href: `/w/${workspace.slug}/dashboard`, label: "Overview", icon: StoreIcon, accent: "#fb7185", active: true },
      { href: "/workspace/select", label: "Workspaces", icon: Building2, accent: "#38bdf8", active: false },
      { href: "/pricing?product=merchant", label: "Upgrade", icon: CreditCard, accent: "#22c55e", active: false },
      { href: "/settings", label: "Settings", icon: Settings, accent: "#f59e0b", active: false },
    ]

    return (
      <AppFrame brand="payMap Merchant" icon="🏪" version={`${DASHBOARD_VERSION_LABEL} ${session?.isDemo ? "· Demo" : "· Workspace"}`} title={workspace.name} subtitle="Workspace-first route bridge for Merchant" accent="#fb7185" planLabel={workspace.plan} nav={nav}>
        <MerchantDashboard showCharts={uiPreferences.showCharts}
          user={user}
          store={store}
          todaySales={snapshot?.todaySales ?? { total: 0, orders: 0 }}
          monthSales={snapshot?.monthSales ?? { total: 0, vat: 0, orders: 0 }}
          lowStockCount={snapshot?.lowStockCount ?? 0}
          inventoryItems={snapshot?.inventoryItems ?? []}
          topProducts={snapshot?.topProducts ?? []}
        />
      </AppFrame>
    )
  }

  const orgId = workspace.source === "organization" && workspace.meta?.organizationId
    ? String(workspace.meta.organizationId)
    : (await prisma.organization.findFirst({ where: { ownerId: user.id }, select: { id: true } }))?.id

  const businessSnapshot = orgId ? await getBusinessDashboardSnapshot(orgId) : null

  const nav = [
    { href: `/w/${workspace.slug}/dashboard`, label: "Overview", icon: Building2, accent: "#38bdf8", active: true },
    { href: "/workspace/select", label: "Workspaces", icon: Users, accent: "#8b5cf6", active: false },
    { href: "/pricing?focus=business", label: "Upgrade", icon: CreditCard, accent: "#22c55e", active: false },
    { href: "/settings", label: "Settings", icon: Settings, accent: "#f59e0b", active: false },
  ]

  return (
    <AppFrame brand="payMap Business" icon="🏢" version={`${DASHBOARD_VERSION_LABEL} ${session?.isDemo ? "· Demo" : "· Workspace"}`} title={workspace.name} subtitle="Workspace-first route bridge for Business" accent="#38bdf8" planLabel={workspace.plan} nav={nav}>
      {!businessSnapshot ? (
        <OnboardingWizard />
      ) : (
        <BusinessDashboard showCharts={uiPreferences.showCharts}
          org={businessSnapshot.org}
          payrollRun={businessSnapshot.payrollRun}
          pendingLeaves={businessSnapshot.pendingLeaves}
          plan={workspace.plan}
        />
      )}
    </AppFrame>
  )
}
