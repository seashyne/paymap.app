import Link from "next/link"
import { ArrowRight, Cloud, Download, FileDown, HardDrive, MonitorDown, ShieldCheck } from "lucide-react"
import { LogoFull } from "@/components/ui/Logo"

export const metadata = {
  title: "PayMap Windows App",
  description: "Download PayMap for Windows. The real local-first money dashboard runs on your device.",
}

export default function DashboardPage() {
  return (
    <main className="paymap-web-gate">
      <header className="paymap-web-gate-nav">
        <Link href="/" aria-label="PayMap home">
          <LogoFull height={32} />
        </Link>
        <nav aria-label="PayMap web">
          <Link href="/pricing">Pricing</Link>
          <Link href="/login">Cloud Backup account</Link>
          <Link href="/download" className="paymap-web-gate-nav-cta">Download Windows</Link>
        </nav>
      </header>

      <section className="paymap-web-gate-hero">
        <div>
          <div className="paymap-web-gate-kicker">
            <MonitorDown size={15} />
            PayMap works best as a Windows app
          </div>
          <h1>แดชบอร์ดการเงินจริงอยู่ในแอป PayMap สำหรับ Windows</h1>
          <p>
            เว็บนี้ใช้สำหรับดาวน์โหลด ดูราคา และจัดการบัญชี Cloud Backup เท่านั้น
            ข้อมูลการเงินของคุณอยู่ในเครื่องเป็นค่าเริ่มต้นเมื่อใช้แอป Windows
          </p>
          <div className="paymap-web-gate-actions">
            <Link href="/download" className="paymap-web-gate-primary">
              ดาวน์โหลด PayMap for Windows <Download size={18} />
            </Link>
            <Link href="/desktop" className="paymap-web-gate-secondary">
              ดูตัวอย่างแอป <ArrowRight size={18} />
            </Link>
          </div>
          <div className="paymap-web-gate-note">
            <ShieldCheck size={15} />
            PayMap จะไม่อัปโหลดข้อมูลการเงินของคุณ เว้นแต่คุณเปิด Cloud Backup เอง
          </div>
        </div>

        <div className="paymap-web-gate-preview" aria-label="PayMap Windows app preview">
          <div className="paymap-web-gate-windowbar">
            <span />
            <span />
            <span />
            <strong>PayMap Desktop</strong>
          </div>
          <div className="paymap-web-gate-app">
            <aside>
              <span className="active">Overview</span>
              <span>Wallets</span>
              <span>Cash flow</span>
              <span>Privacy & Data</span>
            </aside>
            <section>
              <div className="paymap-web-gate-pill"><HardDrive size={14} /> Local Only</div>
              <h2>Your private money dashboard.</h2>
              <div className="paymap-web-gate-metrics">
                <div><span>Balance</span><strong>THB 42,180</strong></div>
                <div><span>Cash flow</span><strong>+THB 8,450</strong></div>
              </div>
              <div className="paymap-web-gate-list">
                <span />
                <span />
                <span />
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="paymap-web-gate-grid" aria-label="What runs where">
        {[
          {
            icon: HardDrive,
            title: "Windows app = งานจริง",
            body: "บันทึกรายรับ รายจ่าย กระแสเงินสด และกำไรจริงใน local vault บนเครื่องคุณ",
          },
          {
            icon: FileDown,
            title: ".paymap.json backup",
            body: "ส่งออก นำเข้า และย้ายข้อมูลได้เอง โดยไม่ต้องเปิด Cloud Backup",
          },
          {
            icon: Cloud,
            title: "Cloud Backup เป็นตัวเลือก",
            body: "เข้าสู่ระบบเฉพาะเมื่อต้องการบัญชี Cloud Backup, Sync หรือจัดการแพ็กเกจ",
          },
        ].map((item) => {
          const Icon = item.icon
          return (
            <article key={item.title} className="paymap-web-gate-card">
              <Icon size={20} />
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </article>
          )
        })}
      </section>
    </main>
  )
}
