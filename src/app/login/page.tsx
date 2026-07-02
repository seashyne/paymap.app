import { Metadata } from "next"
import Link from "next/link"
import { Building2, Store, ArrowRight, HardDrive } from "lucide-react"
import LoginForm from "@/features/auth/components/LoginForm"
import { getCurrentSession } from "@/lib/session"
import { buildWorkspaceSelectPath, normalizeWorkspaceMode, resolvePostAuthPath } from "@/lib/workspace"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PublicShell from "@/shared/components/layout/PublicShell"
import { detectSiteLang, getSiteMessages } from "@/lib/i18n/site"

export const metadata: Metadata = { title: "PayMap" }

const MODES = [
  { key: "personal" as const, icon: HardDrive, label: "Local Dashboard", desc: "ข้อมูลอยู่ในเครื่องเป็นค่าเริ่มต้น", color: "#4f46e5", surface: "rgba(79,70,229,0.10)", border: "rgba(79,70,229,0.18)", action: "/register?mode=personal" },
  { key: "business" as const, icon: Building2, label: "Cloud Backup", desc: "สำรอง cloud แบบ optional", color: "#0f766e", surface: "rgba(15,118,110,0.10)", border: "rgba(15,118,110,0.18)", action: "/register?mode=personal&plan=cloud-backup" },
  { key: "merchant" as const, icon: Store, label: "Shop Cloud", desc: "ร้านค้าที่ต้องการ backup", color: "#b91c1c", surface: "rgba(185,28,28,0.10)", border: "rgba(185,28,28,0.18)", action: "/register?mode=merchant&plan=shop-cloud" },
]

export default async function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string; mode?: string; hint?: string } }) {
  const requestedMode = searchParams.mode ? normalizeWorkspaceMode(searchParams.mode) : null
  const selectedMode = requestedMode ?? "personal"
  const requestedNextPath = resolvePostAuthPath(selectedMode, searchParams.next)
  const session = await getCurrentSession()

  if (session) {
    try {
      const accounts = await prisma.user.findMany({ where: { email: session.email }, select: { accountMode: true } })
      const currentMode = normalizeWorkspaceMode(session.accountMode || session.workspaceMode)
      if (searchParams.mode && selectedMode !== currentMode) {
        const targetAccount = accounts.find((account) => account.accountMode === selectedMode)
        if (targetAccount) redirect(`/api/auth/switch-mode?mode=${selectedMode}&redirect=${encodeURIComponent(requestedNextPath)}`)
        redirect(`/register?mode=${selectedMode}${searchParams.next ? `&next=${encodeURIComponent(searchParams.next)}` : ""}`)
      }

      if (accounts.length <= 1) redirect(resolvePostAuthPath(currentMode, searchParams.next))
      redirect(buildWorkspaceSelectPath(searchParams.next))
    } catch (error) {
      console.error("LoginPage workspace lookup failed", error)
      redirect(requestedNextPath)
    }
  }

  const errorMsg =
    searchParams.error === "OAuthAccountNotLinked"
      ? "Email นี้เคยสมัครด้วยรหัสผ่าน กรุณาเข้าสู่ระบบแบบ Email/Password"
      : searchParams.error === "AccessDenied"
        ? "ไม่สามารถเข้าสู่ระบบได้"
        : null

  const lang = detectSiteLang()
  const t = getSiteMessages(lang).auth
  const modeDescriptions = { personal: t.personalDesc, business: t.businessDesc, merchant: t.merchantDesc }
  const isThai = lang === "th"
  const isLao = lang === "lo"
  const pageCopy = {
    introTitle: isThai ? "PayMap Local คือทางเข้าหลักของคุณ" : isLao ? "PayMap Local ແມ່ນທາງເຂົ້າຫຼັກຂອງທ່ານ" : "PayMap Local is your main entry point",
    introBody: isThai
      ? "เข้าสู่ระบบเพื่อเปิดแดชบอร์ดรายรับ รายจ่าย cash flow และกำไรจริง โดยข้อมูลอยู่ในเครื่องเป็นค่าเริ่มต้น"
      : isLao
        ? "ເຂົ້າລະບົບເພື່ອເປີດ dashboard ລາຍຮັບ ລາຍຈ່າຍ cash flow ແລະກໍາໄລຈິງ ໂດຍຂໍ້ມູນຢູ່ໃນອຸປະກອນເປັນຄ່າເລີ່ມຕົ້ນ"
        : "Sign in to open your income, expense, cash flow, and real profit dashboard. Your financial data stays on this device by default.",
    formTitle: isThai ? "เข้าสู่ระบบบัญชี PayMap" : isLao ? "ເຂົ້າລະບົບບັນຊີ PayMap" : "Log in to your PayMap account",
    formBody: isThai
      ? "ใช้การล็อกอินครั้งเดียวเพื่อเปิด Local Dashboard และจัดการ Cloud Backup เมื่อคุณเปิดเอง"
      : isLao
        ? "ໃຊ້ການ login ຄັ້ງດຽວເພື່ອເປີດ Local Dashboard ແລະຈັດການ Cloud Backup ເມື່ອທ່ານເປີດເອງ"
        : "Use one login to open your Local Dashboard and manage Cloud Backup only when you enable it.",
  }

  return (
    <PublicShell eyebrow={t.loginEyebrow} title={t.loginTitle} description={t.loginDescription} compact>
      <div className="public-auth-grid-v72 local-register-grid-v72">
        <section className="public-panel-v72 public-panel-v72-soft">
          <div className="public-section-label">{t.modeLabel}</div>
          <h2 className="public-panel-title">{pageCopy.introTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">
            {pageCopy.introBody}
          </p>
          <div className="mt-6 space-y-3">
            {MODES.map(({ key, icon: Icon, label, color, surface, border, action }) => {
              const isActive = key === selectedMode
              const loginHref = `/login?mode=${key}${searchParams.next ? `&next=${encodeURIComponent(searchParams.next)}` : ""}`
              return (
                <div
                  key={key}
                  className="public-mode-card-v72"
                  style={{ borderColor: border, background: surface }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="public-mode-icon-v72" style={{ color, background: surface, borderColor: border }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="font-black" style={{ color }}>{label}</div>
                        <div className="mt-1 text-sm text-[var(--text-3)]">{modeDescriptions[key]}</div>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color }}>
                        selected <ArrowRight size={12} />
                      </span>
                    ) : (
                      <Link href={loginHref} className="inline-flex items-center gap-1 text-xs font-bold" style={{ color }}>
                        choose <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                  {!isActive ? (
                    <div className="mt-3 flex justify-end">
                      <Link href={action} className="text-xs font-semibold" style={{ color }}>
                        Create {label} workspace
                      </Link>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </section>

        <section className="public-panel-v72 local-register-form-v72">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold" style={{ borderColor: "rgba(79,70,229,0.18)", color: "var(--primary)", background: "rgba(79,70,229,0.10)" }}>
            <HardDrive size={12} /> Local-first account
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.02em]">{pageCopy.formTitle}</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-2)]">{pageCopy.formBody}</p>

          {errorMsg ? <div className="public-inline-alert-v72 mt-4 border-rose-300/40 bg-rose-50 text-rose-700"><span>{errorMsg}</span></div> : null}

          <div className="mt-6 local-register-form-card-v72">
            <LoginForm selectedMode={selectedMode} nextPath={requestedNextPath} lang={lang} />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--text-3)]">
            <Link href="/forgot-password" className="hover:text-[var(--text)] hover:underline">{t.forgot}</Link>
            <Link href={`/register?mode=${selectedMode}${searchParams.next ? `&next=${encodeURIComponent(searchParams.next)}` : ""}`} className="font-semibold text-[var(--primary)]">{t.create}</Link>
          </div>
        </section>
      </div>
    </PublicShell>
  )
}
