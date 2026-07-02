import Link from "next/link"
import { ArrowRight, BarChart3, Briefcase, FileText, Users } from "lucide-react"
import PublicShell from "@/components/public/PublicShell"
import { detectSiteLang } from "@/lib/i18n/site"

export const metadata = { title: "PayMap Business" }

export default function ForBusinessPage() {
  const lang = detectSiteLang()
  const isThai = lang === "th"
  const isLao = lang === "lo"

  const features = [
    {
      icon: FileText,
      title: isThai ? "Invoices และลูกค้า" : "Invoices and customers",
      body: isThai ? "ดูแล quotation, invoice, receivables และ customer master ใน flow เดียว" : "Manage quotations, invoices, receivables, and customer master in one flow.",
    },
    {
      icon: BarChart3,
      title: isThai ? "Accounting และ cashflow" : "Accounting and cashflow",
      body: isThai ? "ติดตามรายรับรายจ่าย, reconciliation และรายงานธุรกิจใน workspace แยก" : "Track cashflow, reconciliation, and reporting in a separate business workspace.",
    },
    {
      icon: Users,
      title: isThai ? "Payroll และทีมงาน" : "Payroll and team operations",
      body: isThai ? "รองรับ payroll, approvals และงานภายในทีม โดยไม่ต้องใช้ ERP ใหญ่" : "Handle payroll, approvals, and team operations without moving into a heavy ERP.",
    },
  ]

  return (
    <PublicShell
      eyebrow="PayMap Business"
      title={isThai ? "ERP Lite สำหรับ cashflow และงานการเงินของทีม" : isLao ? "ERP Lite for team finance workflows." : "ERP Lite for team finance workflows."}
      description={isThai
        ? "จัดการ invoices, customers, accounting และ payroll ในระบบที่เบากว่า ERP ใหญ่ แต่เป็นระบบกว่า Excel"
        : isLao
          ? "Manage invoices, customers, accounting, and payroll in a lighter ERP setup."
          : "Manage invoices, customers, accounting, and payroll in a lighter ERP setup."}
      ctaHref="/register?mode=business"
      ctaLabel={isThai ? "เริ่ม PayMap Business" : isLao ? "Start Business" : "Start Business"}
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <section className="public-panel-v72">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold" style={{ borderColor: "rgba(0,107,99,0.2)", color: "#006b63", background: "rgba(0,107,99,0.10)" }}>
            <Briefcase size={12} /> {isThai ? "สำหรับทีมและองค์กร" : "For teams and organizations"}
          </div>
          <div className="mt-6 space-y-4">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-5">
                <div className="flex items-center gap-3">
                  <div className="public-mode-icon-v72" style={{ color: "#006b63", background: "rgba(0,107,99,0.10)", borderColor: "rgba(0,107,99,0.18)" }}>
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
          <div className="public-section-label">{isThai ? "ERP Lite path" : "ERP Lite path"}</div>
          <h2 className="public-panel-title">{isThai ? "เริ่มจาก workflow ธุรกิจที่ต้องใช้จริง" : "Start from the business workflow you actually need."}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">
            {isThai
              ? "PayMap Business คือทางหลักสำหรับ SME ที่ขายด้วย invoice ต้องตามรับเงิน และต้องการรายงานธุรกิจแบบไม่ต้องต่อ Excel เอง"
              : "PayMap Business is the main path for SMEs that sell by invoice, track collections, and need operating reports without rebuilding spreadsheets."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/register?mode=business" className="public-btn public-btn-primary inline-flex items-center justify-center gap-2" style={{ background: "#006b63" }}>
              {isThai ? "สร้าง Business workspace" : "Create Business workspace"} <ArrowRight size={14} />
            </Link>
            <Link href="/pricing?focus=business" className="public-btn public-btn-ghost">
              {isThai ? "ดูราคา Business" : "View Business pricing"}
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  )
}
