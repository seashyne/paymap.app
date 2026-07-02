import AppFrame from "@/components/layout/AppFrame"
import { BarChart3, CreditCard, Package, Settings, Store } from "lucide-react"
import { requireModePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { MerchantCuratorSurface } from "@/components/curator/MainSurfaces"

export default async function MerchantPage() {
  const user = await requireModePage("merchant")
  const store = await prisma.store.findFirst({ where: { userId: user.id } })
  const [products, productRows, orders] = store ? await Promise.all([
    prisma.merchantProduct.count({ where: { storeId: store.id } }),
    prisma.merchantProduct.findMany({ where: { storeId: store.id }, take: 4, orderBy: { updatedAt: "desc" } }),
    prisma.salesOrder.count({ where: { storeId: store.id } }),
  ]) : [0, [], 0]
  const sales = store ? await prisma.salesOrder.aggregate({ where: { storeId: store.id }, _sum: { totalAmount: true } }) : { _sum: { totalAmount: 0 } }
  const salesTotal = Number((sales as any)._sum.totalAmount ?? 0)
  const displaySalesTotal = salesTotal || (!store || !productRows.length ? 18750 : 0)
  const displayOrders = orders || (!store || !productRows.length ? 34 : 0)
  const displayLowStock = products ? Math.max(0, Math.floor(products / 4)) : 2
  const formatMoney = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: user.currency ?? "THB", maximumFractionDigits: 0 }).format(value)
  const cards = (productRows.length ? productRows : [
    { id: "demo-1", name: "Aura Sound Max", price: 349, stock: 10 },
    { id: "demo-2", name: "Curator Timepiece", price: 1200, stock: 2 },
    { id: "demo-3", name: "Velocity Runner X", price: 190, stock: 18 },
    { id: "demo-4", name: "Retro Capture Pro", price: 130, stock: 7 },
  ]).map((product, index) => ({
    id: product.id,
    name: product.name,
    price: formatMoney(Number((product as any).price ?? 0)),
    stockLabel: Number((product as any).stock ?? 0) <= 3 ? "Low stock" : "In stock",
    tone: Number((product as any).stock ?? 0) <= 3 ? "alert" as const : "normal" as const,
  }))

  return (
    <AppFrame
      brand="PayMap"
      icon="◈"
      version="PayMap 15 · Merchant"
      title="Store money and stock control"
      subtitle="See today's sales, low-stock risk, and the next counter action before the shop gets busy"
      accent="#fb7185"
      planLabel={String(getCurrentPlan(user, "merchant"))}
      accountMode="merchant"
      nav={[
        { href: "/merchant", label: "Overview", icon: Store, accent: "#fb7185", active: true },
        { href: "/merchant/pos", label: "POS", icon: CreditCard, accent: "#3b82f6", active: false },
        { href: "/merchant/inventory", label: "Inventory", icon: Package, accent: "#8b5cf6", active: false },
        { href: "/reports", label: "Reports", icon: BarChart3, accent: "#14b8a6", active: false },
        { href: "/settings", label: "Settings", icon: Settings, accent: "#f59e0b", active: false },
      ]}
    >
      <MerchantCuratorSurface
        sales={formatMoney(displaySalesTotal)}
        orders={String(displayOrders)}
        lowStock={String(displayLowStock)}
        products={cards}
        isDemo={!store || !productRows.length}
      />
    </AppFrame>
  )
}
