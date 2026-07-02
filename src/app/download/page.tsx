import Link from "next/link"
import { ArrowRight, Download, Laptop, Monitor, ShieldCheck, Sparkles } from "lucide-react"
import PublicShell from "@/components/public/PublicShell"
import { detectSiteLang } from "@/lib/i18n/site"

export const revalidate = 3600
export const metadata = { title: "Download — PayMap" }

export default function DownloadPage({ searchParams }: { searchParams?: { desktop?: string; from?: string } }) {
  const lang = detectSiteLang()
  const blocked = searchParams?.desktop === "1"
  const from = searchParams?.from || "/"
  const isThai = lang === "th"
  const isLao = lang === "lo"

  const copy = {
    eyebrow: blocked
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
    title: blocked
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
    description: blocked
      ? isThai
        ? "เพื่อให้ workflow, table system, POS, accounting และ analytics ทำงานได้ครบ ระบบจึงเปิดใช้เฉพาะหน้าจอ desktop ตอนนี้ หากเปิดจากโทรศัพท์หรือ iPad จะถูกพามาหน้านี้"
        : "To keep workflow, tables, POS, accounting, and analytics working correctly, PayMap currently runs only on desktop-sized screens. Phones and tablets are redirected here."
      : isThai
        ? "ติดตั้ง PayMap เป็นแอป Windows แบบ local-first ได้เหมือน workspace ส่วนตัว ข้อมูลการเงินอยู่ในเครื่องเป็นค่าเริ่มต้น และ Cloud Backup เป็นตัวเลือก"
        : "Install PayMap as a local-first Windows desktop app. Your financial data stays on your device by default, and Cloud Backup is optional.",
    ctaLabel: isThai ? "เปิดหน้าเข้าสู่ระบบ" : "Open desktop login",
    back: isThai ? "กลับไปหน้าที่พยายามเปิด" : "Back to the page you tried to open",
    whyTitle: isThai ? "ทำไมถึงบังคับใช้เฉพาะ PC" : "Why desktop is required",
    whyBody: isThai
      ? "PayMap เน้น table system, accounting workbench, inventory, POS และ command palette บนหน้าจอขนาดใหญ่ การปิด mobile/tablet ช่วยลด layout bug, interaction ซ้อน และการใช้งานผิด flow"
      : "PayMap is optimized for table systems, accounting workbenches, inventory, POS, and command-palette workflows on larger screens. Limiting phone and tablet access reduces layout bugs and conflicting interactions.",
    points: isThai
      ? [
          ["PC workspace shell", "Sidebar, command palette และ data table ถูกออกแบบให้ใช้ต่อเนื่องบนจอ desktop"],
          ["Stable POS flow", "หน้าขายและ checkout rail ทำงานได้เร็วและไม่บีบเนื้อหาบนจอเล็ก"],
          ["Accounting readability", "รายงานและ reconciliation อ่านได้ครบโดยไม่ต้องย่อหรือเลื่อนซ้อนหลายชั้น"],
          ["Lower QA surface", "ลดจำนวน breakpoint ที่ต้องดูแลเพื่อโฟกัสให้ระบบหลักใช้งานได้จริงก่อน"],
        ]
      : [
          ["PC workspace shell", "Sidebar, command palette, and data tables are tuned for longer desktop sessions."],
          ["Stable POS flow", "Sales and checkout rails stay fast and readable without being compressed for small screens."],
          ["Accounting readability", "Reports and reconciliation remain readable without stacked scrolling or collapsed content."],
          ["Lower QA surface", "Fewer breakpoints make it easier to keep the main product stable and production-ready."],
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
          <h2 className="text-3xl font-black text-[var(--text)]">{isThai ? "PayMap เหมือน workspace การเงินส่วนตัว" : "PayMap as a private finance workspace"}</h2>
          <p className="text-sm leading-7 text-[var(--text-2)]">
            {isThai
              ? "เวอร์ชัน Desktop เปิดหน้า local vault สำหรับบันทึกรายรับ รายจ่าย กำไรจริง และสำรองข้อมูลเป็น .paymap.json โดยไม่ต้องอัปโหลดข้อมูลขึ้น cloud ตั้งแต่แรก"
              : "The Desktop app opens a local vault for income, expenses, real profit, and portable .paymap.json backups without uploading financial data by default."}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {(isThai
              ? [
                  ["Obsidian-style workspace", "Sidebar, vault, search และ quick capture สำหรับงานการเงินประจำวัน"],
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
            desc: 'ลองหน้า PayMap Desktop ใน browser ก่อนแพ็กหรือติดตั้งจริง',
            icon: Monitor,
            href: '/desktop',
            cta: 'Open preview',
          }, {
            title: '.paymap.json backups',
            desc: 'ส่งออก นำเข้า และย้ายข้อมูลการเงินส่วนตัวโดยไม่ต้องเปิด Cloud Backup',
            icon: Download,
            href: '/settings?tab=data',
            cta: 'Privacy & Data',
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
