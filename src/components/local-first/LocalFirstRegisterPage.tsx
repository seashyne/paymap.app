import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, Cloud, FileJson, HardDrive, ShieldCheck } from "lucide-react"
import RegisterForm from "@/features/auth/components/RegisterForm"
import { getCurrentSession } from "@/lib/session"
import { resolvePostAuthPath } from "@/lib/workspace"
import PublicShell from "@/shared/components/layout/PublicShell"
import { detectSiteLang, getSiteMessages } from "@/lib/i18n/site"

export default async function LocalFirstRegisterPage({ searchParams }: { searchParams: { next?: string } }) {
  const session = await getCurrentSession()
  const lang = detectSiteLang()
  const t = getSiteMessages(lang).auth
  const nextPath = resolvePostAuthPath("personal", searchParams.next)

  if (session) redirect(nextPath)

  return (
    <PublicShell
      eyebrow={t.registerEyebrow}
      title={lang === "th" ? "เริ่ม PayMap แบบ Local Only" : "Start PayMap Local Only"}
      description={
        lang === "th"
          ? "สร้างบัญชีเพื่อเปิดแดชบอร์ดการเงินส่วนตัว ข้อมูลการเงินอยู่ในเครื่องเป็นค่าเริ่มต้น และ Cloud Backup เป็นตัวเลือกที่ต้องเปิดเอง"
          : "Create your private money dashboard. Financial data stays on your device by default, and Cloud Backup is optional."
      }
      compact
    >
      <div className="public-auth-grid-v72 local-register-grid-v72">
        <section className="public-panel-v72 public-panel-v72-soft">
          <div className="public-section-label">Local-first defaults</div>
          <h2 className="public-panel-title">Your private money dashboard</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">
            Track income, expenses, cash flow, and real profit. PayMap will not upload financial data unless you explicitly enable Cloud Backup.
          </p>
          <div className="mt-6 space-y-3">
            {[
              { icon: HardDrive, title: "Local Only", body: "Financial records stay on this device by default." },
              { icon: FileJson, title: ".paymap.json backup", body: "Export and import your own portable backup file." },
              { icon: Cloud, title: "Cloud Backup Off", body: "Optional paid backup stays off until you turn it on." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="public-mode-card-v72">
                <div className="flex items-start gap-3">
                  <div className="public-mode-icon-v72"><Icon size={18} /></div>
                  <div>
                    <div className="font-black">{title}</div>
                    <div className="mt-1 text-sm text-[var(--text-3)]">{body}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="public-note-v72 mt-6">
            {t.alreadyHave} <Link href={`/login${searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : ""}`} className="font-bold text-[var(--primary)] hover:underline">{t.login}</Link>
          </div>
        </section>

        <section className="public-panel-v72 local-register-form-v72">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold" style={{ borderColor: "rgba(79,70,229,0.18)", color: "var(--primary)", background: "rgba(79,70,229,0.10)" }}>
            <ShieldCheck size={12} /> Local Only
          </div>
          <h2 className="mt-5 text-3xl font-black">{t.registerHeading}</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-2)]">
            After signup, PayMap will ask what you track and where you want data stored. Local Only is selected by default.
          </p>
          <div className="mt-6 local-register-form-card-v72">
            <RegisterForm selectedMode="personal" nextPath={nextPath} lang={lang} />
          </div>
          <div className="mt-4 text-xs font-semibold text-[var(--text-3)]">
            Cloud Backup is optional and can be enabled later in Privacy & Data settings. <ArrowRight size={12} className="inline" />
          </div>
        </section>
      </div>
    </PublicShell>
  )
}
