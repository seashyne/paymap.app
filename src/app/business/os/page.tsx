import AppFrame from "@/components/layout/AppFrame"
import FinancialOSWorkspace from "@/components/v13/FinancialOSWorkspace"
import { requireModePage } from "@/lib/authz"
import { getCurrentSession, normalizeAccountMode } from "@/lib/session"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { getBusinessInsights, getFinancialForecast, getFinancialOsSummary } from "@/lib/v13/sme-os"
import { BarChart3, Briefcase, CreditCard, Landmark, Settings, ShieldCheck } from "lucide-react"

export const metadata = { title: "Financial OS — PayMap v13" }

export default async function BusinessOsPage() {
  const user = await requireModePage("business")
  const session = await getCurrentSession()
  const [summary, forecast, insightPayload] = await Promise.all([
    getFinancialOsSummary(user.id),
    getFinancialForecast(user.id),
    getBusinessInsights(user.id),
  ])
  const plan = getCurrentPlan(user, "business")

  const nav = [
    { href: "/business", label: "Overview", icon: Briefcase, accent: "#38bdf8", active: false },
    { href: "/business/os", label: "Financial OS", icon: BarChart3, accent: "#38bdf8", active: true },
    { href: "/business/payroll", label: "Payroll", icon: CreditCard, accent: "#22c55e", active: false },
    { href: "/business/accounting", label: "Accounting", icon: Landmark, accent: "#14b8a6", active: false },
    { href: "/merchant/pos", label: "POS", icon: ShieldCheck, accent: "#fb7185", active: false },
    { href: "/settings", label: "Settings", icon: Settings, accent: "#f59e0b", active: false },
  ]

  return (
    <AppFrame
      brand="payMap v13"
      icon="🧠"
      version="v13 Financial OS"
      title="Financial OS + Business OS"
      subtitle="Owner cockpit for SME"
      accent="#38bdf8"
      planLabel={plan}
      accountMode={normalizeAccountMode(session?.accountMode ?? "business")}
      nav={nav}
    >
      <FinancialOSWorkspace summary={summary} forecast={forecast} insights={insightPayload.insights} />
    </AppFrame>
  )
}
