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
      secondary: isThai ? "ดูตัวอย่างบนเว็บ" : "Preview in browser",
      note: isThai
        ? "PayMap จะไม่อัปโหลดข้อมูลการเงินของคุณ เว้นแต่คุณเปิด Cloud Backup เอง"
        : "PayMap does not upload your financial data unless you enable Cloud Backup.",
    },
    preview: {
      title: isThai ? "สถานะข้อมูล" : "Data status",
      localOnly: "Local Only",
      cloudOff: "Cloud Backup Off",
      lastBackup: isThai ? "สำรองล่าสุด: ยังไม่มี" : "Last Backup: Never",
      cashFlow: isThai ? "กระแสเงินสด" : "Cash flow",
      realProfit: isThai ? "กำไรจริง" : "Real profit",
      month: isThai ? "เดือนนี้" : "This month",
      records: isThai ? "128 รายการ" : "128 records",
      cloudValue: isThai ? "ปิด" : "Off",
    },
    sections: [
      {
        icon: HardDrive,
        title: isThai ? "ข้อมูลอยู่ในเครื่องเป็นค่าเริ่มต้น" : "Local by default",
        body: isThai ? "รายรับ รายจ่าย หมวดหมู่ และ backup local ถูกออกแบบให้เก็บในเครื่องก่อน" : "Income, expenses, categories, and local backups are designed to stay on your device first.",
      },
      {
        icon: FileJson,
        title: isThai ? "Export/Import เป็น .paymap" : "Encrypted .paymap vaults",
        body: isThai ? "ส่งออกไฟล์เข้ารหัส อ่านกลับ และย้ายเครื่องได้โดยไม่ต้องเปิด cloud" : "Export, import, and move your encrypted money vault without turning cloud features on.",
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
        ? ["เลือกใช้เพื่ออะไร", "เลือก Local Only เป็นค่าเริ่มต้น", "นำเข้าหรือบันทึกรายการ", "Export .paymap เมื่ออยากสำรอง"]
        : ["Choose your use case", "Keep Local Only by default", "Import or enter money records", "Export .paymap when you want a backup"],
    },
    desktop: {
      kicker: isThai ? "Windows-first product" : "Windows-first product",
      title: isThai ? "เว็บคือหน้าร้าน แอป Windows คือที่ทำงานจริง" : "The website is the front door. The Windows app is the real workspace.",
      body: isThai
        ? "PayMap ไม่ควรทำให้ผู้ใช้สับสนว่าเงินอยู่บนเว็บหรืออยู่ในเครื่อง ดังนั้นเว็บจะเน้นดาวน์โหลด ราคา เอกสาร และบัญชี Cloud Backup ส่วนการบันทึกและดูข้อมูลเงินจริงอยู่ในแอป"
        : "PayMap should not make people wonder whether their money data lives on the web or on their device. The website focuses on downloads, pricing, docs, and Cloud Backup accounts; the app handles real money work.",
      points: isThai
        ? [
            ["Local vault", "เปิดแอปแล้วข้อมูลการเงินเริ่มจากเครื่องคุณ"],
            ["Offline habit", "บันทึกรายการและดูภาพรวมได้โดยไม่ต้องผูกกับ login ก่อน"],
            ["Clear backup", "Cloud Backup เปิดเมื่อผู้ใช้ยืนยันเองเท่านั้น"],
          ]
        : [
            ["Local vault", "Open the app and financial data starts on your device."],
            ["Offline habit", "Record entries and review the picture without needing login first."],
            ["Clear backup", "Cloud Backup turns on only after explicit confirmation."],
          ],
    },
    useCases: {
      kicker: isThai ? "สร้างมาเพื่อเงินส่วนตัว" : "Built for personal money",
      title: isThai ? "ใช้งานจริงทุกวันโดยไม่ต้องเป็นระบบบัญชีหนัก ๆ" : "Daily money work without heavy accounting software.",
      items: isThai
        ? [
            ["รายรับรายจ่าย", "บันทึกเงินเข้าออกให้เร็ว เห็นยอดคงเหลือและ cash flow ทันที"],
            ["กำไรจริง", "แยกเงินเข้า รายจ่าย และผลลัพธ์จริงของเดือนนี้"],
            ["หลายกระเป๋าเงิน", "ติดตามบัญชีธนาคาร เงินสด และกระเป๋าเฉพาะกิจในที่เดียว"],
            ["สำรองเองได้", "Export .paymap เพื่อเก็บไว้ใน drive ส่วนตัวหรือย้ายเครื่อง"],
          ]
        : [
            ["Income and expenses", "Capture money in and out quickly, then see balance and cash flow."],
            ["Real profit", "Separate inflow, spending, and the real result of the month."],
            ["Multiple wallets", "Track bank accounts, cash, and purpose-based wallets in one place."],
            ["Portable backups", "Export .paymap files to your own drive or move devices."],
          ],
    },
    pricingPreview: {
      kicker: isThai ? "ราคาแบบไม่บังคับ cloud" : "Pricing without forced cloud",
      title: isThai ? "เริ่มฟรีบนเครื่อง แล้วจ่ายเมื่ออยากสำรองหรือ sync" : "Start free on device. Pay only when you want backup or sync.",
      plans: isThai
        ? [
            ["Free Local", "ใช้บนเครื่องเดียว Export/Import เอง", "ฟรี"],
            ["Cloud Backup", "สำรองข้อมูลเข้ารหัสแบบ optional", "จ่ายเมื่อเปิดใช้"],
            ["Cloud Sync", "ซิงก์หลายเครื่องเมื่อพร้อม", "สำหรับผู้ใช้จริงจัง"],
          ]
        : [
            ["Free Local", "Use one device and export/import your own backups.", "Free"],
            ["Cloud Backup", "Optional encrypted backup when you turn it on.", "Paid when enabled"],
            ["Cloud Sync", "Sync across devices when you are ready.", "For serious use"],
          ],
    },
    faq: {
      kicker: isThai ? "คำถามที่ต้องตอบให้ชัด" : "Clear answers",
      title: isThai ? "หน้าเว็บต้องทำให้คนเข้าใจทันทีว่า PayMap ทำงานยังไง" : "The website should make PayMap obvious in one scroll.",
      items: isThai
        ? [
            ["ต้อง login ไหม", "ไม่ต้องสำหรับการใช้งาน local บน Windows app. Login ใช้กับ Cloud Backup, Sync และบัญชีเท่านั้น"],
            ["ข้อมูลอยู่ไหน", "อยู่ในเครื่องเป็นค่าเริ่มต้น จนกว่าคุณจะเปิด Cloud Backup เอง"],
            ["เว็บใช้ทำอะไร", "เว็บใช้ดาวน์โหลด ดูราคา อ่านเอกสาร และจัดการบัญชี cloud"],
            ["ถ้าเปลี่ยนเครื่องทำไง", "Export ไฟล์ .paymap แล้ว import ที่เครื่องใหม่ หรือเปิด Cloud Backup เมื่อพร้อม"],
          ]
        : [
            ["Do I need to log in?", "Not for local use in the Windows app. Login is for Cloud Backup, Sync, and account features."],
            ["Where is my data?", "On your device by default unless you explicitly enable Cloud Backup."],
            ["What is the website for?", "Downloads, pricing, docs, and cloud account management."],
            ["How do I move devices?", "Export a .paymap file and import it on the new device, or enable Cloud Backup when ready."],
          ],
    },
    finalCta: {
      title: isThai ? "เริ่มจากแอป Windows ที่ข้อมูลอยู่กับคุณ" : "Start with the Windows app where your data stays with you.",
      body: isThai ? "ดูตัวอย่างใน browser ได้ แต่ประสบการณ์ที่ PayMap ควรขายจริงคือแอป Windows แบบ local-first" : "You can preview it in the browser, but the product PayMap should sell is the local-first Windows app.",
      download: isThai ? "ดาวน์โหลด Windows" : "Download Windows",
      preview: isThai ? "ดูตัวอย่างแอป" : "Preview app",
    },
  }
}

export default async function LocalFirstLanding() {
  const session = await getCurrentSession()
  if (session?.sub) {
    const accountMode = session.accountMode ?? session.workspaceMode
    if (accountMode === "business" || accountMode === "merchant") redirect("/dashboard")

    try {
      const currentUser = await prisma.user.findUnique({ where: { id: session.sub }, select: { uiPreferences: true } })
      const prefs = mergeUiPreferences(currentUser?.uiPreferences)
      redirect(getModeAwareDefaultPageHref(prefs.defaultPage, session.accountMode))
    } catch (error) {
      console.error("HomePage redirect fallback: failed to load user preferences", error)
      redirect("/dashboard")
    }
  }

  const copy = getLandingCopy(detectSiteLang())

  return (
    <div className="paymap-obsidian-site min-h-screen">
      <header className="paymap-obsidian-header sticky top-0 z-50">
        <div className="paymap-obsidian-container flex items-center justify-between gap-4">
          <LogoFull height={30} className="paymap-obsidian-logo" />
          <nav className="paymap-obsidian-nav hidden items-center gap-7 text-sm font-semibold md:flex">
            <a href="#privacy">{copy.nav.privacy}</a>
            <a href="#backup">{copy.nav.backup}</a>
            <Link href="/pricing">{copy.nav.pricing}</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="paymap-obsidian-login hidden rounded-xl px-4 py-2 text-sm font-bold sm:inline-flex">{copy.nav.login}</Link>
            <Link href="/register?mode=personal" className="paymap-obsidian-small-cta rounded-xl px-5 py-2.5 text-sm font-bold">{copy.nav.start}</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="paymap-obsidian-hero paymap-obsidian-container grid gap-10 lg:grid-cols-[1fr_.9fr]">
          <div className="flex flex-col justify-center">
            <div className="paymap-obsidian-badge inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em]">
              <ShieldCheck size={14} /> {copy.hero.badge}
            </div>
            <h1 className="paymap-obsidian-title mt-7 max-w-4xl text-5xl font-black leading-[1.02] md:text-7xl">
              {copy.hero.title}
            </h1>
            <p className="paymap-obsidian-copy mt-6 max-w-2xl text-lg leading-8">{copy.hero.body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/download" className="paymap-obsidian-cta inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-base font-black">
                {copy.hero.primary} <ArrowRight size={18} />
              </Link>
              <Link href="/desktop" className="paymap-obsidian-link inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-base font-black">
                {copy.hero.secondary}
              </Link>
            </div>
            <p className="paymap-obsidian-note mt-4 flex items-center gap-2 text-sm font-semibold"><Lock size={15} /> {copy.hero.note}</p>
          </div>

          <div className="paymap-obsidian-preview-shell rounded-[28px] p-5">
            <div className="paymap-obsidian-preview-title rounded-[22px] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em]">{copy.preview.title}</div>
                  <div className="mt-2 text-2xl font-black">PayMap Local</div>
                </div>
                <Wallet size={28} />
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {[copy.preview.localOnly, copy.preview.cloudOff, copy.preview.lastBackup].map((label) => (
                  <span key={label} className="paymap-obsidian-pill rounded-full px-3 py-1 text-xs font-bold">{label}</span>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                [copy.preview.cashFlow, "+฿18,450", "#059669"],
                [copy.preview.realProfit, "฿42,180", "#4f46e5"],
                [copy.preview.month, copy.preview.records, "#d97706"],
                ["Cloud", copy.preview.cloudValue, "#64748b"],
              ].map(([label, value, color]) => (
                <div key={label} className="paymap-obsidian-stat rounded-2xl p-5">
                  <div className="text-xs font-black uppercase tracking-[0.14em]">{label}</div>
                  <div className="mt-3 text-3xl font-black" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="privacy" className="paymap-obsidian-section py-16">
          <div className="paymap-obsidian-container grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {copy.sections.map(({ icon: Icon, title, body }) => (
              <div key={title} className="paymap-obsidian-card rounded-2xl p-6">
                <div className="paymap-obsidian-card-icon flex h-11 w-11 items-center justify-center rounded-xl"><Icon size={20} /></div>
                <h2 className="mt-5 text-lg font-black">{title}</h2>
                <p className="mt-3 text-sm leading-7">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="backup" className="paymap-obsidian-flow paymap-obsidian-container grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <div className="paymap-obsidian-kicker text-sm font-black uppercase tracking-[0.18em]">Local-first flow</div>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">{copy.flow.title}</h2>
            <p className="paymap-obsidian-copy mt-4 text-base leading-8">{copy.flow.body}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.flow.steps.map((step, index) => (
              <div key={step} className="paymap-obsidian-card rounded-2xl p-6">
                <div className="text-xs font-black uppercase tracking-[0.18em]">Step {index + 1}</div>
                <div className="mt-3 flex items-center gap-3 text-lg font-black">
                  {index === 0 ? <Wallet size={20} /> : index === 1 ? <HardDrive size={20} /> : index === 2 ? <Upload size={20} /> : <Download size={20} />}
                  {step}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="paymap-obsidian-long-section paymap-obsidian-container grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="paymap-obsidian-kicker text-sm font-black uppercase tracking-[0.18em]">{copy.desktop.kicker}</div>
            <h2 className="mt-3 text-4xl font-black leading-tight">{copy.desktop.title}</h2>
            <p className="paymap-obsidian-copy mt-5 text-base leading-8">{copy.desktop.body}</p>
            <div className="mt-7 grid gap-3">
              {copy.desktop.points.map(([title, body]) => (
                <div key={title} className="paymap-obsidian-row-card">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="paymap-obsidian-terminal">
            <div className="paymap-obsidian-terminal-top">
              <span />
              <span />
              <span />
              <strong>PayMap Windows</strong>
            </div>
            <div className="paymap-obsidian-terminal-body">
              <div className="paymap-obsidian-vault-line"><HardDrive size={16} /> Local vault active</div>
              <div className="paymap-obsidian-vault-grid">
                <div><span>Storage</span><strong>On this device</strong></div>
                <div><span>Cloud Backup</span><strong>Off</strong></div>
                <div><span>Export</span><strong>.paymap</strong></div>
                <div><span>Mode</span><strong>Offline ready</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="paymap-obsidian-section py-20">
          <div className="paymap-obsidian-container">
            <div className="max-w-2xl">
              <div className="paymap-obsidian-kicker text-sm font-black uppercase tracking-[0.18em]">{copy.useCases.kicker}</div>
              <h2 className="mt-3 text-4xl font-black leading-tight">{copy.useCases.title}</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {copy.useCases.items.map(([title, body], index) => (
                <article key={title} className="paymap-obsidian-feature-card">
                  <div className="paymap-obsidian-feature-number">{String(index + 1).padStart(2, "0")}</div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="paymap-obsidian-long-section paymap-obsidian-container">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <div className="paymap-obsidian-kicker text-sm font-black uppercase tracking-[0.18em]">{copy.pricingPreview.kicker}</div>
              <h2 className="mt-3 text-4xl font-black leading-tight">{copy.pricingPreview.title}</h2>
              <div className="mt-8">
                <Link href="/pricing" className="paymap-obsidian-link inline-flex items-center gap-2 text-base font-black">
                  {copy.nav.pricing} <ArrowRight size={17} />
                </Link>
              </div>
            </div>
            <div className="grid gap-4">
              {copy.pricingPreview.plans.map(([name, body, price]) => (
                <article key={name} className="paymap-obsidian-price-row">
                  <div>
                    <h3>{name}</h3>
                    <p>{body}</p>
                  </div>
                  <strong>{price}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="paymap-obsidian-section py-20">
          <div className="paymap-obsidian-container grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <div className="paymap-obsidian-kicker text-sm font-black uppercase tracking-[0.18em]">{copy.faq.kicker}</div>
              <h2 className="mt-3 text-4xl font-black leading-tight">{copy.faq.title}</h2>
            </div>
            <div className="grid gap-4">
              {copy.faq.items.map(([question, answer]) => (
                <article key={question} className="paymap-obsidian-faq-card">
                  <h3>{question}</h3>
                  <p>{answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="paymap-obsidian-final paymap-obsidian-container">
          <div>
            <h2>{copy.finalCta.title}</h2>
            <p>{copy.finalCta.body}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/download" className="paymap-obsidian-cta inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-base font-black">
              {copy.finalCta.download} <Download size={18} />
            </Link>
            <Link href="/desktop" className="paymap-obsidian-link inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-base font-black">
              {copy.finalCta.preview}
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
