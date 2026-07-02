import PlannerPersistenceClient from "@/components/planner/PlannerPersistenceClient"
import { AlertTriangle, Boxes, Receipt, ShoppingBag } from "lucide-react"
import { redirect } from "next/navigation"
import { requireModePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/session"
import AppFrame from "@/components/layout/AppFrame"
import { APP_VERSION, DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"
import { PlannerEmpty, PlannerListCard, PlannerMetric } from "@/components/planner/PlannerSurface"

function formatCurrency(value: number, currency = "THB") {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency, maximumFractionDigits: 0 }).format(value)
}
function formatDate(value: Date | null | undefined) {
  return value ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(value) : "—"
}

export default async function MerchantRemindersPage() {
  const user = await requireModePage("merchant")
  const session = await getCurrentSession()
  if ((session?.accountMode ?? session?.workspaceMode ?? "personal") !== "merchant") redirect("/workspace/select?requested=merchant")

  const store = await prisma.store.findFirst({ where: { userId: user.id }, select: { id: true, name: true, currency: true, vatRegistered: true } })
  if (!store) redirect("/merchant")

  const now = new Date()
  const [lowStock, purchaseOrders, recentSales, currentVat] = await Promise.all([
    prisma.merchantProduct.findMany({
      where: { storeId: store.id, status: "active", stockQty: { lte: 5 } },
      orderBy: { stockQty: "asc" },
      take: 10,
      select: { id: true, name: true, stockQty: true, minStockQty: true, salePrice: true, sku: true },
    }),
    prisma.purchaseOrder.findMany({
      where: { storeId: store.id, status: { in: ["sent", "partial", "received"] } },
      orderBy: { expectedAt: "asc" },
      take: 6,
      select: { id: true, poNo: true, status: true, totalAmount: true, expectedAt: true, note: true },
    }),
    prisma.salesOrder.findMany({
      where: { storeId: store.id },
      orderBy: { soldAt: "desc" },
      take: 6,
      select: { id: true, orderNo: true, totalAmount: true, soldAt: true, paymentMethod: true, note: true, customerName: true },
    }),
    prisma.vatReport.findFirst({
      where: { storeId: store.id, month: now.getMonth() + 1, year: now.getFullYear() },
      select: { vatPayable: true, salesVat: true, purchaseVat: true, filedAt: true },
    }),
  ])

  const restockCount = lowStock.filter((item) => item.stockQty <= item.minStockQty).length
  const salesToday = recentSales.filter((item) => new Date(item.soldAt).toDateString() === now.toDateString())
  const salesTodayValue = salesToday.reduce((sum, item) => sum + Number(item.totalAmount), 0)

  const nav = [
    { href: "/merchant", label: "Overview", icon: ShoppingBag, accent: "#fb7185", active: false },
    { href: "/merchant/reminders", label: "Reminders", icon: AlertTriangle, accent: "#0f766e", active: true },
    { href: "/merchant/inventory", label: "Inventory", icon: Boxes, accent: "#8b5cf6", active: false },
    { href: "/merchant/accounting", label: "Accounting", icon: Receipt, accent: "#14b8a6", active: false },
  ]

  return (
    <AppFrame
      brand="payMap Merchant"
      icon="◈"
      version={`${DASHBOARD_VERSION_LABEL} · Merchant Reminders`}
      title="Merchant restock & sales reminders"
      subtitle={`สรุป low stock, incoming purchase orders และยอดขายล่าสุดไว้สำหรับหน้าร้าน · v${APP_VERSION}`}
      accent="#0f766e"
      planLabel={String(user.plan ?? "free")}
      accountMode="merchant"
      nav={nav}
    >
      <div className="space-y-6">
        <ProductHero
          eyebrow="Planner pack"
          title="Merchant restock & sales reminders"
          description="ใช้เพื่อตามของใกล้หมด, ของที่กำลังเข้า, และสัญญาณยอดขายของวัน โดยไม่ต้องสลับไปหลายหน้าระหว่างเปิดร้าน"
          badge="พร้อมใช้งาน"
          accent="#0f766e"
          stats={[
            { label: "Low stock items", value: String(restockCount), hint: "need restock attention" },
            { label: "Sales today", value: formatCurrency(salesTodayValue, store.currency), hint: `${salesToday.length} recent orders` },
            { label: "VAT this month", value: currentVat ? formatCurrency(Number(currentVat.vatPayable), store.currency) : "—", hint: currentVat?.filedAt ? "filed" : store.vatRegistered ? "not filed yet" : "VAT disabled" },
          ]}
        />

        <ProductQuickLinks links={[
          { href: "/merchant/inventory", title: "Inventory control", description: "เข้าไปปรับสต็อกและจัดการสินค้าได้ทันที" },
          { href: "/merchant/sales", title: "Sales hub", description: "ดูออเดอร์และทำงานต่อจากมุมมองขายหน้าร้าน" },
          { href: "/merchant/accounting", title: "Accounting & VAT", description: "เช็ก VAT flow และตัวเลขของร้านจาก accounting surface" },
        ]} />

        <ProductSection title="Store operating snapshot" description={`จุดที่ควรดูทุกวันสำหรับ ${store.name}`}>
          <div className="grid gap-4 md:grid-cols-3">
            <PlannerMetric label="Items to reorder" value={String(restockCount)} hint="stock at or below minimum" />
            <PlannerMetric label="Incoming purchase orders" value={String(purchaseOrders.length)} hint="expected deliveries" />
            <PlannerMetric label="Recent sales watch" value={String(recentSales.length)} hint="latest orders captured" />
          </div>
        </ProductSection>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <PlannerListCard title="Restock reminders" description="สินค้าที่ควรจัดการก่อนกระทบการขายหน้าร้าน" actionHref="/merchant/inventory" actionLabel="Open inventory">
            <div className="space-y-3">
              {lowStock.length ? lowStock.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-[var(--text-1)]">{item.name}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-3)]">{item.sku || "No SKU"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[var(--text-1)]">{item.stockQty} left</div>
                      <div className="text-xs text-[var(--text-3)]">min {item.minStockQty}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-[var(--text-2)]">Approx. selling price {formatCurrency(Number(item.salePrice), store.currency)}</div>
                </div>
              )) : <PlannerEmpty title="สต็อกยังอยู่ในระดับปลอดภัย" description="เมื่อสินค้าใกล้หมด planner จะดึงขึ้นมาให้ที่นี่ทันที" />}
            </div>
          </PlannerListCard>

          <PlannerListCard title="Sales & inbound notes" description="ดูของเข้าและยอดขายล่าสุดในมุมที่อ่านง่ายสำหรับเจ้าของร้าน">
            <div className="space-y-3">
              {purchaseOrders.length ? purchaseOrders.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-[var(--text-1)]">PO {item.poNo}</div>
                    <div className="text-xs text-[var(--text-3)]">{formatDate(item.expectedAt)}</div>
                  </div>
                  <div className="mt-1 text-sm text-[var(--text-2)]">{item.status} · {formatCurrency(Number(item.totalAmount), store.currency)}</div>
                  {item.note ? <div className="mt-2 text-sm text-[var(--text-2)]">{item.note}</div> : null}
                </div>
              )) : <PlannerEmpty title="ยังไม่มี purchase order ที่กำลังรอของเข้า" description="ถ้ามี PO ที่ approved/ordered planner จะสรุปกำหนดรับสินค้าให้ตรงนี้" />}

              {recentSales.length ? recentSales.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-[var(--text-1)]">{item.orderNo}</div>
                    <div className="text-xs text-[var(--text-3)]">{formatDate(item.soldAt)}</div>
                  </div>
                  <div className="mt-1 text-sm text-[var(--text-2)]">{item.customerName || "Walk-in"} · {item.paymentMethod || "payment not set"}</div>
                  <div className="mt-1 text-sm font-medium text-[var(--text-1)]">{formatCurrency(Number(item.totalAmount), store.currency)}</div>
                  {item.note ? <div className="mt-2 text-sm text-[var(--text-2)]">{item.note}</div> : null}
                </div>
              )) : <PlannerEmpty title="ยังไม่มียอดขายล่าสุดให้สรุป" description="เมื่อร้านมี orders planner จะสรุป recent sales ให้ดูจากตรงนี้" />}
            </div>
          </PlannerListCard>
        </div>


        <ProductSection title="My planner items" description="เพิ่มงาน, โน้ต และ reminder ของ PayMap เองได้จากหน้านี้ และบันทึกลงฐานข้อมูลจริง">
          <PlannerPersistenceClient workspace="merchant" />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
