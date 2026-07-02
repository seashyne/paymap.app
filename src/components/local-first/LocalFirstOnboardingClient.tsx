"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, Cloud, HardDrive, Loader2, PiggyBank, Receipt, Store, Wallet } from "lucide-react"
import type { SiteLang } from "@/lib/i18n/site"

const useCases = [
  { key: "personal", icon: Wallet, title: "Personal money", body: "Track daily income, expenses, cash flow, and what is really left." },
  { key: "freelance", icon: Receipt, title: "Freelance profit", body: "Separate client income, work expenses, tax set-aside, and real profit." },
  { key: "savings", icon: PiggyBank, title: "Saving goals", body: "Plan spending and see whether your cash flow supports your goals." },
  { key: "shop", icon: Store, title: "Small shop", body: "Track simple sales, costs, cash flow, and backup status without cloud by default." },
] as const

export default function LocalFirstOnboardingClient({ lang }: { lang: SiteLang }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [useCase, setUseCase] = useState<(typeof useCases)[number]["key"]>("personal")
  const [storage, setStorage] = useState<"local" | "cloud-backup">("local")
  const isThai = lang === "th"

  function finish() {
    localStorage.setItem("paymap-onboarding-v2", JSON.stringify({
      useCase,
      storage,
      cloudBackupEnabled: storage === "cloud-backup",
      completedAt: new Date().toISOString(),
    }))
    startTransition(() => {
      router.push("/dashboard")
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-5 py-8 text-[var(--text)]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="text-sm font-black">PayMap</div>
          <button onClick={finish} className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--text-3)]">{isThai ? "ข้าม" : "Skip"}</button>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-4 py-1.5 text-xs font-bold text-[var(--primary)]">
            <HardDrive size={13} /> Local Only by default
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-[-0.04em] md:text-5xl">
            {isThai ? "ตั้งค่าแดชบอร์ดการเงินส่วนตัวของคุณ" : "Set up your private money dashboard."}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--text-2)]">
            {isThai
              ? "เลือกก่อนว่าคุณใช้ PayMap เพื่ออะไร และจะเก็บข้อมูลไว้ที่ไหน ค่าเริ่มต้นคือ Local Only"
              : "Choose what you use PayMap for and where your data should live. Local Only is the default."}
          </p>
        </div>

        <section className="mt-10">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">{isThai ? "ใช้ PayMap เพื่ออะไร" : "What do you use PayMap for?"}</div>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {useCases.map((item) => {
              const Icon = item.icon
              const active = useCase === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setUseCase(item.key)}
                  className="rounded-2xl p-5 text-left transition"
                  style={{ background: active ? "var(--primary-soft)" : "var(--card)", border: `1px solid ${active ? "var(--primary)" : "var(--border)"}` }}
                >
                  <div className="flex items-center justify-between">
                    <Icon size={20} style={{ color: active ? "var(--primary)" : "var(--text-3)" }} />
                    {active ? <Check size={16} style={{ color: "var(--primary)" }} /> : null}
                  </div>
                  <div className="mt-4 text-sm font-black">{item.title}</div>
                  <div className="mt-2 text-xs leading-6 text-[var(--text-3)]">{item.body}</div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-8">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">{isThai ? "จะเก็บข้อมูลไว้ที่ไหน" : "Where should your data live?"}</div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              { key: "local" as const, icon: HardDrive, title: "Local Only", body: isThai ? "ข้อมูลการเงินอยู่ในเครื่องเป็นค่าเริ่มต้น Export .paymap.json ได้ทุกเมื่อ" : "Financial data stays on this device by default. Export .paymap.json anytime." },
              { key: "cloud-backup" as const, icon: Cloud, title: "Cloud Backup", body: isThai ? "ตัวเลือกเสริมแบบเสียเงิน ต้องยืนยันก่อนอัปโหลดข้อมูลการเงิน" : "Optional paid backup. Requires explicit confirmation before uploading financial data." },
            ].map((item) => {
              const Icon = item.icon
              const active = storage === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setStorage(item.key)}
                  className="rounded-2xl p-6 text-left"
                  style={{ background: active ? "var(--primary-soft)" : "var(--card)", border: `1px solid ${active ? "var(--primary)" : "var(--border)"}` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-lg font-black"><Icon size={20} /> {item.title}</div>
                    {active ? <Check size={18} style={{ color: "var(--primary)" }} /> : null}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">{item.body}</p>
                </button>
              )
            })}
          </div>
        </section>

        <div className="mt-10 flex justify-center">
          <button onClick={finish} disabled={isPending} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-8 py-4 text-sm font-black text-white disabled:opacity-60">
            {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
            {isThai ? "เปิดแดชบอร์ด" : "Open dashboard"} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
