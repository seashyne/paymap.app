import Link from "next/link"
import { ArrowRight, Check, Cloud, Gift, HardDrive, RefreshCw, Store } from "lucide-react"
import { getCurrentSession } from "@/lib/session"
import PublicShell from "@/components/public/PublicShell"
import { detectSiteLang } from "@/lib/i18n/site"

const plans = [
  {
    key: "free-local",
    name: "Free Local",
    price: "Free",
    icon: HardDrive,
    color: "#059669",
    description: "Private money dashboard on this device. Export/import .paymap.json anytime.",
    features: ["Income and expense tracking", "Cash flow dashboard", "Real profit view", "Local-only storage by default", ".paymap.json export/import"],
  },
  {
    key: "cloud-backup",
    name: "Cloud Backup",
    price: "฿99/mo",
    icon: Cloud,
    color: "#4f46e5",
    description: "Optional encrypted backup for people who want a cloud copy.",
    features: ["Everything in Free Local", "Manual cloud backup", "Last Backup status", "Restore from cloud copy", "Explicit upload confirmation"],
    highlight: true,
  },
  {
    key: "cloud-sync",
    name: "Cloud Sync",
    price: "฿199/mo",
    icon: RefreshCw,
    color: "#2563eb",
    description: "Optional sync across your own devices after Cloud Backup is enabled.",
    features: ["Everything in Cloud Backup", "Multi-device sync", "Conflict review", "Sync status badges", "Cloud data delete controls"],
  },
  {
    key: "shop-cloud",
    name: "Shop Cloud",
    price: "฿299/mo",
    icon: Store,
    color: "#dc2626",
    description: "For shops that need local-first sales records plus optional cloud backup.",
    features: ["Local-first shop dashboard", "Sales and cash flow backup", "Inventory backup", "Optional cloud restore", "No cloud upload by default"],
  },
  {
    key: "supporter",
    name: "Supporter / Donation",
    price: "Pay what you want",
    icon: Gift,
    color: "#d97706",
    description: "Support local-first money tools without enabling cloud features.",
    features: ["Support development", "No cloud required", "Same privacy-first defaults", "Community priority notes", "Thank-you badge"],
  },
]

export default async function LocalFirstPricingPage() {
  const session = await getCurrentSession()
  const isLoggedIn = !!session
  const lang = detectSiteLang()
  const isThai = lang === "th"

  return (
    <PublicShell
      eyebrow={isThai ? "ราคา" : "Pricing"}
      title={isThai ? "เลือกจ่ายเฉพาะ cloud ที่คุณต้องการ" : "Pay only for the cloud features you choose."}
      description={
        isThai
          ? "PayMap ใช้งานแบบ Local Only ได้ฟรี ข้อมูลการเงินอยู่ในเครื่องเป็นค่าเริ่มต้น Cloud Backup และ Cloud Sync เป็นฟีเจอร์เสริมที่ต้องเปิดเอง"
          : "PayMap is free for Local Only use. Your financial data stays on your device by default. Cloud Backup and Cloud Sync are optional paid features."
      }
      ctaHref={isLoggedIn ? "/settings?tab=data" : "/register?mode=personal"}
      ctaLabel={isLoggedIn ? "Privacy & Data" : isThai ? "เริ่ม Local Only" : "Start Local Only"}
    >
      <div className="space-y-8">
        <section className="grid gap-4 lg:grid-cols-3">
          {[
            ["Default", "Local Only", "No financial data upload unless you enable Cloud Backup."],
            ["Backup", "Optional", "Export .paymap.json anytime. Cloud backup requires explicit confirmation."],
            ["Control", "Delete paths", "Delete local data and clear cloud backup status from Privacy & Data settings."],
          ].map(([label, title, body]) => (
            <div key={label} className="public-panel-v72">
              <div className="public-section-label">{label}</div>
              <h2 className="mt-2 text-2xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">{body}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-5">
          {plans.map((plan) => {
            const Icon = plan.icon
            const href = isLoggedIn ? `/billing?product=${plan.key}` : `/register?mode=personal&plan=${plan.key}`
            return (
              <div key={plan.key} className={`public-price-card-v72 ${plan.highlight ? "is-highlight" : ""}`} style={{ borderColor: plan.highlight ? `${plan.color}55` : undefined }}>
                {plan.highlight ? <div className="public-price-badge-v72" style={{ background: plan.color }}>Optional</div> : null}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${plan.color}16`, color: plan.color }}>
                  <Icon size={20} />
                </div>
                <div className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">{plan.name}</div>
                <div className="mt-3 text-3xl font-black">{plan.price}</div>
                <p className="mt-4 text-sm leading-7 text-[var(--text-2)]">{plan.description}</p>
                <div className="mt-5 space-y-2 text-sm text-[var(--text-2)]">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check size={14} className="mt-1 shrink-0" style={{ color: plan.color }} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href={href} className="public-btn public-btn-primary mt-6 inline-flex w-full items-center justify-center gap-2" style={{ background: plan.color }}>
                  {plan.key === "free-local" ? "Start free" : "Choose plan"} <ArrowRight size={14} />
                </Link>
              </div>
            )
          })}
        </section>
      </div>
    </PublicShell>
  )
}
