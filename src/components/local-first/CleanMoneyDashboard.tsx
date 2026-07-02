import Link from "next/link"
import { ArrowRight, Download, HardDrive, Settings, ShieldCheck, Upload, Wallet } from "lucide-react"
import { ImportBackupButton, OpenQuickAddButton } from "@/components/local-first/DashboardActionButtons"

type MoneyRow = {
  id: string
  kind: "income" | "expense"
  date: string
  note: string
  category: string
  status: string
  amount: string
}

function Metric({ label, value, hint, tone = "neutral" }: { label: string; value: string; hint?: string; tone?: "neutral" | "good" | "bad" }) {
  return (
    <div className={`clean-card clean-metric clean-metric-${tone}`}>
      <div className="clean-metric-label">{label}</div>
      <div className="clean-metric-value">{value}</div>
      {hint ? <div className="clean-metric-hint">{hint}</div> : null}
    </div>
  )
}

export default function CleanMoneyDashboard({
  userName,
  totalBalance,
  walletCount,
  income,
  expense,
  rows,
  transactionCount,
}: {
  userName: string
  totalBalance: string
  walletCount: string
  income: string
  expense: string
  rows: MoneyRow[]
  transactionCount: string
}) {
  const hasRows = rows.length > 0

  return (
    <div className="clean-page">
      <section className="clean-hero">
        <div>
          <div className="clean-eyebrow">ภาพรวมวันนี้</div>
          <h1>สวัสดี {userName}</h1>
          <p>
            ดูยอดคงเหลือ รายรับ รายจ่าย และรายการล่าสุดในที่เดียว ข้อมูลการเงินอยู่ในเครื่องเป็นค่าเริ่มต้น
          </p>
        </div>
        <div className="clean-hero-actions">
          <OpenQuickAddButton />
          <ImportBackupButton />
        </div>
      </section>

      <section className="clean-status-strip">
        <span><HardDrive size={14} /> Local Only</span>
        <span><ShieldCheck size={14} /> Cloud Backup Off</span>
        <span>{transactionCount} รายการ</span>
      </section>

      <section className="clean-metrics-grid">
        <Metric label="ยอดคงเหลือ" value={totalBalance} hint="รายรับลบรายจ่าย" tone="neutral" />
        <Metric label="รายรับ" value={income} hint="รวมทุกรายการ" tone="good" />
        <Metric label="รายจ่าย" value={expense} hint="รวมทุกรายการ" tone="bad" />
        <Metric label="บัญชี" value={walletCount} hint="wallet ที่ติดตาม" tone="neutral" />
      </section>

      <section className="clean-dashboard-grid">
        <div className="clean-card overflow-hidden">
          <div className="clean-section-head">
            <div>
              <h2>รายการล่าสุด</h2>
              <p>รายการเหล่านี้ใช้คำนวณยอดคงเหลือและกระแสเงินสด</p>
            </div>
            <OpenQuickAddButton children="เพิ่มรายรับ/รายจ่าย" />
          </div>
          {hasRows ? (
            <div className="clean-table">
              {rows.slice(0, 8).map((row) => (
                <div key={row.id} className="clean-table-row">
                  <div className="clean-table-date">{row.date}</div>
                  <div className="min-w-0">
                    <div className="clean-table-note">{row.note}</div>
                    <div className="clean-table-meta">
                      <span>{row.category}</span>
                      <span>{row.status}</span>
                    </div>
                  </div>
                  <div className={`clean-table-amount ${row.kind === "income" ? "is-income" : "is-expense"}`}>{row.amount}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="clean-empty-state">
              <div className="clean-empty-icon"><Wallet size={22} /></div>
              <h3>เริ่มจากรายการแรกของคุณ</h3>
              <p>เพิ่มรายรับ รายจ่าย หรือ import ไฟล์ backup เพื่อให้ dashboard เริ่มคำนวณยอดจริง</p>
              <div className="clean-empty-actions">
                <OpenQuickAddButton />
                <ImportBackupButton />
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="clean-card p-5">
            <div className="flex items-center gap-3">
              <div className="clean-icon"><Wallet size={18} /></div>
              <div>
                <div className="text-sm font-black">ข้อมูลและ backup</div>
                <div className="text-xs text-[var(--text-3)]">ควบคุมที่เก็บข้อมูลของคุณ</div>
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              <Link href="/settings?tab=data" className="clean-row-link"><Settings size={15} /> ตั้งค่าที่เก็บข้อมูล <ArrowRight size={14} /></Link>
              <Link href="/settings?tab=data" className="clean-row-link"><Download size={15} /> Export .paymap.json <ArrowRight size={14} /></Link>
              <Link href="/settings?tab=data" className="clean-row-link"><Upload size={15} /> Import backup <ArrowRight size={14} /></Link>
            </div>
          </div>

          <div className="clean-card p-5">
            <div className="clean-eyebrow">คำแนะนำ</div>
            <h2 className="mt-2 text-xl font-black">เริ่มจากข้อมูลที่จำเป็นก่อน</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-2)]">
              เพิ่มบัญชีหลัก 1-2 บัญชี แล้วบันทึกรายรับรายจ่ายชุดแรกก่อนเปิด Cloud Backup
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
