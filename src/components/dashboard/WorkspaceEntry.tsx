import Link from "next/link"
import { Building2, CreditCard, Store, ArrowRight } from "lucide-react"

type Mode = "personal" | "business" | "merchant"

type WorkspaceEntryProps = {
  currentMode: Mode
  availableModes: Mode[]
}

const ITEMS = [
  { mode: "personal" as const, label: "Personal", description: "การเงินส่วนตัว กระเป๋าเงิน และงบประมาณ", href: "/dashboard", icon: CreditCard, accent: "#8b5cf6" },
  { mode: "business" as const, label: "Business", description: "บัญชีธุรกิจ payroll และ invoice", href: "/business", icon: Building2, accent: "#0ea5e9" },
  { mode: "merchant" as const, label: "Merchant", description: "ขายสินค้า inventory และ reconciliation", href: "/merchant", icon: Store, accent: "#e11d48" },
]

export default function WorkspaceEntry({ currentMode, availableModes }: WorkspaceEntryProps) {
  return (
    <section className="glass-card rounded-[30px] p-6">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Workspace entry</div>
        <h2 className="mt-1 text-2xl font-black">เข้าแต่ละโหมดได้ชัดขึ้น</h2>
        <p className="mt-1 text-sm text-[var(--text-2)]">เลือกพื้นที่ทำงานที่ตรงกับงานของคุณ และเห็นเลยว่าโหมดไหนพร้อมใช้งาน</p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {ITEMS.map((item) => {
          const Icon = item.icon
          const enabled = availableModes.includes(item.mode)
          const active = currentMode === item.mode
          return (
            <Link
              key={item.mode}
              href={enabled ? item.href : `/register?mode=${item.mode}`}
              className="rounded-[24px] border p-4 transition-transform hover:-translate-y-0.5"
              style={{
                background: active ? `${item.accent}10` : "var(--card)",
                borderColor: active ? `${item.accent}55` : "var(--border)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${item.accent}18`, color: item.accent }}>
                  <Icon size={18} />
                </div>
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: enabled ? `${item.accent}15` : "var(--surface-2)", color: enabled ? item.accent : "var(--text-3)" }}>
                  {active ? "ใช้อยู่" : enabled ? "พร้อมใช้" : "สมัครเพิ่ม"}
                </span>
              </div>
              <div className="mt-4 text-lg font-black">{item.label}</div>
              <div className="mt-1 text-sm leading-6 text-[var(--text-2)]">{item.description}</div>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: item.accent }}>
                {enabled ? "เข้า workspace" : "สร้าง workspace"} <ArrowRight size={14} />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
