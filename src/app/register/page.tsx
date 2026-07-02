import { Metadata } from "next"
import Link from "next/link"
import { Building2, Store, ArrowRight } from "lucide-react"
import RegisterForm from "@/features/auth/components/RegisterForm"
import { getCurrentSession } from "@/lib/session"
import { normalizeWorkspaceMode, resolvePostAuthPath } from "@/lib/workspace"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PublicShell from "@/shared/components/layout/PublicShell"
import { detectSiteLang, getSiteMessages } from "@/lib/i18n/site"
import LocalFirstRegisterPage from "@/components/local-first/LocalFirstRegisterPage"

export const metadata: Metadata = { title: "PayMap" }

const MODE_INFO = {
  business: {
    icon: Building2,
    label: "ERP Lite",
    tagline: "invoice, stock, cashflow และรายงานสำหรับ SME",
    color: "#0f766e",
    surface: "rgba(15,118,110,0.10)",
    border: "rgba(15,118,110,0.18)",
    features: ["Overview", "Payroll", "Approvals"],
  },
  merchant: {
    icon: Store,
    label: "Store POS",
    tagline: "POS, stock, VAT และยอดขายหน้าร้าน",
    color: "#b91c1c",
    surface: "rgba(185,28,28,0.10)",
    border: "rgba(185,28,28,0.18)",
    features: ["POS", "Inventory", "Sales"],
  },
}

async function LegacyRegisterPage({ searchParams }: { searchParams: { mode?: string; next?: string } }) {
  const requestedMode = searchParams.mode ? normalizeWorkspaceMode(searchParams.mode) : "business"
  const selectedMode: keyof typeof MODE_INFO = requestedMode === "merchant" ? "merchant" : "business"
  const session = await getCurrentSession()
  const nextPath = resolvePostAuthPath(selectedMode, searchParams.next)

  if (session) {
    try {
      const targetAccount = await prisma.user.findFirst({ where: { email: session.email, accountMode: selectedMode }, select: { id: true } })
      if (targetAccount) redirect(nextPath)
    } catch (error) {
      console.error("RegisterPage workspace lookup failed", error)
      redirect(nextPath)
    }
  }

  const lang = detectSiteLang()
  const t = getSiteMessages(lang).auth

  return (
    <PublicShell eyebrow={t.registerEyebrow} title={t.registerTitle} description={t.registerDescription} compact>
      <div className="public-auth-grid-v72">
        <section className="public-panel-v72 public-panel-v72-soft">
          <div className="public-section-label">{selectedMode ? t.selectedMode : t.modeLabel}</div>
          <h2 className="public-panel-title">Create PayMap ERP Lite</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">
            เริ่มจากระบบสำหรับร้านค้าและ SME โดยตรง: invoice, stock, sales, cashflow และรายงาน ไม่ต้องเริ่มจาก Personal ก่อน
          </p>

          <div className="mt-6 space-y-3">
            {Object.entries(MODE_INFO).map(([key, value]) => {
              const Icon = value.icon
              const isActive = selectedMode === key
              return (
                <div key={key} className="public-mode-card-v72" style={{ borderColor: value.border, background: value.surface }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="public-mode-icon-v72" style={{ color: value.color, background: value.surface, borderColor: value.border }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="font-black" style={{ color: value.color }}>{value.label}</div>
                        <div className="mt-1 text-sm text-[var(--text-3)]">{t.taglines[key as keyof typeof t.taglines]}</div>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="text-xs font-bold" style={{ color: value.color }}>Selected</span>
                    ) : (
                      <Link
                        href={key === "business" ? "/for-business" : "/for-merchants"}
                        className="inline-flex items-center gap-1 text-xs font-bold"
                        style={{ color: value.color }}
                      >
                        {key === "business" ? "ERP lite" : "store setup"} <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="public-note-v72 mt-6">
            {t.alreadyHave} <Link href={`/login${searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : ""}`} className="font-bold text-[var(--primary)] hover:underline">{t.login}</Link>
          </div>
        </section>

        <section className="public-panel-v72">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold" style={{ borderColor: "rgba(79,70,229,0.18)", color: "var(--primary)", background: "rgba(79,70,229,0.10)" }}>
            <Building2 size={12} /> {t.signupMode.replace("{label}", MODE_INFO[selectedMode].label)}
          </div>
          <h2 className="mt-5 text-3xl font-black">{t.registerHeading}</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-2)]">
            หลังสมัครเสร็จ คุณจะเข้า setup แบบ ERP Lite ทันที เพื่อเลือกว่าจะเริ่มจาก invoice/บัญชีธุรกิจ หรือ POS/stock หน้าร้าน
          </p>

          <div className="mt-6 rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)]">
            <RegisterForm selectedMode={selectedMode ?? undefined} prefilledEmail={session?.email || undefined} nextPath={nextPath} lang={lang} />
          </div>
        </section>
      </div>
    </PublicShell>
  )
}

export default LocalFirstRegisterPage
