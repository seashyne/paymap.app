import Link from "next/link"
import { ArrowRight, Receipt, ShoppingBag, Store, Warehouse } from "lucide-react"
import PublicShell from "@/components/public/PublicShell"
import { detectSiteLang } from "@/lib/i18n/site"

export const metadata = { title: "PayMap Merchant" }

export default function ForMerchantsPage() {
  const lang = detectSiteLang()
  const isThai = lang === "th"
  const isLao = lang === "lo"

  const features = [
    {
      icon: ShoppingBag,
      title: isThai ? "POS และยอดขาย" : "POS and sales",
      body: isThai ? "รองรับ flow การขายหน้าร้านและการติดตามยอดขายในแต่ละวัน" : "Run point-of-sale workflows and stay on top of daily sales activity.",
    },
    {
      icon: Warehouse,
      title: isThai ? "Inventory และ stock" : "Inventory and stock",
      body: isThai ? "ดูจำนวนคงเหลือ, movement และการจัดการสินค้าตามคลังหรือสาขา" : "Track balances, movements, and product control by warehouse or branch.",
    },
    {
      icon: Receipt,
      title: isThai ? "VAT และรายงานร้าน" : "VAT and store reporting",
      body: isThai ? "เชื่อม VAT, รายงานขาย และการเงินร้านให้พร้อมตรวจโดยไม่ต้องรวม Excel หลายไฟล์" : "Keep VAT, sales reporting, and store finance ready without stitching together spreadsheets.",
    },
  ]

  return (
    <PublicShell
      eyebrow="PayMap Merchant"
      title={isThai ? "ERP Lite สำหรับ POS และงานหน้าร้าน" : isLao ? "ERP Lite for POS and store operations." : "ERP Lite for POS and store operations."}
      description={isThai
        ? "คุมยอดขายหน้าร้าน, stock, VAT และ store ops ในระบบเดียวที่เบากว่า ERP ใหญ่"
        : isLao
          ? "Run counters, stock, VAT, and store operations in a lighter ERP setup."
          : "Run counters, stock, VAT, and store operations in a lighter ERP setup."}
      ctaHref="/register?mode=merchant"
      ctaLabel={isThai ? "เริ่ม PayMap Merchant" : isLao ? "Start Merchant" : "Start Merchant"}
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <section className="public-panel-v72">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold" style={{ borderColor: "rgba(172,49,73,0.2)", color: "#ac3149", background: "rgba(172,49,73,0.10)" }}>
            <Store size={12} /> {isThai ? "สำหรับร้านค้าและหน้าร้าน" : "For stores and retail teams"}
          </div>
          <div className="mt-6 space-y-4">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-5">
                <div className="flex items-center gap-3">
                  <div className="public-mode-icon-v72" style={{ color: "#ac3149", background: "rgba(172,49,73,0.10)", borderColor: "rgba(172,49,73,0.18)" }}>
                    <Icon size={18} />
                  </div>
                  <div className="text-lg font-black">{title}</div>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="public-panel-v72 public-panel-v72-soft">
          <div className="public-section-label">{isThai ? "Store workflow" : "Store workflow"}</div>
          <h2 className="public-panel-title">{isThai ? "เหมาะกับร้านที่ต้องปิดยอดและเช็ก stock ทุกวัน" : "Built for stores that close sales and check stock every day."}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">
            {isThai
              ? "PayMap Merchant คือ setup สำหรับร้านค้าที่ต้องการ POS, inventory, VAT และรายงานขายใน flow เดียว"
              : "PayMap Merchant is the setup for stores that need POS, inventory, VAT, and sales reporting in one flow."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/register?mode=merchant" className="public-btn public-btn-primary inline-flex items-center justify-center gap-2" style={{ background: "#ac3149" }}>
              {isThai ? "สร้าง Merchant workspace" : "Create Merchant workspace"} <ArrowRight size={14} />
            </Link>
            <Link href="/pricing?focus=merchant" className="public-btn public-btn-ghost">
              {isThai ? "ดูราคา Merchant" : "View Merchant pricing"}
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  )
}
