import AppFrame from "@/components/layout/AppFrame"
import ModuleGrid from "@/shared/components/dashboard/ModuleGrid"
import { requireModePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentSession, normalizeAccountMode } from "@/lib/session"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { BarChart3, Landmark, Receipt, Store } from "lucide-react"
import MerchantSalesWorkbench from "@/components/dashboard-v521/MerchantSalesWorkbench"
import { detectSiteLang } from "@/lib/i18n/site"
import { getWorkspaceMessages } from "@/lib/i18n/workspace"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"

export const metadata = { title: "Merchant Sales — PayMap" }

export default async function MerchantSalesPage() {
  const user = await requireModePage("merchant")
  const lang = detectSiteLang()
  const wm = getWorkspaceMessages(lang)
  const session = await getCurrentSession()
  const currentPlan = getCurrentPlan(user, "merchant")
  const store = await prisma.store.findFirst({ where: { userId: user.id } })
  const start = new Date(); start.setDate(1); start.setHours(0,0,0,0)
  const [orders, revenueAgg, products, recentOrders] = store ? await Promise.all([
    prisma.salesOrder.count({ where: { storeId: store.id } }),
    prisma.salesOrder.aggregate({ where: { storeId: store.id, soldAt: { gte: start } }, _sum: { totalAmount: true, vatAmount: true } }),
    prisma.merchantProduct.findMany({ where: { storeId: store.id, status: "active" }, orderBy: { name: "asc" }, take: 30 }),
    prisma.salesOrder.findMany({ where: { storeId: store.id }, orderBy: { soldAt: "desc" }, take: 8, select: { id: true, orderNo: true, totalAmount: true, status: true, customerName: true } }),
  ]) : [0, { _sum: { totalAmount: null, vatAmount: null } }, [], []]

  const nav = [
    { href: "/merchant", label: "Overview", accent: "#fb7185", active: false },
    { href: "/merchant/sales", label: "Sales", accent: "#fb7185", active: true },
    { href: "/merchant/inventory", label: "Inventory", accent: "#8b5cf6", active: false },
    { href: "/merchant/accounting", label: "Accounting", accent: "#14b8a6", active: false },
    { href: "/settings/legal", label: "Legal Center", accent: "#8b5cf6", active: false },
  ]

  return (
    <AppFrame brand="payMap Merchant" icon="🧾" version={`${DASHBOARD_VERSION_LABEL} · Sales`} title={wm.merchant.sales.title} subtitle={wm.merchant.sales.subtitle} accent="#fb7185" planLabel={currentPlan} accountMode={normalizeAccountMode(session?.accountMode ?? "merchant")} nav={nav}>
      <div className="space-y-6">
        <ProductHero eyebrow="Merchant sales" title="Store sales operating cockpit" description="หน้า sales ถูกปรับให้เป็น counter-style cockpit สำหรับร้านจริง มีทั้ง order draft, payment lane และ recent order management โดยยังเขียน order ลงฐานข้อมูลจริงเหมือนเดิม" badge="Merchant mode" accent="#fb7185" stats={[{ label: "Store", value: store?.name ?? "Not setup", hint: "active storefront" }, { label: "Orders", value: String(orders), hint: "all-time orders" }, { label: "MTD revenue", value: Number(revenueAgg._sum.totalAmount ?? 0).toLocaleString("th-TH"), hint: "this month" }]} />
        <ProductQuickLinks links={[
          { href: "/merchant", title: "Back to merchant overview", description: "กลับไปดูสรุป performance ของร้านในภาพรวม" },
          { href: "/merchant/inventory", title: "Open inventory cockpit", description: "ดู stock พร้อมขายและกลับไปเติมสินค้าเมื่อหน้าขายเริ่มขาด" },
          { href: "/merchant/accounting", title: "Continue to accounting", description: "ต่อยอดขายเข้าสู่ VAT และ statement review" },
        ]} />
        <ProductSection title="Sales workbench" description="ส่วนนี้คือหน้า counter หลักที่ใช้ route จริงของ order และ stock movement อยู่แล้ว">
          <MerchantSalesWorkbench
            storeId={store?.id ?? null}
            products={products.map((product) => ({ ...product, salePrice: Number(product.salePrice) }))}
            recentOrders={recentOrders.map((order) => ({ ...order, totalAmount: Number(order.totalAmount) }))}
          />
        </ProductSection>
        <ProductSection title="Sales modules" description="ทางลัดงานขายและการต่อยอดสู่ reports / accounting">
          <ModuleGrid title="Sales modules" subtitle="ทางลัดที่ใช้จริงในงานขายและสรุปยอดของร้าน" items={[
            { href: "/api/merchant/sales", label: "Sales API", description: "จุดเข้า route หลักของ POS/sales orders สำหรับขายจริง", icon: Receipt, accent: "#fb7185", stats: [{ label: "Orders", value: String(orders) }, { label: "VAT", value: Number(revenueAgg._sum.vatAmount ?? 0).toLocaleString("th-TH") }] },
            { href: "/api/merchant/products", label: "Product catalog", description: "จัดการสินค้า ราคา SKU และข้อมูลที่ใช้หน้าขาย", icon: Store, accent: "#8b5cf6", stats: [{ label: "Store", value: store?.name ?? "—" }, { label: "Mode", value: "Merchant" }] },
            { href: "/reports", label: "Merchant reports", description: "สรุปยอดขายและ performance สำหรับ owner review", icon: BarChart3, accent: "#22c55e", stats: [{ label: "Analytics", value: "Ready" }, { label: "Review", value: "Daily" }] },
            { href: "/merchant/accounting", label: "Post to accounting", description: "ต่อยอดขายเข้าสู่ accounting / VAT reporting flow", icon: Landmark, accent: "#14b8a6", stats: [{ label: "Statements", value: "Linked" }, { label: "Close", value: "พร้อมใช้งาน" }] },
          ]} />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
