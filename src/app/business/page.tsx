import AppFrame from "@/components/layout/AppFrame"
import { BarChart3, Briefcase, CreditCard, Package, Receipt, Settings, Users } from "lucide-react"
import { requireModePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { BusinessCuratorSurface } from "@/components/curator/MainSurfaces"

export default async function BusinessPage() {
  const user = await requireModePage("business")
  const org = await prisma.organization.findFirst({ where: { ownerId: user.id } })
  const invoices = org ? await prisma.invoice.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: "desc" }, take: 12 }) : []
  const formatMoney = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: user.currency ?? "THB", maximumFractionDigits: 0 }).format(value)
  const displayInvoices = invoices.length ? invoices : [
    { id: "demo-1", number: "INV-1048", customerName: "Siam Pantry Co.", status: "paid", totalAmount: 42800, createdAt: new Date(), dueDate: new Date() },
    { id: "demo-2", number: "INV-1049", customerName: "North Star Studio", status: "pending", totalAmount: 18500, createdAt: new Date(), dueDate: new Date() },
    { id: "demo-3", number: "INV-1050", customerName: "Corner Cafe", status: "overdue", totalAmount: 9200, createdAt: new Date(), dueDate: new Date() },
  ] as any[]
  const revenue = displayInvoices.reduce((sum, item) => sum + Number(item.totalAmount ?? 0), 0)
  const paid = displayInvoices.filter((item) => item.status === "paid").reduce((sum, item) => sum + Number(item.totalAmount ?? 0), 0)
  const overdue = displayInvoices.filter((item) => item.status === "overdue")
  const rows = displayInvoices.map((item) => ({
    id: item.id,
    invoice: item.number ?? `INV-${String(item.id).slice(-4)}`,
    customer: item.customerName ?? "Customer",
    status: item.status,
    owner: org?.name ?? "Workspace",
    amount: formatMoney(Number(item.totalAmount ?? 0)),
    amountRaw: Number(item.totalAmount ?? 0),
  }))

  return (
    <AppFrame
      brand="PayMap"
      icon="◈"
      version="PayMap 15 · Business"
      title="Business money control"
      subtitle="See cashflow, invoices, receivables, and the next collection action without rebuilding another spreadsheet"
      accent="#0ea5e9"
      planLabel={String(getCurrentPlan(user, "business"))}
      accountMode="business"
      nav={[
        { href: "/business", label: "Overview", icon: Briefcase, accent: "#0ea5e9", active: true },
        { href: "/business/customers", label: "Customers", icon: Users, accent: "#fb7185", active: false },
        { href: "/business/inventory", label: "Inventory", icon: Package, accent: "#a855f7", active: false },
        { href: "/reports", label: "Reports", icon: BarChart3, accent: "#14b8a6", active: false },
        { href: "/billing", label: "Billing", icon: CreditCard, accent: "#22c55e", active: false },
        { href: "/business/invoices", label: "Invoices", icon: Receipt, accent: "#0ea5e9", active: false },
        { href: "/settings", label: "Settings", icon: Settings, accent: "#f59e0b", active: false },
      ]}
    >
      <BusinessCuratorSurface
        revenue={formatMoney(revenue)}
        paid={formatMoney(paid)}
        overdueCount={overdue.length}
        rows={rows}
        isDemo={!invoices.length}
      />
    </AppFrame>
  )
}
