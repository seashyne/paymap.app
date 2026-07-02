import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Briefcase, CheckCircle2, Package, Receipt, Sparkles, Store, Wallet } from "lucide-react"
import { LogoFull } from "@/components/ui/Logo"
import { getCurrentSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { mergeUiPreferences, getModeAwareDefaultPageHref } from "@/lib/ui-preferences"
import { detectSiteLang, type SiteLang } from "@/lib/i18n/site"
import LocalFirstLanding from "@/components/local-first/LocalFirstLanding"

export const revalidate = 3600

function getLandingCopy(lang: SiteLang) {
  const isThai = lang === "th"
  const isLao = lang === "lo"

  return {
    nav: {
      personal: "ERP Lite",
      highlights: isThai ? "จุดเด่น" : isLao ? "Highlights" : "Highlights",
      products: isThai ? "เหมาะกับใคร" : isLao ? "Use cases" : "Use cases",
    },
    hero: {
      badge: isThai ? "ERP Lite สำหรับ SME และร้านค้า" : isLao ? "ERP Lite for SME and stores" : "ERP Lite for SME and stores",
      line1: isThai ? "คุมร้านและธุรกิจเล็ก" : isLao ? "Run your small business" : "Run your small business",
      line2: isThai ? "โดยไม่ต้องใช้ ERP ใหญ่" : isLao ? "without heavy ERP" : "without heavy ERP",
      body: isThai
        ? "PayMap ช่วย SME และร้านค้าคุมยอดขาย stock invoice ลูกค้า VAT และเงินเข้าออกในที่เดียว ง่ายกว่า ERP ใหญ่ และเป็นระบบกว่าการไล่ Excel หลายไฟล์"
        : isLao
          ? "PayMap helps SMEs and stores manage sales, stock, invoices, customers, VAT, and cashflow in one place. Easier than heavy ERP, more structured than spreadsheets."
          : "PayMap helps SMEs and stores manage sales, stock, invoices, customers, VAT, and cashflow in one place. Easier than heavy ERP, more structured than spreadsheets.",
      primaryCta: isThai ? "เริ่ม ERP Lite" : isLao ? "Start ERP Lite" : "Start ERP Lite",
      secondaryCta: isThai ? "ดูสำหรับร้านค้า" : isLao ? "See store setup" : "See store setup",
      helper: isThai
        ? "เริ่มจาก 3 งานหลัก: ดูยอดวันนี้, เช็ก stock/invoice ที่ต้องแก้, แล้วออกเอกสารหรือปิดยอดต่อ"
        : isLao
          ? "Start with three jobs: check today's sales, review stock or invoices, then issue documents or close the day."
          : "Start with three jobs: check today's sales, review stock or invoices, then issue documents or close the day.",
    },
    showcase: {
      totalEquity: isThai ? "รายได้เดือนนี้" : isLao ? "Monthly revenue" : "Monthly revenue",
      cards: isThai
        ? [
            ["Invoice ค้างรับ", "18", "รู้ทันทีว่าต้องตามเก็บจากใคร", "#006b63"],
            ["Stock ใกล้หมด", "7", "เห็นสินค้าที่ต้องเติมก่อนเสียยอดขาย", "#ac3149"],
            ["VAT พร้อมตรวจ", "92%", "ข้อมูลขายและภาษีจัดกลุ่มไว้แล้ว", "#5b47d3"],
          ]
        : [
            ["Open invoices", "18", "Know who needs payment follow-up", "#006b63"],
            ["Low-stock items", "7", "Restock before sales get blocked", "#ac3149"],
            ["VAT readiness", "92%", "Sales and tax evidence are organized", "#5b47d3"],
          ],
    },
    personal: {
      kicker: "PayMap ERP Lite",
      title: isThai ? "ระบบเดียวสำหรับงานหลังร้านที่ SME ต้องใช้จริง" : isLao ? "One light system for SME operations." : "One light system for SME operations.",
      body: isThai
        ? "ออกแบบให้เจ้าของร้านและทีมเล็กเริ่มใช้ได้ไว ไม่ต้องเรียน ERP ใหญ่ แต่ยังคุมข้อมูลสำคัญที่ทำให้ธุรกิจเดินต่อได้"
        : isLao
          ? "Built so small teams can start quickly without learning a heavy ERP, while still controlling the operating data that keeps the business moving."
          : "Built so small teams can start quickly without learning a heavy ERP, while still controlling the operating data that keeps the business moving.",
      features: isThai
        ? [
            ["ขายและรับเงิน", "ดูยอดขาย เงินเข้า ใบแจ้งหนี้ และสถานะชำระเงินใน flow เดียว"],
            ["Stock และสินค้า", "รู้ว่าสินค้าไหนขายดี ใกล้หมด หรือควรสั่งเพิ่ม"],
            ["รายงานและภาษี", "สรุป P&L, VAT และข้อมูลที่ต้องใช้คุยกับบัญชี"],
          ]
        : [
            ["Sales and collections", "Track sales, cash-in, invoices, and payment status in one flow."],
            ["Stock and products", "Know what sells, what is low, and what should be reordered."],
            ["Reports and tax", "Summarize P&L, VAT, and accountant-ready operating data."],
          ],
    },
    flow: {
      kicker: isThai ? "First minute flow" : isLao ? "First minute flow" : "First minute flow",
      title: isThai ? "เปิดมาแล้วรู้ว่างานหลังร้านไหนต้องทำก่อน" : isLao ? "Know the next operation task immediately." : "Know the next operation task immediately.",
      body: isThai
        ? "PayMap จะไม่เป็นเมนูใหญ่ ๆ ที่ต้องเดาเอง แต่เป็น workspace ที่พาคุณเช็กยอด เช็กของ เช็กเอกสาร และทำงานต่อได้ทันที"
        : "PayMap should feel less like a menu wall and more like a focused workspace for sales, stock, documents, and cashflow.",
      steps: isThai
        ? [
            ["ดูยอดวันนี้", "ยอดขาย เงินเข้า ใบแจ้งหนี้ และรายการที่ยังไม่ปิด"],
            ["ตรวจจุดเสี่ยง", "stock ต่ำ invoice ค้าง หรือ VAT ที่ยังไม่พร้อม"],
            ["ทำงานถัดไป", "เปิด POS สร้าง invoice เติม stock หรือดูรายงานต่อ"],
          ]
        : [
            ["See today", "Sales, cash-in, open invoices, and unfinished work."],
            ["Review risk", "Low stock, overdue invoices, or VAT evidence gaps."],
            ["Take action", "Open POS, create an invoice, restock, or review reports."],
          ],
    },
    products: {
      kicker: isThai ? "ERP Lite use cases" : isLao ? "ERP Lite use cases" : "ERP Lite use cases",
      title: isThai ? "เลือกตามงานธุรกิจ ไม่ใช่เลือกหลายบริการ" : isLao ? "Choose by business workflow." : "Choose by business workflow.",
      body: isThai
        ? "แกนหลักของ PayMap เหลือ ERP Lite ทางเดียว แต่มี setup สำหรับธุรกิจบริการ/ทีม และร้านค้าที่มี POS/stock"
        : isLao
          ? "PayMap now has one ERP Lite direction, with setup paths for service teams and stores."
          : "PayMap now has one ERP Lite direction, with setup paths for service teams and stores.",
      cards: [
        {
          title: "Business",
          body: isThai ? "สำหรับ SME ที่ต้องคุม invoice, ลูกค้า, cashflow, accounting และ payroll แบบเบา ๆ" : "For SMEs that need lightweight control over invoices, customers, cashflow, accounting, and payroll.",
          href: "/for-business",
          icon: Briefcase,
          tone: "#006b63",
          cta: isThai ? "เริ่ม ERP Lite" : "Start ERP Lite",
        },
        {
          title: "Merchant",
          body: isThai ? "สำหรับร้านค้าที่ต้องคุม POS, ยอดขาย, stock, VAT และงานหน้าร้านใน flow เดียว" : "For stores that need POS, sales, stock, VAT, and counter operations in one flow.",
          href: "/for-merchants",
          icon: Store,
          tone: "#ac3149",
          cta: isThai ? "ดู PayMap Merchant" : "Explore Merchant",
        },
      ],
    },
    trust: {
      badge: isThai ? "SME-first design" : isLao ? "SME-first design" : "SME-first design",
      title: isThai ? "เล็กพอให้เริ่มง่าย แต่ครบพอให้เลิกไล่ Excel" : isLao ? "Light enough to start, structured enough to replace spreadsheets." : "Light enough to start, structured enough to replace spreadsheets.",
      body: isThai
        ? "PayMap ไม่พยายามเป็น ERP ใหญ่เต็มรูปแบบ แต่จัดงานสำคัญของ SME ให้เป็นระบบเดียวที่ทีมเล็กใช้ได้จริง"
        : isLao
          ? "PayMap does not try to become a full enterprise ERP. It organizes the operating work small teams actually need."
          : "PayMap does not try to become a full enterprise ERP. It organizes the operating work small teams actually need.",
    },
    cta: {
      title: isThai ? "เริ่มจาก ERP Lite ให้ธุรกิจคุณก่อน" : isLao ? "Start with ERP Lite for your business." : "Start with ERP Lite for your business.",
      body: isThai ? "ตั้งค่า workspace สำหรับ invoice, stock, sales และ cashflow แล้วค่อยต่อยอดส่วนอื่นเมื่อใช้งานจริง" : "Set up invoices, stock, sales, and cashflow first, then expand only when the workflow needs it.",
      primary: isThai ? "สร้าง ERP workspace" : "Create ERP workspace",
      secondary: isThai ? "ดูราคา" : "View pricing",
    },
  }
}

async function LegacyHomePage() {
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

  const lang = detectSiteLang()
  const copy = getLandingCopy(lang)
  const loginLabel = lang === "en" ? "Log in" : lang === "lo" ? "ເຂົ້າລະບົບ" : "เข้าสู่ระบบ"
  const startLabel = lang === "en" ? "Start ERP Lite" : lang === "lo" ? "ເລີ່ມ ERP Lite" : "เริ่ม ERP Lite"

  return (
    <div className="marketing-shell bg-[#f8f9fd] text-[#2e3339]">
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="public-container-v72 flex items-center justify-between gap-4 py-4">
          <LogoFull height={28} className="text-[#2e3339]" />
          <div className="hidden items-center gap-8 text-sm text-slate-500 md:flex">
            <a href="#personal" className="font-semibold text-[#5b47d3]">{copy.nav.personal}</a>
            <a href="#highlights" className="transition hover:text-[#5b47d3]">{copy.nav.highlights}</a>
            <a href="#products" className="transition hover:text-[#5b47d3]">{copy.nav.products}</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 sm:inline-flex">{loginLabel}</Link>
            <Link href="/register?mode=business" className="rounded-xl bg-[#5b47d3] px-5 py-2.5 text-sm font-bold text-white shadow-[0_18px_40px_rgba(91,71,211,.2)]">{startLabel}</Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="public-container-v72 grid gap-16 py-12 lg:grid-cols-[1.02fr_.98fr] lg:py-16">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#ede9fe] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5b47d3]">
              <Sparkles size={14} /> {copy.hero.badge}
            </div>
            <h1 className="mt-8 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[#2e3339] md:text-6xl xl:text-7xl">
              {copy.hero.line1}
              <span className="block text-[#5b47d3]">{copy.hero.line2}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5a6066]">{copy.hero.body}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/register?mode=business" className="inline-flex items-center gap-2 rounded-xl bg-[#5b47d3] px-8 py-4 text-lg font-bold text-white shadow-[0_24px_50px_rgba(91,71,211,.24)]">
                {copy.hero.primaryCta} <ArrowRight size={18} />
              </Link>
              <Link href="/register?mode=merchant" className="inline-flex items-center gap-2 rounded-xl bg-[#e4e8ef] px-8 py-4 text-lg font-bold text-[#2e3339]">
                {copy.hero.secondaryCta}
              </Link>
            </div>
            <p className="mt-4 text-sm text-[#5a6066]">{copy.hero.helper}</p>
          </div>
          <div className="relative">
            <div className="absolute -left-16 -top-12 h-56 w-56 rounded-full bg-[#5b47d3]/10 blur-[110px]" />
            <div className="absolute -bottom-14 -right-10 h-44 w-44 rounded-full bg-[#006b63]/10 blur-[100px]" />
            <div className="relative rounded-[2rem] bg-white p-4 shadow-[0_30px_70px_rgba(46,51,57,.14)]">
              <div className="relative overflow-hidden rounded-[1.6rem] bg-[linear-gradient(135deg,#5b47d3,#6a56e6)] p-8 text-white">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">{copy.showcase.totalEquity}</div>
                <div className="mt-4 text-5xl font-black tracking-[-0.05em]">$142,500.00</div>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#84f5e8] px-4 py-2 text-sm font-bold text-[#005c55]">
                  <ArrowRight size={15} /> +12.4%
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {copy.showcase.cards.map(([label, value, hint, tone]) => (
                  <div key={label} className="rounded-[1.7rem] bg-[#f8f9fd] p-6">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5a6066]">{label}</div>
                    <div className="mt-3 text-4xl font-black tracking-[-0.04em]" style={{ color: tone }}>{value}</div>
                    <div className="mt-3 text-sm text-[#5a6066]">{hint}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="personal" className="public-container-v72 py-6 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
            <div className="rounded-[2rem] bg-white p-8 shadow-[0_16px_40px_rgba(46,51,57,.08)]">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5b47d3]">{copy.personal.kicker}</div>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#2e3339]">{copy.personal.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[#5a6066]">{copy.personal.body}</p>
              <div className="mt-8 space-y-4">
                {copy.personal.features.map(([title, body]) => (
                  <div key={title} className="rounded-[1.5rem] bg-[#f8f9fd] p-5">
                    <div className="text-lg font-black text-[#2e3339]">{title}</div>
                    <div className="mt-2 text-sm leading-7 text-[#5a6066]">{body}</div>
                  </div>
                ))}
              </div>
            </div>
            <div id="highlights" className="grid gap-6">
              <div className="rounded-[2rem] bg-white p-8 shadow-[0_16px_40px_rgba(46,51,57,.08)]">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#e9fff8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#006b63]">
                  <Wallet size={14} /> {lang === "th" ? "เครื่องมือที่ช่วยคุมเงินของคุณ" : "Tools that help you control your money"}
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    { label: lang === "th" ? "Invoice และรับเงิน" : "Invoices and collections", icon: Receipt },
                    { label: lang === "th" ? "Stock และสินค้า" : "Stock and products", icon: Package },
                    { label: lang === "th" ? "POS และยอดขาย" : "POS and sales", icon: Store },
                    { label: lang === "th" ? "รายงานและ VAT" : "Reports and VAT", icon: Briefcase },
                  ].map(({ label, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-3 rounded-2xl bg-[#f8f9fd] px-4 py-3 text-sm font-semibold text-[#2e3339]">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ede9fe] text-[#5b47d3]"><Icon size={16} /></span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] bg-[#0c0e11] p-8 text-white shadow-[0_24px_60px_rgba(12,14,17,.22)]">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                  <Sparkles size={14} /> {copy.trust.badge}
                </div>
                <div className="mt-5 text-4xl font-black tracking-[-0.04em]">{copy.trust.title}</div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{copy.trust.body}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="public-container-v72 py-10 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#006b63]">{copy.flow.kicker}</div>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#2e3339]">{copy.flow.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[#5a6066]">{copy.flow.body}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {copy.flow.steps.map(([title, body], index) => (
                <div key={title} className="rounded-2xl bg-white p-6 shadow-[0_16px_40px_rgba(46,51,57,.08)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9fff8] text-[#006b63]">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#7a7f87]">Step {index + 1}</div>
                  <h3 className="mt-2 text-xl font-black text-[#2e3339]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5a6066]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="products" className="bg-[#f2f4f8] py-16 lg:py-20">
          <div className="public-container-v72">
            <div className="max-w-2xl">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5b47d3]">{copy.products.kicker}</div>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#2e3339]">{copy.products.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#5a6066]">{copy.products.body}</p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {copy.products.cards.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.title} href={item.href} className="rounded-[2rem] bg-white p-8 transition hover:-translate-y-0.5">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${item.tone}18`, color: item.tone }}>
                      <Icon size={24} />
                    </span>
                    <div className="mt-8 text-3xl font-black tracking-[-0.04em] text-[#2e3339]">{item.title}</div>
                    <p className="mt-4 text-sm leading-7 text-[#5a6066]">{item.body}</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold" style={{ color: item.tone }}>
                      {item.cta} <ArrowRight size={15} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section id="cta" className="public-container-v72 pb-24 pt-20">
          <div className="rounded-[3rem] bg-[#5b47d3] p-10 text-center text-white shadow-[0_30px_70px_rgba(91,71,211,.3)] lg:p-16">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-4xl font-black tracking-[-0.05em] md:text-5xl">{copy.cta.title}</h2>
              <p className="mt-4 text-lg leading-8 text-[#c1b9ff]">{copy.cta.body}</p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/register?mode=business" className="rounded-xl bg-white px-8 py-4 text-lg font-black text-[#5b47d3]">{copy.cta.primary}</Link>
                <Link href="/pricing?focus=business" className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-lg font-black text-white">{copy.cta.secondary}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LocalFirstLanding
