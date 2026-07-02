"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { OnboardingTemplate } from "@/lib/onboarding-templates"
import type { SiteLang } from "@/lib/i18n/site"
import {
  ArrowRight, Check, Loader2, Building2, Store,
  Sparkles, ChevronRight, X,
} from "lucide-react"

const CURRENCIES = [
  { code: "THB", label: "฿ บาท", flag: "🇹🇭" },
  { code: "USD", label: "$ USD",  flag: "🇺🇸" },
  { code: "SGD", label: "$ SGD",  flag: "🇸🇬" },
  { code: "JPY", label: "¥ JPY",  flag: "🇯🇵" },
  { code: "EUR", label: "€ EUR",  flag: "🇪🇺" },
  { code: "GBP", label: "£ GBP",  flag: "🇬🇧" },
]

const MODE_META = {
  personal: { label: "Owner view", icon: Building2, color: "#7c3aed" },
  business: { label: "ERP Lite", icon: Building2,  color: "#0ea5e9" },
  merchant: { label: "Store POS", icon: Store,       color: "#e11d48" },
}


const COPY = {
  en: { skip: "Skip for now", introBadge: "ERP Lite setup for SME", title: "Set up PayMap ERP Lite in minutes", body: "Choose the business workflow you need first: invoice and cashflow, or store sales and stock. PayMap is now focused on SME operations instead of personal finance.", all: "All", choose: "Choose setup", confirm: "Confirm details", live: "Go live", detailsTitle: "Confirm your workspace details", detailsBody: "Give your business workspace a clear name and choose the currency you want to use first. You can update this later in Settings.", workspaceName: "Business or store name", currency: "Currency", apply: "Create ERP workspace", applying: "Creating workspace...", successTitle: "Your ERP Lite workspace is ready", openWorkspace: "Open workspace", trialBadge: "Start with the workflow that replaces your current Excel sheet.", genericError: "Something went wrong.", cannotConnect: "We could not reach the server. Please try again." },
  th: { skip: "ข้ามไปก่อน", introBadge: "ERP Lite สำหรับ SME", title: "ตั้งค่า PayMap ERP Lite ในไม่กี่นาที", body: "เลือก workflow ธุรกิจที่ต้องใช้ก่อน: invoice และ cashflow หรือยอดขายหน้าร้านและ stock ตอนนี้ PayMap โฟกัสงาน SME แทนการเงินส่วนตัว", all: "ทั้งหมด", choose: "เลือก setup", confirm: "ยืนยันรายละเอียด", live: "เข้าใช้งาน", detailsTitle: "ยืนยันรายละเอียดพื้นที่ทำงาน", detailsBody: "ตั้งชื่อธุรกิจหรือร้าน และเลือกสกุลเงินเริ่มต้น ภายหลังยังแก้ได้ใน Settings", workspaceName: "ชื่อธุรกิจหรือร้าน", currency: "สกุลเงิน", apply: "สร้าง ERP workspace", applying: "กำลังสร้าง workspace...", successTitle: "ERP Lite workspace พร้อมแล้ว", openWorkspace: "เปิด workspace", trialBadge: "เริ่มจาก workflow ที่ใช้แทน Excel เดิมของคุณก่อน", genericError: "เกิดข้อผิดพลาด", cannotConnect: "เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่" },
  lo: { skip: "ຂ້າມກ່ອນ", introBadge: "ERP Lite ສໍາລັບ SME", title: "ຕັ້ງຄ່າ PayMap ERP Lite ໃນບໍ່ກີ່ນາທີ", body: "ເລືອກ workflow ທຸລະກິດກ່ອນ: invoice ແລະ cashflow ຫຼື ຍອດຂາຍໜ້າຮ້ານແລະ stock.", all: "ທັງໝົດ", choose: "ເລືອກ setup", confirm: "ຢືນຢັນລາຍລະອຽດ", live: "ເຂົ້າໃຊ້ງານ", detailsTitle: "ຢືນຢັນລາຍລະອຽດ workspace", detailsBody: "ຕັ້ງຊື່ທຸລະກິດ ຫຼື ຮ້ານ ແລະເລືອກສະກຸນເງິນ.", workspaceName: "ຊື່ທຸລະກິດ ຫຼື ຮ້ານ", currency: "ສະກຸນເງິນ", apply: "ສ້າງ ERP workspace", applying: "ກຳລັງສ້າງ workspace...", successTitle: "ERP Lite workspace ພ້ອມແລ້ວ", openWorkspace: "ເປີດ workspace", trialBadge: "ເລີ່ມຈາກ workflow ທີ່ໃຊ້ແທນ Excel ເດີມ.", genericError: "ມີຂໍ້ຜິດພາດ", cannotConnect: "ບໍ່ສາມາດເຊື່ອມຕໍ່ໄດ້ ກະລຸນາລອງໃໝ່" },
} as const

interface Props {
  templates: OnboardingTemplate[]
  defaultMode: "personal" | "business" | "merchant"
  defaultCurrency: string
  lang: SiteLang
}

export default function OnboardingClient({ templates, defaultMode, defaultCurrency, lang }: Props) {
  const c = (COPY as any)[lang] || COPY.en
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [step, setStep]           = useState(1)
  const [filter, setFilter]       = useState<"business" | "merchant">(defaultMode === "merchant" ? "merchant" : "business")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [name, setName]           = useState("")
  const [currency, setCurrency]   = useState(defaultCurrency)
  const [applying, setApplying]   = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const erpTemplates = templates.filter(t => t.mode === "business" || t.mode === "merchant")
  const filtered   = erpTemplates.filter(t => t.mode === filter)
  const selected   = templates.find(t => t.id === selectedId)
  const ALL_MODES  = ["business", "merchant"] as const

  // ── Apply template & go to dashboard ──────────────────────────────────
  const handleApply = async () => {
    if (!selectedId || !name.trim()) return
    setApplying(true)
    setError(null)
    try {
      const res = await fetch("/api/onboarding/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedId,
          workspaceName: name.trim(),
          currency,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? c.genericError); return }

      setStep(3)
    } catch {
      setError(c.cannotConnect)
    } finally {
      setApplying(false)
    }
  }

  const goToDashboard = () => {
    const mode = selected?.mode ?? defaultMode
    startTransition(() => {
      router.push(mode === "merchant" ? "/merchant" : "/business")
      router.refresh()
    })
  }

  const skipOnboarding = () => {
    startTransition(() => {
      router.push(
        defaultMode === "merchant" ? "/merchant" : "/business"
      )
    })
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "var(--bg)", fontFamily: "var(--font-sans)", color: "var(--text)" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full opacity-[0.06] blur-[90px]" style={{ background: "#7c3aed" }} />
        <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full opacity-[0.05] blur-[80px]" style={{ background: "#0ea5e9" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-[920px] px-5 pb-24 pt-10">

        {/* ── Top bar ── */}
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black" style={{ background: "var(--primary)", color: "#fff" }}>p</div>
            <span className="text-sm font-bold" style={{ color: "var(--text)" }}>PayMap</span>
          </div>
          <button
            onClick={skipOnboarding}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: "var(--text-3)", border: "1px solid var(--border)" }}
          >
            {c.skip} <X size={12} />
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div className="mb-10 flex items-center justify-center gap-3">
          {[
            { n: 1, label: c.choose },
            { n: 2, label: c.confirm },
            { n: 3, label: c.live },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition-all"
                  style={{
                    background: step > s.n ? "#059669" : step === s.n ? "var(--primary)" : "rgba(142,161,199,0.12)",
                    color: step >= s.n ? "#fff" : "var(--text-3)",
                    boxShadow: step === s.n ? "0 0 18px rgba(124,58,237,0.4)" : "none",
                  }}
                >
                  {step > s.n ? <Check size={15} strokeWidth={3} /> : s.n}
                </div>
                <span className="hidden whitespace-nowrap text-[11px] sm:block" style={{ color: step >= s.n ? "var(--text-2)" : "var(--text-3)" }}>
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div
                  className="mb-5 h-0.5 w-14 transition-all"
                  style={{ background: step > s.n ? "#059669" : "rgba(142,161,199,0.15)" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STEP 1 — Template picker
        ══════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div>
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold" style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
                <Sparkles size={11} /> {c.introBadge}
              </div>
              <h1 className="mb-3 text-3xl font-black md:text-4xl" style={{ color: "var(--text)" }}>
                {c.title}
              </h1>
              <p className="mx-auto max-w-md text-sm leading-7" style={{ color: "var(--text-2)" }}>
                {c.body}
              </p>
              <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-[var(--text-2)]">
                <Sparkles size={12} /> {c.trialBadge}
              </div>
            </div>

            {/* Filter tabs */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {ALL_MODES.map(m => {
                const meta = MODE_META[m]
                return (
                  <button
                    key={m}
                    onClick={() => setFilter(m)}
                    className="rounded-2xl px-4 py-2 text-sm font-semibold transition-all"
                    style={{
                      background: filter === m ? `${meta.color}18` : "transparent",
                      border: `1px solid ${filter === m ? meta.color + "40" : "var(--border)"}`,
                      color: filter === m ? meta.color : "var(--text-3)",
                    }}
                  >
                    {meta.label}
                  </button>
                )
              })}
            </div>

            {/* Template grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map(t => {
                const isSelected = selectedId === t.id
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className="relative cursor-pointer rounded-[24px] p-5 transition-all hover:scale-[1.01]"
                    style={{
                      background: isSelected ? t.bg : "rgba(255,255,255,0.025)",
                      border: `2px solid ${isSelected ? t.border : "rgba(142,161,199,0.10)"}`,
                      boxShadow: isSelected ? `0 0 28px ${t.glow}` : "none",
                    }}
                  >
                    {/* Popular badge */}
                    {t.popular && (
                      <div
                        className="absolute -top-2.5 left-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: t.color }}
                      >
                        Popular
                      </div>
                    )}

                    {/* Check */}
                    {isSelected && (
                      <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full" style={{ background: t.color }}>
                        <Check size={12} color="#fff" strokeWidth={3} />
                      </div>
                    )}

                    {/* Mode badge */}
                    <div className="mb-3 flex items-center gap-1.5">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: `${MODE_META[t.mode].color}15`, color: MODE_META[t.mode].color }}
                      >
                        {MODE_META[t.mode].label}
                      </span>
                    </div>

                    <div className="mb-2 text-3xl">{t.emoji}</div>
                    <div className="mb-1 text-sm font-black" style={{ color: "var(--text)" }}>{t.name}</div>
                    <div className="mb-2 text-xs font-semibold" style={{ color: t.color }}>{t.tagline}</div>
                    <div className="mb-4 text-xs leading-5" style={{ color: "var(--text-3)" }}>{t.desc}</div>

                    {/* Features */}
                    <div className="mb-4 space-y-1.5">
                      {t.items.map(item => (
                        <div key={item} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-2)" }}>
                          <span style={{ color: t.color, flexShrink: 0 }}>✓</span> {item}
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div
                      className="flex items-center justify-between pt-3 text-[10px]"
                      style={{ borderTop: "1px solid rgba(142,161,199,0.1)", color: "var(--text-3)" }}
                    >
                      <span>⏱ {t.setupTime}</span>
                      <span
                        className="rounded px-1.5 py-0.5 font-semibold"
                        style={{ background: `${t.color}12`, color: t.color }}
                      >
                        Replaces {t.excelReplace}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={() => selectedId && setStep(2)}
                disabled={!selectedId}
                className="inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: selectedId ? (selected?.color ?? "var(--primary)") : "rgba(142,161,199,0.12)",
                  boxShadow: selectedId ? `0 12px 32px ${selected?.glow}` : "none",
                }}
              >
                {selectedId ? `ใช้ "${selected?.name}" →` : lang === "th" ? "เลือก setup ก่อน" : lang === "lo" ? "ເລືອກ setup ກ່ອນ" : "Choose a setup first"}
                {selectedId && <ArrowRight size={15} />}
              </button>
              <p className="mt-3 text-xs" style={{ color: "var(--text-3)" }}>
                {lang === "th"
                  ? "ภายหลังยังปรับ modules และ preferences เพิ่มได้ใน Settings รวมถึงเพิ่ม Business หรือ Merchant"
                  : lang === "lo"
                    ? "ພາຍຫຼັງທ່ານຍັງປັບ modules ແລະ preferences ໄດ້ໃນ Settings ຮວມທັງເພີ່ມ Business ຫຼື Merchant"
                    : "You can fine-tune modules and preferences later in Settings, including adding Business or Merchant."}
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 2 — ตั้งค่า
        ══════════════════════════════════════════════════════════════════ */}
        {step === 2 && selected && (
          <div className="mx-auto max-w-md">
            {/* Template summary card */}
            <div
              className="mb-6 rounded-[24px] p-5"
              style={{ background: selected.bg, border: `1px solid ${selected.border}` }}
            >
              <div className="flex items-center gap-3">
                <div className="text-4xl">{selected.emoji}</div>
                <div>
                  <div className="text-lg font-black" style={{ color: "var(--text)" }}>{selected.name}</div>
                  <div className="text-sm font-semibold" style={{ color: selected.color }}>{selected.tagline}</div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="ml-auto rounded-xl p-1.5 transition-opacity hover:opacity-60"
                  style={{ color: "var(--text-3)" }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {/* ชื่อ workspace */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                  {c.workspaceName}
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={
                    selected.mode === "business" ? "For example, Acme Co."
                    : "For example, Corner Cafe"
                  }
                  autoFocus
                  className="w-full rounded-2xl px-4 py-3.5 text-sm transition-all focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    fontFamily: "var(--font-sans)",
                  }}
                  onFocus={e => (e.target.style.borderColor = selected.color)}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* สกุลเงิน */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                  {c.currency}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => setCurrency(c.code)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
                      style={{
                        background: currency === c.code ? selected.bg : "transparent",
                        border: `1px solid ${currency === c.code ? selected.border : "var(--border)"}`,
                        color: currency === c.code ? selected.color : "var(--text-3)",
                      }}
                    >
                      <span>{c.flag}</span>
                      <span className="text-xs">{c.code}</span>
                      {currency === c.code && <Check size={11} style={{ marginLeft: "auto" }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* ข้อมูลที่จะ setup */}
              <div
                className="rounded-2xl p-4 text-sm"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)" }}
              >
                <div className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                  What will be set up for you
                </div>
                <div className="space-y-2">
                  {selected.items.map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-2)" }}>
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: `${selected.color}20` }}>
                        <Check size={9} style={{ color: selected.color }} />
                      </div>
                      {item}
                    </div>
                  ))}
                  {selected.seed.budgets && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-2)" }}>
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: `${selected.color}20` }}>
                        <Check size={9} style={{ color: selected.color }} />
                      </div>
                      Budget {selected.seed.budgets.length} categories (this month)
                    </div>
                  )}
                  {selected.seed.savingsGoals && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-2)" }}>
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: `${selected.color}20` }}>
                        <Check size={9} style={{ color: selected.color }} />
                      </div>
                      {selected.seed.savingsGoals.length} savings goals
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep(1)}
                  className="flex-none rounded-2xl px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ border: "1px solid var(--border)", color: "var(--text-3)" }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleApply}
                  disabled={!name.trim() || applying}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: selected.color,
                    boxShadow: name.trim() ? `0 8px 24px ${selected.glow}` : "none",
                  }}
                >
                  {applying ? <><Loader2 size={15} className="animate-spin" /> {c.applying}</> : <>{c.apply} <ArrowRight size={15} /></>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 3 — Done 🎉
        ══════════════════════════════════════════════════════════════════ */}
        {step === 3 && selected && (
          <div className="mx-auto max-w-md text-center">
            <div className="mb-5 text-6xl">🎉</div>
            <h2 className="mb-2 text-2xl font-black" style={{ color: "var(--text)" }}>
              {c.successTitle}
            </h2>
            <p className="mb-8 text-sm leading-7" style={{ color: "var(--text-2)" }}>
              <strong style={{ color: selected.color }}>{selected.name}</strong> is set up and ready.<br />Open your workspace and continue with daily work right away.
            </p>

            {/* What's ready */}
            <div
              className="mb-8 rounded-[24px] p-5 text-left"
              style={{ background: selected.bg, border: `1px solid ${selected.border}` }}
            >
              <div className="mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                Ready now
              </div>
              <div className="space-y-3">
                {[
                  ...selected.items,
                  ...(selected.seed.budgets ? [`Budget ${selected.seed.budgets.length} categories`] : []),
                  ...(selected.seed.savingsGoals ? [`${selected.seed.savingsGoals.length} savings goals`] : []),
                  `${c.currency} ${currency}`,
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{ background: `${selected.color}20` }}
                    >
                      <Check size={11} style={{ color: selected.color }} />
                    </div>
                    <span className="text-sm" style={{ color: "var(--text-2)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={goToDashboard}
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition-all"
              style={{
                background: selected.color,
                boxShadow: `0 12px 32px ${selected.glow}`,
              }}
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <>{c.openWorkspace} <ChevronRight size={16} /></>}
            </button>
            <p className="mt-4 text-xs" style={{ color: "var(--text-3)" }}>
              Import from spreadsheets later in Settings
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
