import AppFrame from "@/components/layout/AppFrame"
import ModuleGrid from "@/shared/components/dashboard/ModuleGrid"
import { requireModePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentSession, normalizeAccountMode } from "@/lib/session"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { Boxes, FileStack, PackageSearch, Truck } from "lucide-react"
import MerchantInventoryWorkbench from "@/components/dashboard-v521/MerchantInventoryWorkbench"
import { detectSiteLang } from "@/lib/i18n/site"
import { getWorkspaceMessages } from "@/lib/i18n/workspace"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"

export const metadata = { title: "Merchant Inventory — PayMap" }

export default async function MerchantInventoryPage() {
  const user = await requireModePage("merchant")
  const lang = detectSiteLang()
  const wm = getWorkspaceMessages(lang)
  const session = await getCurrentSession()
  const currentPlan = getCurrentPlan(user, "merchant")
  const store = await prisma.store.findFirst({ where: { userId: user.id } })
  const [products, lowStock, suppliers, productList, supplierList] = store ? await Promise.all([
    prisma.merchantProduct.count({ where: { storeId: store.id } }),
    prisma.merchantProduct.count({ where: { storeId: store.id, stockQty: { lte: 5 } } }),
    prisma.supplier.count({ where: { storeId: store.id } }),
    prisma.merchantProduct.findMany({ where: { storeId: store.id }, orderBy: { name: "asc" }, take: 30 }),
    prisma.supplier.findMany({ where: { storeId: store.id }, orderBy: { name: "asc" }, take: 20 }),
  ]) : [0, 0, 0, [], []]

  const nav = [
    { href: "/merchant", label: "Overview", accent: "#fb7185", active: false },
    { href: "/merchant/sales", label: "Sales", accent: "#fb7185", active: false },
    { href: "/merchant/inventory", label: "Inventory", accent: "#8b5cf6", active: true },
    { href: "/merchant/accounting", label: "Accounting", accent: "#14b8a6", active: false },
    { href: "/settings/legal", label: "Legal Center", accent: "#8b5cf6", active: false },
  ]

  return (
    <AppFrame brand="payMap Merchant" icon="📦" version={`${DASHBOARD_VERSION_LABEL} · Inventory`} title={wm.merchant.inventory.title} subtitle={wm.merchant.inventory.subtitle} accent="#8b5cf6" planLabel={currentPlan} accountMode={normalizeAccountMode(session?.accountMode ?? "merchant")} nav={nav}>
      <div className="space-y-6">
        <ProductHero eyebrow="Merchant inventory" title="Store inventory operating cockpit" description="ฝั่ง inventory ถูกวางให้เป็นหน้าคุมสินค้าของร้านแบบเต็มจอสำหรับ desktop พร้อม stock movement, supplier และ low-stock review ที่อ่านง่ายขึ้นแต่ยังคงข้อมูลจริงของร้านเดิม" badge="Merchant mode" accent="#8b5cf6" stats={[{ label: "Products", value: String(products), hint: "catalog items" }, { label: "Low stock", value: String(lowStock), hint: "needs reorder" }, { label: "Suppliers", value: String(suppliers), hint: "vendor linked" }]} />
        <ProductQuickLinks links={[
          { href: "/merchant", title: "Back to merchant overview", description: "กลับไปดู performance ของร้านและ counter overview" },
          { href: "/merchant/sales", title: "Open sales cockpit", description: "กระโดดไปฝั่งขายเพื่อดูผลของ stock ต่อ order flow" },
          { href: "/reports", title: "Review cross-workspace reports", description: "ดูยอดขายและ inventory impact ร่วมกับรายงานหลัก" },
        ]} />
        <ProductSection title="Inventory workbench" description="หน้า workbench ด้านล่างเชื่อม route จริงของสินค้า, stock movement และ supplier อยู่แล้ว">
          <MerchantInventoryWorkbench
            storeId={store?.id ?? null}
            products={productList.map((product) => ({ ...product, salePrice: Number(product.salePrice) }))}
            suppliers={supplierList}
          />
        </ProductSection>
        <ProductSection title="Inventory modules" description="ทางลัดสำหรับงาน inventory ที่ใช้จริงทุกวัน">
          <ModuleGrid title="Inventory modules" subtitle="ทางลัดสำหรับงาน inventory ที่ใช้จริงทุกวัน" items={[
            { href: "/api/merchant/products", label: "Products", description: "สร้าง/แก้ไขสินค้าและใช้เป็น master data ของร้าน", icon: Boxes, accent: "#8b5cf6", stats: [{ label: "Count", value: String(products) }, { label: "Store", value: store?.name ?? "—" }] },
            { href: "/api/merchant/inventory", label: "Inventory movements", description: "เคลื่อนไหว stock จากขาย รับเข้า และปรับยอด", icon: FileStack, accent: "#38bdf8", stats: [{ label: "Low stock", value: String(lowStock) }, { label: "Flow", value: "In/Out" }] },
            { href: "/api/merchant/suppliers", label: "Suppliers", description: "จัดการ supplier และต้นทาง purchase orders", icon: Truck, accent: "#22c55e", stats: [{ label: "Suppliers", value: String(suppliers) }, { label: "PO", value: "Linked" }] },
            { href: "/merchant/sales", label: "Sales linkage", description: "ย้อนกลับไป flow การขายเพื่อดูผลต่อ inventory และ reorder", icon: PackageSearch, accent: "#f59e0b", stats: [{ label: "Review", value: "Daily" }, { label: "Ops", value: "Ready" }] },
          ]} />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
