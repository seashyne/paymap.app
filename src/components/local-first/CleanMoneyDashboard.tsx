import Link from "next/link"
import { ArrowRight, Download, HardDrive, Plus, Settings, Upload, Wallet } from "lucide-react"

type MoneyRow = {
  id: string
  date: string
  note: string
  category: string
  status: string
  amount: string
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="clean-card p-5">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-3)]">{label}</div>
      <div className="mt-3 text-3xl font-black tracking-[-0.04em] text-[var(--text)]">{value}</div>
      {hint ? <div className="mt-2 text-sm text-[var(--text-3)]">{hint}</div> : null}
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
  isDemo,
}: {
  userName: string
  totalBalance: string
  walletCount: string
  income: string
  expense: string
  rows: MoneyRow[]
  isDemo?: boolean
}) {
  return (
    <div className="clean-page space-y-6">
      <section className="clean-hero">
        <div>
          <div className="clean-eyebrow">Local-first money dashboard</div>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-5xl">สวัสดี {userName}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-2)]">
            ดูเงินเข้า เงินออก กระแสเงินสด และกำไรจริงจากหน้าเดียว ข้อมูลการเงินอยู่ในเครื่องเป็นค่าเริ่มต้น
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="clean-status"><HardDrive size={14} /> Local Only</span>
          <span className="clean-status">Cloud Backup Off</span>
          {isDemo ? <span className="clean-status">Demo data</span> : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Balance" value={totalBalance} hint="เงินคงเหลือสุทธิ" />
        <Metric label="Income" value={income} hint="รายรับทั้งหมด" />
        <Metric label="Expenses" value={expense} hint="รายจ่ายทั้งหมด" />
        <Metric label="Wallets" value={walletCount} hint="บัญชีที่ติดตาม" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="clean-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black">Recent money movement</h2>
              <p className="mt-1 text-sm text-[var(--text-3)]">รายการล่าสุดที่ใช้คำนวณ cash flow และ real profit</p>
            </div>
            <Link href="/wallets" className="clean-button">
              <Plus size={15} /> Add record
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {rows.slice(0, 8).map((row) => (
              <div key={row.id} className="grid gap-3 p-4 md:grid-cols-[120px_minmax(0,1fr)_140px] md:items-center">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-3)]">{row.date}</div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold">{row.note}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--text-3)]">
                    <span>{row.category}</span>
                    <span>·</span>
                    <span>{row.status}</span>
                  </div>
                </div>
                <div className="text-left text-sm font-black tabular-nums md:text-right">{row.amount}</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="clean-card p-5">
            <div className="flex items-center gap-3">
              <div className="clean-icon"><Wallet size={18} /></div>
              <div>
                <div className="text-sm font-black">Privacy & Data</div>
                <div className="text-xs text-[var(--text-3)]">จัดการข้อมูลในเครื่องและ backup</div>
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              <Link href="/settings?tab=data" className="clean-row-link"><Settings size={15} /> Storage settings <ArrowRight size={14} /></Link>
              <Link href="/settings?tab=data" className="clean-row-link"><Download size={15} /> Export .paymap.json <ArrowRight size={14} /></Link>
              <Link href="/settings?tab=data" className="clean-row-link"><Upload size={15} /> Import backup <ArrowRight size={14} /></Link>
            </div>
          </div>

          <div className="clean-card p-5">
            <div className="clean-eyebrow">Next step</div>
            <h2 className="mt-2 text-xl font-black">ทำให้ข้อมูลเริ่มต้นสะอาด</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-2)]">
              เพิ่ม wallet หลัก 1-2 บัญชี แล้ว import หรือบันทึกรายรับรายจ่ายชุดแรกก่อนเปิด Cloud Backup
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
