import Link from "next/link"
import { ArrowRight, Download, Laptop, Monitor, ShieldCheck, Sparkles } from "lucide-react"
import PublicShell from "@/components/public/PublicShell"
import { detectSiteLang } from "@/lib/i18n/site"

export const revalidate = 3600
export const metadata = { title: "Download — PayMap" }

export default function DownloadPage({ searchParams }: { searchParams?: { desktop?: string; legacy?: string; from?: string } }) {
  const lang = detectSiteLang()
  const blocked = searchParams?.desktop === "1"
  const legacySaas = searchParams?.legacy === "saas"
  const from = searchParams?.from || "/"
  const isThai = lang === "th"
  const isLao = lang === "lo"

  const copy = {
    eyebrow: legacySaas
      ? isThai
        ? "PayMap เปลี่ยนทิศทางแล้ว"
        : "PayMap has changed direction"
      : blocked
      ? isThai
        ? "ใช้งานบนคอมพิวเตอร์เท่านั้น"
        : isLao
          ? "Desktop required"
          : "Desktop required"
      : isThai
        ? "PayMap desktop workspace"
        : isLao
          ? "PayMap desktop workspace"
          : "PayMap desktop workspace",
    title: legacySaas
      ? isThai
        ? "ระบบ SaaS เก่าถูกปิดแล้ว"
        : "The old SaaS pages are closed"
      : blocked
      ? isThai
        ? "PayMap ใช้งานได้เฉพาะบน PC / Laptop"
        : isLao
          ? "Open PayMap on a PC or laptop"
          : "Open PayMap on a PC or laptop"
      : isThai
        ? "ดาวน์โหลด PayMap Desktop สำหรับ Windows"
        : isLao
          ? "Download PayMap Desktop for Windows"
          : "Download PayMap Desktop for Windows",
    description: legacySaas
      ? isThai
        ? "PayMap ใหม่โฟกัสแอป Windows แบบ local-first สำหรับติดตามรายรับ รายจ่าย กระแสเงินสด และกำไรจริง เว็บนี้ใช้สำหรับดาวน์โหลด ราคา เอกสาร และบัญชี Cloud Backup เท่านั้น"
        : "The new PayMap focuses on a local-first Windows app for income, expenses, cash flow, and real profit. This website is for downloads, pricing, docs, and Cloud Backup accounts."
      : blocked
      ? isThai
        ? "PayMap ใช้งานจริงผ่านแอป Windows เพื่อให้ local vault, export/import และการทำงาน offline ชัดเจนกว่าเว็บ หากเปิดจากโทรศัพท์หรือ iPad จะถูกพามาหน้านี้"
        : "PayMap's real workspace runs in the Windows app so local vaults, export/import, and offline use stay clear. Phones and tablets are redirected here."
      : isThai
        ? "ใช้ PayMap บนเว็บได้ แต่ประสบการณ์ที่ดีที่สุดคือแอป Windows ที่ข้อมูลอยู่กับคุณ ข้อมูลการเงินอยู่ในเครื่องเป็นค่าเริ่มต้น และ Cloud Backup เป็นตัวเลือก"
        : "Use PayMap on the web, but the best experience is the Windows app where your data stays with you. Financial data stays on your device by default, and Cloud Backup is optional.",
    ctaLabel: isThai ? "จัดการบัญชี Cloud Backup" : "Manage Cloud Backup account",
    back: isThai ? "กลับไปหน้าที่พยายามเปิด" : "Back to the page you tried to open",
    whyTitle: isThai ? "ทำไมต้องเน้น Windows app" : "Why the Windows app comes first",
    whyBody: isThai
      ? "PayMap เป็น private money dashboard ที่ข้อมูลอยู่กับคุณ การทำเป็นแอป Windows ทำให้ storage, backup, offline และไฟล์ .paymap เข้าใจง่ายกว่าเว็บที่ต้องผูกกับ login"
      : "PayMap is a private money dashboard where your data stays with you. A Windows app makes storage, backups, offline use, and .paymap files clearer than a login-first web app.",
    points: isThai
      ? [
          ["Local vault ชัดเจน", "ข้อมูลการเงินทำงานบนเครื่องเป็นค่าเริ่มต้น และ Cloud Backup ไม่เปิดเอง"],
          ["Offline ใช้งานจริง", "เปิดแอปเพื่อบันทึกรายรับ รายจ่าย และดู cash flow ได้โดยไม่ต้องพึ่งเว็บตลอดเวลา"],
          ["Backup ง่าย", "Export/Import ไฟล์ .paymap เข้ารหัสได้เอง และย้ายเครื่องได้เมื่อพร้อม"],
          ["เว็บไม่ทำให้สับสน", "เว็บเหลือหน้าที่ดาวน์โหลด ราคา เอกสาร และบัญชี Cloud Backup เท่านั้น"],
        ]
      : [
          ["Clear local vault", "Financial data stays on the device by default, and Cloud Backup never turns itself on."],
          ["Real offline use", "Open the app to record income, expenses, and cash flow without depending on the web."],
          ["Simple backups", "Export/import encrypted .paymap files and move devices when you are ready."],
          ["Less web confusion", "The website stays focused on downloads, pricing, docs, and Cloud Backup accounts."],
        ],
  }

  return (
    <PublicShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      ctaHref="/login"
      ctaLabel={copy.ctaLabel}
    >
      <div className="flex flex-wrap gap-3">
        <Link href="https://github.com/seashyne/paymap.app/releases/latest" className="public-btn public-btn-primary">Download Windows app <Download size={16} /></Link>
        <Link href="/desktop" className="public-btn public-btn-ghost">Preview desktop workspace <ArrowRight size={16} /></Link>
        <Link href={from} className="public-btn public-btn-ghost">{copy.back}</Link>
      </div>

      <div className="mt-10 grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <div className="public-panel-v72 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
            <ShieldCheck size={14} /> Local-first Windows app
          </div>
          <h2 className="text-3xl font-black text-[var(--text)]">{isThai ? "เว็บคือหน้าดาวน์โหลด แอป Windows คือตัวทำงานจริง" : "The website is for downloads. The Windows app is the real workspace."}</h2>
          <p className="text-sm leading-7 text-[var(--text-2)]">
            {isThai
              ? "เวอร์ชัน Desktop เปิด local vault สำหรับบันทึกรายรับ รายจ่าย กระแสเงินสด กำไรจริง และสำรองข้อมูลเป็น .paymap โดยไม่ต้องอัปโหลดข้อมูลขึ้น cloud ตั้งแต่แรก"
              : "The Desktop app opens a local vault for income, expenses, cash flow, real profit, and encrypted .paymap backups without uploading financial data by default."}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {(isThai
              ? [
                  ["Obsidian-style workspace", "Sidebar, vault และ quick capture สำหรับงานการเงินประจำวัน"],
                  ["Local-first storage", "ข้อมูลการเงินอยู่ในเครื่องด้วย IndexedDB และ export/import ได้"],
                  ["Windows installer", "แพ็กเป็น PayMap-Setup-15.3.1.exe สำหรับติดตั้งบน Windows"],
                  ["Cloud optional", "Cloud Backup ไม่เปิดเอง ต้องเปิดจากผู้ใช้ก่อนเท่านั้น"],
                ]
              : [
                  ["Obsidian-style workspace", "Sidebar, vault, search, and quick capture for daily finance work."],
                  ["Local-first storage", "Financial data stays on device with IndexedDB plus export/import."],
                  ["Windows installer", "Packaged as PayMap-Setup-15.3.1.exe for Windows."],
                  ["Cloud optional", "Cloud Backup stays off until the user explicitly enables it."],
                ]).map(([title, body]) => (
              <div key={title} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-base font-black text-[var(--text)]">{title}</div>
                <div className="mt-2 text-sm leading-6 text-[var(--text-2)]">{body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          {[{
            title: 'Windows Desktop App',
            desc: 'ติดตั้ง PayMap เป็นโปรแกรมบน Windows พร้อม local vault สำหรับข้อมูลการเงินส่วนตัว',
            icon: Laptop,
            href: 'https://github.com/seashyne/paymap.app/releases/latest',
            cta: 'Download from GitHub Releases',
          }, {
            title: 'Desktop workspace preview',
            desc: 'ดูตัวอย่าง PayMap Desktop ใน browser ก่อนแพ็กหรือติดตั้งจริง',
            icon: Monitor,
            href: '/desktop',
            cta: 'Open preview',
          }, {
            title: '.paymap vaults',
            desc: 'ส่งออก นำเข้า และย้ายข้อมูลการเงินส่วนตัวโดยไม่ต้องเปิด Cloud Backup',
            icon: Download,
            href: '/desktop',
            cta: 'Preview backup flow',
          }].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="public-panel-v72">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-2xl font-black text-[var(--text)]">{item.title}</div>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">{item.desc}</p>
                  </div>
                  <div className="rounded-2xl bg-[var(--surface-2)] p-3 text-[var(--primary)]"><Icon size={18} /></div>
                </div>
                <div className="mt-6">
                  <Link href={item.href} className="public-btn public-btn-ghost">{item.cta}</Link>
                </div>
              </div>
            )
          })}
          <div className="public-panel-v72">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]"><Sparkles size={16} /> Build command</div>
            <div className="mt-2 text-sm leading-7 text-[var(--text-2)]">สร้างแอป Windows แบบ portable ด้วย <code>bun run desktop:portable:win</code> แล้วเปิด <code>release/PayMap-win-x64/PayMap.exe</code>. ถ้าต้องการ installer NSIS ใช้ <code>bun run desktop:pack:win</code>.</div>
          </div>
        </div>
      </div>
    </PublicShell>
  )
}
