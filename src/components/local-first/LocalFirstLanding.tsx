import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Cloud, Download, FileJson, HardDrive, Lock, ShieldCheck, Upload, Wallet, WifiOff } from "lucide-react"
import { LogoFull } from "@/components/ui/Logo"
import { getCurrentSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { mergeUiPreferences, getModeAwareDefaultPageHref } from "@/lib/ui-preferences"
import { detectSiteLang, type SiteLang } from "@/lib/i18n/site"

function getLandingCopy(lang: SiteLang) {
  const isThai = lang === "th"
  return {
    nav: {
      privacy: isThai ? "ความเป็นส่วนตัว" : "Privacy",
      backup: isThai ? "สำรองข้อมูล" : "Backup",
      pricing: isThai ? "ราคา" : "Pricing",
      login: isThai ? "เข้าสู่ระบบ" : "Log in",
      start: isThai ? "เริ่มแบบ Local Only" : "Start Local Only",
    },
    hero: {
      badge: isThai ? "Web + Windows app · Local-first" : "Web + Windows app · Local-first",
      title: isThai ? "แดชบอร์ดการเงินส่วนตัวที่ข้อมูลอยู่กับคุณ" : "Your private money dashboard.",
      body: isThai
        ? "ใช้ PayMap บนเว็บได้ แต่ประสบการณ์ที่ดีที่สุดคือแอป Windows ที่ข้อมูลอยู่กับคุณ ติดตามรายรับ รายจ่าย กระแสเงินสด และกำไรจริง โดย Cloud Backup เป็นตัวเลือก"
        : "Use PayMap on the web, but the best experience is the Windows app where your data stays with you. Track income, expenses, cash flow, and real profit with optional Cloud Backup.",
      primary: isThai ? "ดาวน์โหลดแอป Windows" : "Download Windows app",
      secondary: isThai ? "ลองบนเว็บก่อน" : "Try on the web first",
      note: isThai
        ? "PayMap จะไม่อัปโหลดข้อมูลการเงินของคุณ เว้นแต่คุณเปิด Cloud Backup เอง"
        : "PayMap does not upload your financial data unless you enable Cloud Backup.",
    },
    preview: {
      title: isThai ? "สถานะข้อมูล" : "Data status",
      localOnly: "Local Only",
      cloudOff: "Cloud Backup Off",
      lastBackup: "Last Backup: Never",
      cashFlow: isThai ? "กระแสเงินสด" : "Cash flow",
      realProfit: isThai ? "กำไรจริง" : "Real profit",
      month: isThai ? "เดือนนี้" : "This month",
    },
    sections: [
      {
        icon: HardDrive,
        title: isThai ? "ข้อมูลอยู่ในเครื่องเป็นค่าเริ่มต้น" : "Local by default",
        body: isThai ? "รายรับ รายจ่าย หมวดหมู่ และ backup local ถูกออกแบบให้เก็บในเครื่องก่อน" : "Income, expenses, categories, and local backups are designed to stay on your device first.",
      },
      {
        icon: FileJson,
        title: isThai ? "Export/Import เป็น .paymap.json" : "Portable .paymap.json backups",
        body: isThai ? "ส่งออกไฟล์สำรอง อ่านกลับ และย้ายเครื่องได้โดยไม่ต้องเปิด cloud" : "Export, import, and move your money data without turning cloud features on.",
      },
      {
        icon: Cloud,
        title: isThai ? "Cloud Backup เป็นตัวเลือก" : "Cloud Backup is optional",
        body: isThai ? "ต้องเปิดเองและยืนยันก่อนอัปโหลดข้อมูลการเงิน" : "It is off by default and requires explicit confirmation before financial data uploads.",
      },
      {
        icon: WifiOff,
        title: isThai ? "ติดตั้งเป็น PWA" : "Installable PWA",
        body: isThai ? "เปิดจาก home screen ได้ และมีหน้า fallback เมื่อ network หาย" : "Install PayMap from your browser and keep a cached offline fallback for interrupted connections.",
      },
    ],
    flow: {
      title: isThai ? "เริ่มจากสิ่งที่สำคัญกับเงินของคุณ" : "Start with the money picture that matters.",
      body: isThai ? "PayMap โฟกัส dashboard ที่ตอบคำถามง่าย ๆ: เงินเข้าเท่าไร เงินออกเท่าไร เหลือจริงเท่าไร และกำไรจริงคืออะไร" : "PayMap focuses on simple questions: what came in, what went out, what is left, and what your real profit is.",
      steps: isThai
        ? ["เลือกใช้เพื่ออะไร", "เลือก Local Only เป็นค่าเริ่มต้น", "นำเข้าหรือบันทึกรายการ", "Export .paymap.json เมื่ออยากสำรอง"]
        : ["Choose your use case", "Keep Local Only by default", "Import or enter money records", "Export .paymap.json when you want a backup"],
    },
  }
}

export default async function LocalFirstLanding() {
  const session = await getCurrentSession()
  if (session?.sub) {
    try {
      const currentUser = await prisma.user.findUnique({ where: { id: session.sub }, select: { uiPreferences: true } })
      const prefs = mergeUiPreferences(currentUser?.uiPreferences)
      redirect(getModeAwareDefaultPageHref(prefs.defaultPage, session.accountMode))
    } catch (error) {
      console.error("HomePage redirect fallback: failed to load user preferences", error)
      const fallbackMode = session.accountMode ?? "personal"
      redirect(fallbackMode === "business" ? "/business" : fallbackMode === "merchant" ? "/merchant" : "/dashboard")
    }
  }

  const copy = getLandingCopy(detectSiteLang())

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#111827]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <LogoFull height={28} className="text-[#111827]" />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#privacy">{copy.nav.privacy}</a>
            <a href="#backup">{copy.nav.backup}</a>
            <Link href="/pricing">{copy.nav.pricing}</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-600 sm:inline-flex">{copy.nav.login}</Link>
            <Link href="/register?mode=personal" className="rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-bold text-white">{copy.nav.start}</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1fr_.9fr] lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-600">
              <ShieldCheck size={14} /> {copy.hero.badge}
            </div>
            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.02] tracking-[-0.05em] text-[#111827] md:text-7xl">
              {copy.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{copy.hero.body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/download" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111827] px-7 py-4 text-base font-black text-white">
                {copy.hero.primary} <ArrowRight size={18} />
              </Link>
              <Link href="/desktop" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-4 text-base font-black text-[#111827]">
                {copy.hero.secondary}
              </Link>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500"><Lock size={15} /> {copy.hero.note}</p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,.10)]">
            <div className="rounded-[22px] bg-[#111827] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{copy.preview.title}</div>
                  <div className="mt-2 text-2xl font-black">PayMap Local</div>
                </div>
                <Wallet size={28} />
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {[copy.preview.localOnly, copy.preview.cloudOff, copy.preview.lastBackup].map((label) => (
                  <span key={label} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">{label}</span>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                [copy.preview.cashFlow, "+฿18,450", "#059669"],
                [copy.preview.realProfit, "฿42,180", "#4f46e5"],
                [copy.preview.month, "128 records", "#d97706"],
                ["Cloud", "Off", "#64748b"],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</div>
                  <div className="mt-3 text-3xl font-black" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="privacy" className="border-y border-slate-200 bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-2 lg:grid-cols-4">
            {copy.sections.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#111827]"><Icon size={20} /></div>
                <h2 className="mt-5 text-lg font-black text-[#111827]">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="backup" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.18em] text-[#4f46e5]">Local-first flow</div>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">{copy.flow.title}</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">{copy.flow.body}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.flow.steps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Step {index + 1}</div>
                <div className="mt-3 flex items-center gap-3 text-lg font-black">
                  {index === 0 ? <Wallet size={20} /> : index === 1 ? <HardDrive size={20} /> : index === 2 ? <Upload size={20} /> : <Download size={20} />}
                  {step}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
