import AppFrame from "@/components/layout/AppFrame"
import { WorkbenchHero, KpiStrip } from "@/components/workbench/WorkbenchPageShell"
import { requireModePage } from "@/lib/authz"
import { getCurrentSession, normalizeAccountMode } from "@/lib/session"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { prisma } from "@/lib/prisma"
import { getOwnedBusinessOrg } from "@/lib/business-org"
import BusinessInventoryWorkbench from "@/shared/components/workbench/BusinessInventoryWorkbench"
import BusinessWorkspaceSetupNotice from "@/components/business/BusinessWorkspaceSetupNotice"

const db = prisma as any

export const metadata = { title: "Business Inventory — PayMap" }

export default async function BusinessInventoryPage() {
  const user = await requireModePage("business")
  const session = await getCurrentSession()
  const currentPlan = getCurrentPlan(user, "business")
  const org = await getOwnedBusinessOrg(user.id)

  const [warehouseCount, productCount, balanceCount] = org ? await Promise.all([
    db.warehouse.count({ where: { organizationId: org.id, deletedAt: null } }),
    db.product.count({ where: { organizationId: org.id, deletedAt: null } }),
    db.inventoryBalance.count({ where: { warehouse: { organizationId: org.id, deletedAt: null }, product: { deletedAt: null } } }),
  ]) : [0, 0, 0]

  const nav = [
    { href: "/business", label: "Overview", accent: "#38bdf8", active: false },
    { href: "/business/customers", label: "Customers", accent: "#fb7185", active: false },
    { href: "/business/inventory", label: "Inventory", accent: "#a855f7", active: true },
    { href: "/business/invoices", label: "Invoices", accent: "#f59e0b", active: false },
    { href: "/business/accounting", label: "Accounting", accent: "#14b8a6", active: false },
  ]

  return (
    <AppFrame
      brand="payMap Business"
      icon="📦"
      version={`${DASHBOARD_VERSION_LABEL} · Inventory`}
      title="Product and warehouse master"
      subtitle="เพิ่ม ERP core ฝั่งสินค้า คลัง และ stock movement ให้ business workspace"
      accent="#a855f7"
      planLabel={currentPlan}
      accountMode={normalizeAccountMode(session?.accountMode ?? user.accountMode)}
      nav={nav}
    >
      <div className="space-y-6">
        <WorkbenchHero
          eyebrow="Business inventory"
          title="เริ่มแกน ERP สินค้าและคลังแบบที่เอาไปต่อยอด order flow ได้"
          subtitle="ตั้งค่า warehouse master, product master และบันทึก stock movement ในโครงสร้างเดียวกับ organization เพื่อเตรียมต่อยอด sales, purchase และ costing"
          accent="#a855f7"
        />
        <KpiStrip items={[
          { label: "Workspace", value: org?.name ?? "Not setup", hint: "องค์กรธุรกิจที่กำลังใช้งาน" },
          { label: "Warehouses", value: String(warehouseCount), hint: "คลังที่ใช้งานอยู่" },
          { label: "Products", value: String(productCount), hint: "ทะเบียนสินค้ากลาง" },
          { label: "Balances", value: String(balanceCount), hint: "stock by warehouse" },
        ]} />
        {org ? <BusinessInventoryWorkbench /> : <BusinessWorkspaceSetupNotice title="ยังไม่มี inventory workspace สำหรับธุรกิจนี้" body="ต้องมี organization ก่อน จึงจะเริ่มตั้ง warehouse master, product master และ stock movement ได้จริง" />}
      </div>
    </AppFrame>
  )
}
