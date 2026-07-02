import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CloudOff, Download, HardDrive, Lock, Monitor, ShieldCheck, Sparkles } from "lucide-react"
import LoginForm from "@/features/auth/components/LoginForm"
import { LogoFull } from "@/components/ui/Logo"
import { getCurrentSession } from "@/lib/session"
import { buildWorkspaceSelectPath, normalizeWorkspaceMode, resolvePostAuthPath } from "@/lib/workspace"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { detectSiteLang, getSiteMessages } from "@/lib/i18n/site"

export const metadata: Metadata = { title: "Log in - PayMap" }

function getLoginCopy(lang: string) {
  if (lang === "th") {
    return {
      badge: "Local-first account",
      title: "เข้าสู่ระบบ PayMap",
      subtitle: "เปิดแดชบอร์ดรายรับ รายจ่าย กระแสเงินสด และกำไรจริงของคุณ",
      desktopLine: "ใช้ PayMap บนเว็บได้ แต่ประสบการณ์ที่ดีที่สุดคือแอป Windows ที่ข้อมูลอยู่กับคุณ",
      localOnly: "Local Only",
      backupOff: "Cloud Backup Off",
      windowsReady: "Windows app ready",
      pricing: "ราคา",
      secureTitle: "ข้อมูลอยู่ในเครื่องเป็นค่าเริ่มต้น",
      secureBody: "PayMap จะไม่อัปโหลดข้อมูลการเงินของคุณ เว้นแต่คุณเปิด Cloud Backup เอง",
      backupTitle: "สำรองข้อมูลได้เมื่อพร้อม",
      backupBody: "Export/Import ไฟล์ .paymap.json หรือเปิด Cloud Backup ภายหลังได้",
      formTitle: "ยินดีต้อนรับกลับ",
      formBody: "เข้าสู่ระบบเพื่อกลับไปยัง private money dashboard ของคุณ",
      download: "ดาวน์โหลด Windows",
      web: "ลองบนเว็บ",
    }
  }

  if (lang === "lo") {
    return {
      badge: "Local-first account",
      title: "ເຂົ້າລະບົບ PayMap",
      subtitle: "ເປີດ dashboard ລາຍຮັບ ລາຍຈ່າຍ cash flow ແລະກໍາໄລຈິງຂອງທ່ານ",
      desktopLine: "ໃຊ້ PayMap ເທິງເວັບໄດ້ ແຕ່ປະສົບການທີ່ດີທີ່ສຸດແມ່ນແອັບ Windows ທີ່ຂໍ້ມູນຢູ່ກັບທ່ານ",
      localOnly: "Local Only",
      backupOff: "Cloud Backup Off",
      windowsReady: "Windows app ready",
      pricing: "ລາຄາ",
      secureTitle: "ຂໍ້ມູນຢູ່ໃນເຄື່ອງເປັນຄ່າເລີ່ມຕົ້ນ",
      secureBody: "PayMap ຈະບໍ່ upload ຂໍ້ມູນການເງິນ ເວັ້ນແຕ່ທ່ານເປີດ Cloud Backup ເອງ",
      backupTitle: "Backup ໄດ້ເມື່ອພ້ອມ",
      backupBody: "Export/Import ໄຟລ໌ .paymap.json ຫຼືເປີດ Cloud Backup ພາຍຫຼັງໄດ້",
      formTitle: "ຍິນດີຕ້ອນຮັບກັບມາ",
      formBody: "ເຂົ້າລະບົບເພື່ອກັບໄປຫາ private money dashboard ຂອງທ່ານ",
      download: "ດາວໂຫຼດ Windows",
      web: "ລອງໃນເວັບ",
    }
  }

  return {
    badge: "Local-first account",
    title: "Log in to PayMap",
    subtitle: "Open your income, expense, cash flow, and real profit dashboard.",
    desktopLine: "PayMap works on the web, but the best experience is the Windows app where your data stays with you.",
    localOnly: "Local Only",
    backupOff: "Cloud Backup Off",
    windowsReady: "Windows app ready",
    pricing: "Pricing",
    secureTitle: "Your data stays local by default",
    secureBody: "PayMap does not upload your financial data unless you explicitly enable Cloud Backup.",
    backupTitle: "Backup when you are ready",
    backupBody: "Export/import .paymap.json backups or turn on Cloud Backup later.",
    formTitle: "Welcome back",
    formBody: "Sign in to return to your private money dashboard.",
    download: "Download Windows",
    web: "Try on web",
  }
}

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
  const pageCopy = getLoginCopy(lang)

  return (
    <div className="paymap-login-shell">
      <header className="paymap-login-topbar">
        <Link href="/" className="paymap-login-brand" aria-label="PayMap home">
          <LogoFull height={32} />
        </Link>
        <nav className="paymap-login-nav" aria-label="PayMap">
          <Link href="/pricing">{pageCopy.pricing}</Link>
          <Link href="/desktop">{pageCopy.download}</Link>
          <Link href="/register?mode=personal" className="paymap-login-nav-primary">
            {pageCopy.web}
          </Link>
        </nav>
      </header>

      <main className="paymap-login-main">
        <section className="paymap-login-copy-panel">
          <div className="paymap-login-kicker">
            <HardDrive size={15} />
            {pageCopy.badge}
          </div>
          <h1>{pageCopy.title}</h1>
          <p className="paymap-login-subtitle">{pageCopy.subtitle}</p>

          <div className="paymap-login-status-row" aria-label="Storage status">
            <span><ShieldCheck size={14} />{pageCopy.localOnly}</span>
            <span><CloudOff size={14} />{pageCopy.backupOff}</span>
            <span><Monitor size={14} />{pageCopy.windowsReady}</span>
          </div>

          <p className="paymap-login-desktop-line">{pageCopy.desktopLine}</p>

          <div className="paymap-login-feature-grid">
            <div className="paymap-login-feature">
              <div><Lock size={18} /></div>
              <strong>{pageCopy.secureTitle}</strong>
              <p>{pageCopy.secureBody}</p>
            </div>
            <div className="paymap-login-feature">
              <div><Download size={18} /></div>
              <strong>{pageCopy.backupTitle}</strong>
              <p>{pageCopy.backupBody}</p>
            </div>
          </div>
        </section>

        <section className="paymap-login-form-panel" aria-label={pageCopy.formTitle}>
          <div className="paymap-login-form-heading">
            <span><Sparkles size={14} /> PayMap Local</span>
            <h2>{pageCopy.formTitle}</h2>
            <p>{pageCopy.formBody}</p>
          </div>

          {errorMsg ? <div className="public-inline-alert-v72 border-rose-300/40 bg-rose-50 text-rose-700"><span>{errorMsg}</span></div> : null}

          <LoginForm selectedMode={selectedMode} nextPath={requestedNextPath} lang={lang} />

          <div className="paymap-login-links">
            <Link href="/forgot-password">{t.forgot}</Link>
            <Link href={`/register?mode=${selectedMode}${searchParams.next ? `&next=${encodeURIComponent(searchParams.next)}` : ""}`}>
              {t.create} <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
