"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CreditCard, CheckCircle2, ExternalLink, Receipt, Sparkles, XCircle,
  ArrowRight, Building2, Store, User, Calendar, Zap, RefreshCw,
} from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import { firstError, readApi } from "@/lib/http"
import PurchaseHistory from "@/components/billing/PurchaseHistory"
import type { ModuleSurface } from "@/lib/ui-template-modules"
import { EmptyStateCard } from "@/components/ui/PageStates"
import type { SiteLang } from "@/lib/i18n/site"
import { getAppMessages } from "@/lib/i18n/app"

type AccountMode = "personal" | "business" | "merchant"

interface ProductSub {
  product: string; planTier: string; status: string; currentPeriodEnd?: Date | null
}
interface Props {
  plan: string
  accountMode: AccountMode
  availableModes: AccountMode[]
  productSubscriptions: ProductSub[]
  stripeCustomerId?: string | null
  moduleSurface: ModuleSurface
  lang?: SiteLang
}
type PlanSet = { personalPlans?: any[]; businessPlans?: any[]; merchantPlans?: any[] }

const MODE_META: Record<AccountMode, { label: string; icon: any; color: string; bg: string; border: string }> = {
  personal: { label: "Personal", icon: User,     color: "#7c3aed", bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.3)" },
  business: { label: "Business", icon: Building2, color: "#0ea5e9", bg: "rgba(14,165,233,0.12)",  border: "rgba(14,165,233,0.3)" },
  merchant: { label: "Merchant", icon: Store,     color: "#e11d48", bg: "rgba(225,29,72,0.12)",   border: "rgba(225,29,72,0.3)" },
}

export default function BillingClient({ plan, accountMode, availableModes, productSubscriptions, stripeCustomerId, moduleSurface, lang = "en" }: Props) {
  const t = getAppMessages(lang)
  const router = useRouter()
  const [loading, setLoading]                 = useState(false)
  const [plans, setPlans]                     = useState<PlanSet | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [interval, setInterval]               = useState<"monthly" | "yearly">("monthly")
  const [switching, setSwitching]             = useState<AccountMode | null>(null)
  const [usage, setUsage]                     = useState<any | null>(null)
  const toast = useToast()

  const meta   = MODE_META[accountMode]
  const Icon   = meta.icon
  const activeMap = useMemo(() => new Map(productSubscriptions.filter((s) => s.status === "active").map(s => [s.product, s])), [productSubscriptions])
  const activeSub = activeMap.get(accountMode)

  useEffect(() => {
    fetch(`/api/billing/usage?mode=${accountMode}`).then(r => readApi<any>(r).then(p => ({ ok: r.ok, p }))).then(({ ok, p }) => { if (ok) setUsage(p.data ?? null) }).catch(() => {})
    fetch("/api/billing/plans")
      .then(r => readApi<PlanSet>(r).then(p => ({ ok: r.ok, p })))
      .then(({ ok, p }) => { if (ok) setPlans(p.data ?? null) })
      .catch(() => {})
  }, [])

  // แผนของโหมดที่ active อยู่เท่านั้น
  const myPlans: any[] = useMemo(() => {
    if (!plans) return []
    return accountMode === "personal" ? (plans.personalPlans ?? [])
         : accountMode === "business" ? (plans.businessPlans ?? [])
         : (plans.merchantPlans ?? [])
  }, [plans, accountMode])

  // สลับโหมด — เรียก switch-mode API แล้ว reload
  const switchMode = async (mode: AccountMode) => {
    if (mode === accountMode || switching) return
    setSwitching(mode)
    try {
      const res  = await fetch("/api/workspaces/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, redirect: "/billing" }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.needsRegister) {
          router.push(data.registerUrl ?? `/register?mode=${mode}`)
        } else {
          toast.error(data.error ?? "สลับโหมดไม่สำเร็จ")
        }
        return
      }
      router.push(data.redirectTo ?? "/billing")
      router.refresh()
    } catch {
      toast.error("เกิดข้อผิดพลาด")
    } finally {
      setSwitching(null)
    }
  }

  const openPortal = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" })
      const payload = await readApi<{ url: string }>(res)
      if (!res.ok) { toast.error(payload.error ?? "เปิดหน้าจัดการการชำระเงินไม่สำเร็จ", firstError(payload.details)); return }
      if (payload.data?.url) window.location.assign(payload.data.url)
    } finally { setLoading(false) }
  }

  const startCheckout = async (priceId: string, key: string) => {
    if (!priceId) { toast.error(lang === "th" ? "ยังไม่พร้อมเปิดการชำระเงินสำหรับแพ็กเกจนี้" : lang === "lo" ? "ແພັກເກດນີ້ຍັງບໍ່ພ້ອມສຳລັບການຊຳລະ" : "Checkout is not ready for this plan", lang === "th" ? "กรุณาตรวจสอบการตั้งค่าระบบชำระเงิน" : lang === "lo" ? "ກະລຸນາກວດກາການຕັ້ງຄ່າການຊຳລະ" : "Please review your payment setup"); return }
    setCheckoutLoading(key)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, interval, returnTo: `/billing?product=${accountMode}` }),
      })
      const payload = await readApi<{ url: string }>(res)
      if (!res.ok) { toast.error(payload.error ?? "เริ่มขั้นตอนชำระเงินไม่สำเร็จ", firstError(payload.details)); return }
      if (payload.data?.url) window.location.assign(payload.data.url)
    } finally { setCheckoutLoading(null) }
  }

  const ALL_MODES: AccountMode[] = ["personal", "business", "merchant"]
  const otherModes = ALL_MODES.filter(m => m !== accountMode)

  return (
    <div className="space-y-6">

      {/* Hero */}
      <section className="page-hero">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="section-title mb-3 flex items-center gap-2">
              <Icon size={13} style={{ color: meta.color }} />
              <span style={{ color: meta.color }}>{t.common.workspace}: {meta.label}</span>
            </div>
            <h1 className="text-3xl font-black md:text-4xl">{moduleSurface.title}</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-2)]">
              {moduleSurface.description} สำหรับโหมด <strong style={{ color: meta.color }}>{meta.label}</strong>
            </p>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-3 xl:w-[320px] xl:grid-cols-1">
            <Stat title={t.common.activeWorkspace} value={meta.label} icon={Icon} accent={meta.color} />
            <Stat title={t.common.plan}  value={(activeSub?.planTier ?? "free").toUpperCase()} icon={Sparkles} />
            <Stat title="Stripe" value={stripeCustomerId ? t.common.linked : t.common.pending}  icon={Receipt}  />
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {moduleSurface.cards.map((card) => {
          const IconCard = card.icon
          return (
            <div key={card.title} className="soft-panel rounded-[24px] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: meta.bg, color: meta.color }}><IconCard size={18} /></div>
                <div>
                  <div className="text-sm font-black">{card.title}</div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">{card.tag}</div>
                </div>
              </div>
              <div className="mt-3 text-sm leading-6 text-[var(--text-2)]">{card.description}</div>
            </div>
          )
        })}
      </section>

      {usage?.items?.length ? (
        <section className="glass-card rounded-[30px] p-6">
          <div className="mb-4">
            <h2 className="text-xl font-black">Usage and limits</h2>
            <p className="mt-1 text-sm text-[var(--text-3)]">Keep track of capacity before your team hits workspace limits.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {usage.items.map((item: any) => {
              const percent = item.limit ? Math.min(100, Math.round((item.used / item.limit) * 100)) : 0
              return (
                <div key={item.key} className="soft-panel rounded-[22px] p-4">
                  <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">{item.label}</div>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <div className="text-2xl font-black">{item.used}<span className="ml-1 text-sm font-semibold text-[var(--text-3)]">/ {item.limit}</span></div>
                    <div className="text-xs font-semibold text-[var(--text-3)]">{percent}%</div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div className="h-full rounded-full" style={{ width: `${percent}%`, background: percent > 85 ? '#f59e0b' : meta.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* Active subscriptions ของโหมดนี้ */}
      {activeSub && (
        <section className="glass-card rounded-[30px] p-6">
          <h2 className="text-xl font-black mb-4">{lang === "th" ? "แผนที่ใช้งานอยู่" : lang === "lo" ? "ແຜນທີ່ກຳລັງໃຊ້" : "Current plan"}</h2>
          <div className="soft-panel rounded-[26px] p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: meta.bg }}>
                <Icon size={20} style={{ color: meta.color }} />
              </div>
              <div>
                <div className="font-black break-words" style={{ color: meta.color }}>{meta.label}</div>
                <div className="flex gap-2 mt-1.5 text-xs flex-wrap">
                  <span className="rounded-full px-2.5 py-0.5 font-mono uppercase"
                    style={{ background: `${meta.color}18`, color: meta.color }}>{activeSub.planTier}</span>
                  <span className="rounded-full border border-[var(--border)] px-2.5 py-0.5 font-mono uppercase text-[var(--text-3)]">{activeSub.status}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {activeSub.currentPeriodEnd && (
                <span className="text-xs text-[var(--text-3)]">
{lang === "th" ? "ต่ออายุ" : lang === "lo" ? "ຕໍ່ອາຍຸ" : "Renews"} {new Date(activeSub.currentPeriodEnd).toLocaleDateString(lang === "th" ? "th-TH" : lang === "lo" ? "lo-LA" : "en-US")}
                </span>
              )}
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: activeSub.status === "active" ? "rgba(34,197,94,0.12)" : "rgba(248,113,113,0.12)",
                  color: activeSub.status === "active" ? "#86efac" : "#fda4af",
                }}>
                {activeSub.status === "active" ? <CheckCircle2 size={13}/> : <XCircle size={13}/>}
                {activeSub.status}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Checkout — แผนโหมดนี้เท่านั้น */}
      <section className="glass-card rounded-[30px] p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">{t.common.plan} · {meta.label}</h2>
            <p className="mt-1 text-sm text-[var(--text-3)]">{lang === "th" ? "เลือกแพ็กเกจที่เหมาะกับการใช้งาน แล้วไปหน้าชำระเงินได้ทันที" : lang === "lo" ? "ເລືອກແຜນທີ່ເໝາະກັບການໃຊ້ງານ ແລ້ວໄປຕໍ່ທີ່ໜ້າຊຳລະໄດ້ທັນທີ" : "Choose the plan that fits your workflow and continue to checkout right away."}</p>
          </div>
          {/* Interval toggle */}
          <div className="inline-flex rounded-2xl border border-[var(--border)] p-1 text-sm">
            {(["monthly", "yearly"] as const).map(iv => (
              <button key={iv} onClick={() => setInterval(iv)}
                className="rounded-xl px-4 py-1.5 font-semibold transition-all flex items-center gap-1.5"
                style={{
                  background: interval === iv ? meta.color : "transparent",
                  color: interval === iv ? "#fff" : "var(--text-3)",
                }}>
                {iv === "monthly" ? (lang === "th" ? "รายเดือน" : lang === "lo" ? "ລາຍເດືອນ" : "Monthly") : (
                  <>{lang === "th" ? "รายปี" : lang === "lo" ? "ລາຍປີ" : "Yearly"} <span className="text-[10px] rounded-full px-1.5 py-0.5 font-bold"
                    style={{ background: "rgba(34,197,94,0.2)", color: "#86efac" }}>-17%</span></>
                )}
              </button>
            ))}
          </div>
        </div>

        {!plans ? (
          <div className="py-10 text-center text-sm text-[var(--text-3)]">{lang === "th" ? "กำลังโหลดแผน…" : lang === "lo" ? "ກຳລັງໂຫຼດແຜນ…" : "Loading plans…"}</div>
        ) : myPlans.length === 0 ? (
          <EmptyStateCard title={moduleSurface.empty.title} description={moduleSurface.empty.description} actionHref={moduleSurface.empty.actionHref} actionLabel={moduleSurface.empty.actionLabel} />
        ) : (
          <div className={`content-grid-safe ${myPlans.length >= 4 ? "xl:grid-cols-4" : myPlans.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
            {myPlans.map((p: any) => {
              const priceId = interval === "yearly"
                ? (p.priceIds?.yearly ?? p.priceIds?.monthly ?? "")
                : (p.priceIds?.monthly ?? "")
              const key = `${accountMode}:${p.key}`
              const isCurrent = activeSub?.planTier === p.key
              const displayPrice = interval === "yearly" && p.yearlyThb ? p.yearlyThb : p.thb
              const monthlyEquivalent = interval === "yearly" && p.yearlyThb ? p.yearlyThb / 12 : null

              return (
                <div key={p.key}
                  className="relative rounded-[22px] border p-5 flex flex-col transition-all"
                  style={{
                    background: isCurrent ? `${meta.color}10` : "rgba(255,255,255,0.02)",
                    borderColor: isCurrent ? meta.color : "var(--border)",
                    boxShadow: isCurrent ? `0 0 20px ${meta.color}20` : "none",
                  }}>
                  {isCurrent && (
                    <div className="absolute -top-2.5 left-4 rounded-full px-3 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: meta.color }}>แผนปัจจุบัน</div>
                  )}
                  {p.badge && !isCurrent && (
                    <div className="absolute -top-2.5 left-4 rounded-full px-3 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: meta.color }}>{p.badge}</div>
                  )}

                  <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--text-3)] mb-2">{p.name}</div>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-3xl font-black">
                      {displayPrice === 0 ? (lang === "th" ? "ฟรี" : lang === "lo" ? "ຟຣີ" : "Free") : `฿${displayPrice.toLocaleString(lang === "th" ? "th-TH" : lang === "lo" ? "lo-LA" : "en-US")}`}
                    </span>
                    {displayPrice > 0 && (<span className="pb-1.5 text-xs text-[var(--text-3)]">/{interval === "yearly" ? (lang === "th" ? "ปี" : lang === "lo" ? "ປີ" : "year") : (lang === "th" ? "เดือน" : lang === "lo" ? "ເດືອນ" : "month")}</span>)}
                  </div>
                  {monthlyEquivalent ? <div className="mb-3 text-xs text-[var(--text-3)]">{lang === "th" ? "เฉลี่ย" : lang === "lo" ? "ສະເລ່ຍ" : "Avg."} ฿{monthlyEquivalent.toLocaleString(lang === "th" ? "th-TH" : lang === "lo" ? "lo-LA" : "en-US", { maximumFractionDigits: 0 })}/{lang === "th" ? "เดือน" : lang === "lo" ? "ເດືອນ" : "month"}</div> : null}

                  <ul className="space-y-2 text-sm text-[var(--text-2)] flex-1 mb-4">
                    {p.features?.map((f: string) => (
                      <li key={f} className="flex gap-2">
                        <span style={{ color: meta.color }}>✓</span><span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {p.priceIds === null ? (
                    <a href="/pricing"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-2)]">
                      ดูรายละเอียด <ArrowRight size={14}/>
                    </a>
                  ) : isCurrent ? (
                    <div className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold opacity-70"
                      style={{ background: `${meta.color}20`, color: meta.color }}>
                      <CheckCircle2 size={15}/> {lang === "th" ? "ใช้งานอยู่" : lang === "lo" ? "ກຳລັງໃຊ້" : "Current plan"}
                    </div>
                  ) : (
                    <button onClick={() => startCheckout(priceId, key)}
                      disabled={checkoutLoading === key}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60 hover:opacity-90 transition-opacity"
                      style={{ background: meta.color }}>
                      {checkoutLoading === key ? (lang === "th" ? "กำลังเปิด…" : lang === "lo" ? "ກຳລັງເປີດ…" : "Opening…")
                        : displayPrice === 0 ? <><Zap size={14}/> {lang === "th" ? "เริ่มฟรี" : lang === "lo" ? "ເລີ່ມຟຣີ" : "Start free"}</>
                        : <><CreditCard size={14}/> {lang === "th" ? "ไปหน้าชำระเงิน" : lang === "lo" ? "ໄປຕໍ່ທີ່ການຊຳລະ" : "Go to checkout"}</>}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <p className="mt-5 text-center text-xs text-[var(--text-3)]">
          <Calendar size={11} className="inline mr-1"/>
          {lang === "th" ? "ราคาแสดงเป็น THB · หลังชำระเงินสำเร็จ ระบบจะอัปเดตแผนของคุณให้อัตโนมัติ" : lang === "lo" ? "ລາຄາສະແດງເປັນ THB · ຫຼັງຊຳລະສຳເລັດ ລະບົບຈະອັບເດດແຜນໃຫ້ອັດຕະໂນມັດ" : "Prices are shown in THB. After payment succeeds, your plan updates automatically."}
        </p>
      </section>

      {/* ── สลับโหมด section ───────────────────────────────────────────── */}
      <section className="glass-card rounded-[30px] p-6">
        <h2 className="text-xl font-black mb-1">{lang === "th" ? "พื้นที่ทำงานอื่น" : lang === "lo" ? "ພື້ນທີ່ອື່ນ" : "Other workspaces"}</h2>
        <p className="text-sm text-[var(--text-3)] mb-5">{lang === "th" ? "คุณสามารถสลับไปจัดการพื้นที่อื่นได้จากส่วนนี้" : lang === "lo" ? "ທ່ານສາມາດສະຫຼັບໄປຈັດການພື້ນທີ່ອື່ນໄດ້ຈາກສ່ວນນີ້" : "Switch to another workspace from this section."}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {otherModes.map(m => {
            const mm = MODE_META[m]
            const MIcon = mm.icon
            const hasAccount = availableModes.includes(m)
            const isLoading  = switching === m
            return (
              <button key={m} onClick={() => switchMode(m)} disabled={!!switching}
                className="flex items-center gap-4 rounded-[22px] p-4 text-left transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: mm.bg, border: `1px solid ${mm.border}` }}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${mm.color}20`, border: `1px solid ${mm.border}` }}>
                  {isLoading
                    ? <RefreshCw size={18} style={{ color: mm.color }} className="animate-spin"/>
                    : <MIcon size={18} style={{ color: mm.color }}/>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm" style={{ color: mm.color }}>
                    {isLoading ? (lang === "th" ? "กำลังสลับ…" : lang === "lo" ? "ກຳລັງສະຫຼັບ…" : "Switching…") : `${lang === "th" ? "สลับไป" : lang === "lo" ? "ສະຫຼັບໄປ" : "Switch to"} ${mm.label}`}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                    {hasAccount ? (lang === "th" ? "มีบัญชีอยู่แล้ว — สลับได้ทันที" : lang === "lo" ? "ມີບັນຊີແລ້ວ — ສະຫຼັບໄດ້ທັນທີ" : "Account already exists — switch now") : (lang === "th" ? "ยังไม่มีบัญชี — จะพาไปสมัคร" : lang === "lo" ? "ຍັງບໍ່ມີບັນຊີ — ຈະພາໄປສະໝັກ" : "No account yet — you will be taken to sign up")}
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: mm.color, opacity: 0.6 }} />
              </button>
            )
          })}
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={openPortal} disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: meta.color }}>
          <ExternalLink size={15}/> {loading ? "Opening…" : (lang === "th" ? "เปิด Stripe portal" : lang === "lo" ? "ເປີດ Stripe portal" : "Open Stripe portal")}
        </button>
        <a href="/pricing"
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text-2)] hover:text-[var(--text)]">
          <CreditCard size={15}/> เปรียบเทียบแผนทุกโหมด
        </a>
      </div>

      <PurchaseHistory />
    </div>
  )
}

function Stat({ title, value, icon: Icon, accent }: { title: string; value: string; icon: any; accent?: string }) {
  return (
    <div className="soft-panel min-w-0 overflow-hidden rounded-[22px] p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{title}</div>
        <Icon size={15} style={{ color: accent ?? "var(--text-3)" }}/>
      </div>
      <div className="mt-2 break-words text-lg font-black" style={{ color: accent }}>{value}</div>
    </div>
  )
}
