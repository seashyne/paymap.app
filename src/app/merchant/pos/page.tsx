import AppFrame from "@/components/layout/AppFrame"
import PosTerminalV15 from "@/components/merchant/PosTerminalV15"
import { requireModePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentSession, normalizeAccountMode } from "@/lib/session"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { BarChart3, CreditCard, Package2, Settings, ShoppingCart, Store } from "lucide-react"

export const metadata = { title: "Merchant POS — PayMap 15" }

export default async function MerchantPosPage() {
  const user = await requireModePage("merchant")
  const session = await getCurrentSession()
  const plan = getCurrentPlan(user, "merchant")
  const store = await prisma.store.findFirst({ where: { userId: user.id } })
  const products = store
    ? await prisma.merchantProduct.findMany({ where: { storeId: store.id, status: "active" }, orderBy: { name: "asc" }, take: 24 })
    : []

  const nav = [
    { href: "/merchant", label: "Overview", icon: Store, accent: "#fb7185", active: false },
    { href: "/merchant/pos", label: "POS", icon: CreditCard, accent: "#3b82f6", active: true },
    { href: "/merchant/sales", label: "Sales", icon: ShoppingCart, accent: "#fb7185", active: false },
    { href: "/merchant/inventory", label: "Inventory", icon: Package2, accent: "#8b5cf6", active: false },
    { href: "/analytics", label: "Analytics", icon: BarChart3, accent: "#14b8a6", active: false },
    { href: "/settings", label: "Settings", icon: Settings, accent: "#f59e0b", active: false },
  ]

  return (
    <AppFrame brand="PayMap Merchant" icon="◈" version="PayMap 15 · Merchant POS" title="POS" subtitle={store?.name ?? "Setup store first"} accent="#3b82f6" planLabel={String(plan)} accountMode={normalizeAccountMode(session?.accountMode ?? "merchant")} nav={nav}>
      <PosTerminalV15 storeId={store?.id} products={products.map((product) => ({
        id: product.id,
        name: product.name,
        salePrice: Number(product.salePrice ?? 0),
        category: product.category ?? undefined,
        sku: product.sku ?? undefined,
        stockQty: Number(product.stockQty ?? 0),
      }))} />
    </AppFrame>
  )
}
