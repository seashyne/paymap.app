"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowLeftRight,
  Bitcoin,
  Coins,
  CreditCard,
  Landmark,
  Plus,
  RefreshCw,
  Smartphone,
  Trash2,
  WalletCards,
  X,
} from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import type { DashboardTemplate } from "@/lib/ui-preferences"
import type { ModuleSurface } from "@/lib/ui-template-modules"
import { TemplateEmptyStateCard } from "@/components/ui/TemplateModuleSurface"

type WalletType = "cash" | "bank" | "credit_card" | "ewallet" | "crypto"
type Wallet = {
  id: string
  name: string
  type: WalletType
  balance: number
  currency: string
  color: string
  icon: string
  bankName?: string
  accountLast4?: string
  isDefault: boolean
}

const TYPE_META: Record<WalletType, { label: string; icon: React.ComponentType<any>; color: string }> = {
  cash: { label: "เงินสด", icon: Coins, color: "#22c55e" },
  bank: { label: "บัญชีธนาคาร", icon: Landmark, color: "#3b82f6" },
  credit_card: { label: "บัตรเครดิต", icon: CreditCard, color: "#ef4444" },
  ewallet: { label: "e-Wallet", icon: Smartphone, color: "#f59e0b" },
  crypto: { label: "Crypto", icon: Bitcoin, color: "#f97316" },
}

const FMT = (n: number, cur = "THB") =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: cur, minimumFractionDigits: 0 }).format(n)

function SoftStat({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.07] p-4 text-white">
      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/65">{label}</div>
      <div className="mt-2 text-2xl font-black tracking-tight">{value}</div>
      {hint ? <div className="mt-1 text-xs text-white/60" style={accent ? { color: accent } : undefined}>{hint}</div> : null}
    </div>
  )
}

export default function WalletsClient({ template, moduleSurface }: { template: DashboardTemplate; moduleSurface: ModuleSurface }) {
  const { showToast } = useToast()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [form, setForm] = useState({ name: "", type: "cash" as WalletType, balance: "", currency: "THB", bankName: "", color: "#8b5cf6", icon: "💳" })
  const [transfer, setTransfer] = useState({ fromId: "", toId: "", amount: "", fee: "0", note: "", happenedAt: new Date().toISOString().split("T")[0] })

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch("/api/wallets")
      const d = await res.json()
      if (d.success) {
        setWallets((d.data ?? []).map((item: any) => ({ ...item, balance: Number(item.balance ?? 0) })))
        return
      }
      setLoadError(d.error ?? "ยังโหลดข้อมูลกระเป๋าเงินไม่สำเร็จ")
    } catch {
      setLoadError("ยังเชื่อมต่อข้อมูลกระเป๋าเงินไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totalBalance = useMemo(() => wallets.reduce((s, w) => s + w.balance, 0), [wallets])
  const positiveWallets = useMemo(() => wallets.filter((wallet) => wallet.balance >= 0), [wallets])
  const liquidBalance = useMemo(() => positiveWallets.reduce((sum, wallet) => sum + wallet.balance, 0), [positiveWallets])
  const creditExposure = useMemo(() => wallets.filter((wallet) => wallet.type === "credit_card").reduce((sum, wallet) => sum + Math.abs(Math.min(wallet.balance, 0)), 0), [wallets])
  const defaultWallet = useMemo(() => wallets.find((wallet) => wallet.isDefault) ?? wallets[0] ?? null, [wallets])
  const coverageRatio = liquidBalance > 0 ? Math.min(100, Math.round((Math.max(totalBalance, 0) / liquidBalance) * 100)) : 0
  const sortedWallets = useMemo(() => [...wallets].sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || b.balance - a.balance), [wallets])

  async function addWallet() {
    if (!form.name) return showToast("กรุณากรอกชื่อกระเป๋า", "error")
    const res = await fetch("/api/wallets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, balance: Number(form.balance) || 0 }),
    })
    const d = await res.json()
    if (d.success) {
      showToast("เพิ่มกระเป๋าเงินแล้ว", "success")
      setShowAdd(false)
      setForm({ name: "", type: "cash", balance: "", currency: "THB", bankName: "", color: "#8b5cf6", icon: "💳" })
      load()
    } else {
      showToast(d.error, "error")
    }
  }

  async function doTransfer() {
    if (!transfer.fromId || !transfer.toId || !transfer.amount) return showToast("กรุณากรอกข้อมูลให้ครบ", "error")
    const res = await fetch("/api/wallets/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromWalletId: transfer.fromId,
        toWalletId: transfer.toId,
        amount: Number(transfer.amount),
        fee: Number(transfer.fee) || 0,
        note: transfer.note,
        happenedAt: transfer.happenedAt,
      }),
    })
    const d = await res.json()
    if (d.success) {
      showToast("โอนเงินสำเร็จ", "success")
      setShowTransfer(false)
      setTransfer({ fromId: "", toId: "", amount: "", fee: "0", note: "", happenedAt: new Date().toISOString().split("T")[0] })
      load()
    } else {
      showToast(d.error, "error")
    }
  }

  async function deleteWallet(id: string) {
    if (!confirm("ต้องการลบกระเป๋าเงินนี้?")) return
    await fetch(`/api/wallets/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-[34px] border border-white/10 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.32)] lg:p-8"
        style={{ background: "linear-gradient(145deg, color-mix(in srgb, var(--primary) 84%, #0f172a), #08111f 72%)" }}
      >
        <div className="pointer-events-none absolute -right-12 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-72 bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.12),transparent_68%)]" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/70">{moduleSurface.eyebrow}</div>
              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">{template} template</div>
            </div>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <div>
                <div className="text-sm text-white/70">Total wallet coverage</div>
                <div className="mt-1 text-4xl font-black tracking-tight lg:text-5xl">{FMT(totalBalance)}</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/80">{wallets.length} wallets active</div>
            </div>
            <div className="mt-5 max-w-2xl text-sm leading-7 text-white/72">
              หน้า wallets ถูกจัดให้เป็น cockpit สำหรับดู cash pockets, transfer rail และ account mix บนจอใหญ่ โดยยังใช้ฐานข้อมูลและ flow เดิมของระบบทั้งหมด
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <SoftStat label="Liquid balance" value={FMT(liquidBalance)} hint="เงินพร้อมใช้ในทุกบัญชี" />
              <SoftStat label="Credit exposure" value={FMT(creditExposure)} hint="ภาระบัตรเครดิตที่ต้องจับตา" />
              <SoftStat label="Primary wallet" value={defaultWallet?.name ?? "Not set"} hint={defaultWallet ? FMT(defaultWallet.balance, defaultWallet.currency) : "ตั้งค่า wallet หลักได้ภายหลัง"} />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/70">Transfer readiness</div>
                  <div className="mt-2 text-2xl font-black">{coverageRatio}%</div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/10">
                  <WalletCards size={20} />
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-white" style={{ width: `${coverageRatio}%` }} />
              </div>
              <div className="mt-3 text-sm text-white/65">สัดส่วนเงินพร้อมใช้เทียบกับยอดสุทธิรวม เพื่อเช็กว่าหน้า wallet ยังมีแรงรองรับการโอนและการใช้จ่ายระยะสั้น</div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.09] px-4 py-4 text-left transition hover:-translate-y-0.5"
              >
                <div>
                  <div className="text-sm font-bold">เพิ่มกระเป๋าเงิน</div>
                  <div className="mt-1 text-xs text-white/65">{moduleSurface.actions?.primary ?? "สร้าง wallet ใหม่"}</div>
                </div>
                <Plus size={18} />
              </button>
              <button
                onClick={() => setShowTransfer(true)}
                className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.09] px-4 py-4 text-left transition hover:-translate-y-0.5"
              >
                <div>
                  <div className="text-sm font-bold">โอนเงินระหว่างบัญชี</div>
                  <div className="mt-1 text-xs text-white/65">{moduleSurface.actions?.secondary ?? "ย้ายยอดและบันทึกค่าธรรมเนียม"}</div>
                </div>
                <ArrowLeftRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-14"><RefreshCw className="animate-spin text-[var(--primary)]" size={28} /></div>
      ) : loadError ? (
        <div className="rounded-[30px] border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="text-lg font-bold text-[var(--text)]">ยังโหลดหน้ากระเป๋าเงินไม่ครบ</div>
          <div className="mt-2 text-sm text-[var(--text-3)]">{loadError}</div>
          <button onClick={() => void load()} className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold text-white" style={{ background: "var(--primary)" }}>
            ลองโหลดอีกครั้ง
          </button>
        </div>
      ) : wallets.length === 0 ? (
        <TemplateEmptyStateCard title={moduleSurface.empty.title} description={moduleSurface.empty.description} actionHref={moduleSurface.empty.actionHref} actionLabel={moduleSurface.empty.actionLabel} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
          <section className="glass-card rounded-[30px] p-5 lg:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Wallet map</div>
                <h2 className="mt-1 text-2xl font-black">Account coverage by balance</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">กระเป๋าทุกใบถูกจัดเป็น panel ให้อ่านยอด, ประเภท และจุดที่ควรโอนย้ายเงินได้จากจอเดียว</p>
              </div>
              <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm font-semibold text-[var(--text)]">
                <RefreshCw size={15} />
                Refresh balances
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {sortedWallets.map((wallet) => {
                const meta = TYPE_META[wallet.type]
                const Icon = meta.icon
                const balanceTone = wallet.balance >= 0 ? "#22c55e" : "#ef4444"
                return (
                  <div key={wallet.id} className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface-2)] p-5 shadow-[var(--shadow-soft)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-20 opacity-70" style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${wallet.color || meta.color} 18%, transparent), transparent)` }} />
                    {wallet.isDefault ? (
                      <span className="absolute right-4 top-4 rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--primary)" }}>
                        Default
                      </span>
                    ) : null}
                    <div className="relative flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl text-white shadow-sm" style={{ backgroundColor: wallet.color || meta.color }}>
                        {wallet.icon || <Icon size={20} />}
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--text)]">{wallet.name}</div>
                        <div className="text-xs text-[var(--text-3)]">
                          {meta.label}
                          {wallet.bankName ? ` · ${wallet.bankName}` : ""}
                          {wallet.accountLast4 ? ` ···${wallet.accountLast4}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 text-3xl font-black tracking-tight" style={{ color: balanceTone }}>{FMT(wallet.balance, wallet.currency)}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--text-3)]">
                      <span className="rounded-full border border-[var(--border)] px-2.5 py-1">Currency {wallet.currency}</span>
                      <span className="rounded-full border border-[var(--border)] px-2.5 py-1">{wallet.balance >= 0 ? "Available" : "Needs attention"}</span>
                    </div>
                    <div className="mt-5 flex justify-between gap-3">
                      <div className="text-xs leading-5 text-[var(--text-3)]">พร้อมใช้ใน flow ของ {template} และเชื่อมกับ transfer journal เดิมของระบบ</div>
                      <button onClick={() => deleteWallet(wallet.id)} className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-3)] transition-colors hover:border-red-200 hover:bg-red-500/10 hover:text-red-400">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="glass-card rounded-[30px] p-5 lg:p-6">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Wallet insights</div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="text-sm font-bold text-[var(--text)]">Primary account focus</div>
                  <div className="mt-2 text-sm leading-6 text-[var(--text-2)]">
                    {defaultWallet
                      ? `${defaultWallet.name} เป็นบัญชีหลักตอนนี้และถือยอด ${FMT(defaultWallet.balance, defaultWallet.currency)}`
                      : "ยังไม่มีการตั้ง default wallet ลองสร้างกระเป๋าแรกเพื่อเริ่ม map เงินของคุณ"}
                  </div>
                </div>
                <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="text-sm font-bold text-[var(--text)]">Funding mix</div>
                  <div className="mt-2 text-sm leading-6 text-[var(--text-2)]">มี {positiveWallets.length} wallet ที่ยอดเป็นบวก และ {wallets.length - positiveWallets.length} wallet ที่ควรเช็ก balance หรือภาระค้างชำระ</div>
                </div>
                <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="text-sm font-bold text-[var(--text)]">Transfer habit</div>
                  <div className="mt-2 text-sm leading-6 text-[var(--text-2)]">ใช้ transfer rail ด้านบนเพื่อย้ายเงินระหว่าง cash, bank, e-wallet และบันทึกค่าธรรมเนียมไว้ใน timeline เดิม</div>
                </div>
              </div>
            </section>

            <section className="glass-card rounded-[30px] p-5 lg:p-6">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Type mix</div>
              <div className="mt-4 space-y-3">
                {Object.entries(TYPE_META).map(([type, meta]) => {
                  const count = wallets.filter((wallet) => wallet.type === type).length
                  const total = wallets.filter((wallet) => wallet.type === type).reduce((sum, wallet) => sum + wallet.balance, 0)
                  const Icon = meta.icon
                  return (
                    <div key={type} className="flex items-center justify-between gap-3 rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[16px] text-white" style={{ background: meta.color }}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--text)]">{meta.label}</div>
                          <div className="text-xs text-[var(--text-3)]">{count} accounts</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-[var(--text)]">{FMT(total)}</div>
                        <div className="text-xs text-[var(--text-3)]">combined</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </aside>
        </div>
      )}

      {showAdd ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md space-y-4 rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_32px_80px_rgba(15,23,42,0.35)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[var(--text)]">เพิ่มกระเป๋าเงิน</h2>
                <p className="text-sm text-[var(--text-3)]">สร้างบัญชี, กระเป๋า cash หรือ e-wallet ให้เป็นส่วนหนึ่งของ cockpit</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="rounded-2xl border border-[var(--border)] p-2 text-[var(--text-3)]"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="ชื่อกระเป๋า" className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none" />
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as WalletType }))} className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none">
                {Object.entries(TYPE_META).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
              </select>
              {form.type === "bank" ? (
                <input value={form.bankName} onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))} placeholder="ชื่อธนาคาร" className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none" />
              ) : null}
              <input type="number" value={form.balance} onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))} placeholder="ยอดเริ่มต้น" className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none" />
              <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none">
                {["THB", "USD", "EUR", "GBP", "JPY", "SGD"].map((currency) => <option key={currency} value={currency}>{currency}</option>)}
              </select>
            </div>
            <button onClick={addWallet} className="w-full rounded-xl py-3 font-medium text-white" style={{ background: "var(--primary)" }}>
              {moduleSurface.actions?.primary ?? "เพิ่มกระเป๋าเงิน"}
            </button>
          </div>
        </div>
      ) : null}

      {showTransfer ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setShowTransfer(false)}>
          <div className="w-full max-w-md space-y-4 rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_32px_80px_rgba(15,23,42,0.35)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[var(--text)]">โอนเงินระหว่างกระเป๋า</h2>
                <p className="text-sm text-[var(--text-3)]">บันทึก movement จริงในระบบโดยไม่ต้องออกจากหน้า cockpit</p>
              </div>
              <button onClick={() => setShowTransfer(false)} className="rounded-2xl border border-[var(--border)] p-2 text-[var(--text-3)]"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-[var(--text-3)]">จาก</label>
                <select value={transfer.fromId} onChange={(e) => setTransfer((t) => ({ ...t, fromId: e.target.value }))} className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none">
                  <option value="">เลือกกระเป๋าต้นทาง</option>
                  {wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name} ({FMT(wallet.balance, wallet.currency)})</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-[var(--text-3)]">ไปยัง</label>
                <select value={transfer.toId} onChange={(e) => setTransfer((t) => ({ ...t, toId: e.target.value }))} className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none">
                  <option value="">เลือกกระเป๋าปลายทาง</option>
                  {wallets.filter((wallet) => wallet.id !== transfer.fromId).map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name}</option>)}
                </select>
              </div>
              <input type="number" value={transfer.amount} onChange={(e) => setTransfer((t) => ({ ...t, amount: e.target.value }))} placeholder="จำนวนเงิน" className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none" />
              <input type="number" value={transfer.fee} onChange={(e) => setTransfer((t) => ({ ...t, fee: e.target.value }))} placeholder="ค่าธรรมเนียม" className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none" />
              <input type="date" value={transfer.happenedAt} onChange={(e) => setTransfer((t) => ({ ...t, happenedAt: e.target.value }))} className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none" />
            </div>
            <button onClick={doTransfer} className="w-full rounded-xl py-3 font-medium text-white" style={{ background: "var(--primary)" }}>
              {moduleSurface.actions?.secondary ?? "โอนเงิน"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
