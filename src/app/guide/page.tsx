import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import PublicShell from '@/components/public/PublicShell'
import { V151_ROUTE_MODE_LABELS, getRoutesByMode } from '@/lib/v151-route-map'

const MODE_STEPS = [
  ['1. เลือก context ให้ตรงงาน', 'เริ่มจาก Personal, Business หรือ Merchant แล้วให้ระบบพาคุณไปยัง shell ที่ตรงกับงานแทนการสลับหน้าตาไปมา'],
  ['2. ใช้ command palette', 'กด Ctrl/Cmd + K เพื่อค้นหา route หรือ G ตามด้วยตัวอักษรลัดเพื่อกระโดดไปยัง module สำคัญทันที'],
  ['3. ทำงานผ่าน dashboard แล้วลงลึกทีละ module', 'overview ใช้ดูภาพรวม ส่วน table workbench, analytics, settings hub และ POS ใช้ทำงานจริงรายหน้า'],
  ['4. ตั้งค่า workspace และ billing ครั้งเดียว', 'จากนั้น flow หลักจะไหลต่อเนื่องขึ้นทั้ง personal, business และ merchant'],
]

const MODE_ORDER = ['public', 'personal', 'business', 'merchant', 'admin'] as const

export default function GuidePage() {
  return (
    <PublicShell
      eyebrow="PayMap v15.1 Guide"
      title="คู่มือการใช้งานฉบับรวมทุก route"
      description="เอกสารหน้านี้สรุปเส้นทางใช้งานของ PayMap v15.1 ตามโครงสร้าง route และ context shell เดียวกัน เพื่อให้เริ่มใช้งานได้เร็วขึ้นบน PC"
      ctaHref="/login"
      ctaLabel="เข้าสู่ระบบ"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <div className="space-y-6">
          <section className="public-panel-v72">
            <div className="public-section-label">Getting started</div>
            <h2 className="text-2xl font-black">ลำดับเริ่มใช้งานที่สั้นและตรงที่สุด</h2>
            <div className="mt-5 space-y-3">
              {MODE_STEPS.map(([title, body]) => (
                <div key={title} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="font-bold">{title}</div>
                  <div className="mt-1 text-sm leading-7 text-[var(--text-2)]">{body}</div>
                </div>
              ))}
            </div>
          </section>

          {MODE_ORDER.map((mode) => {
            const routes = getRoutesByMode(mode)
            if (!routes.length) return null
            return (
              <section key={mode} className="public-panel-v72">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="public-section-label">{V151_ROUTE_MODE_LABELS[mode]}</div>
                    <h2 className="text-2xl font-black">{routes.length} routes ในกลุ่ม {V151_ROUTE_MODE_LABELS[mode]}</h2>
                  </div>
                  <div className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[var(--text-3)]">
                    {mode}
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {routes.map((route) => (
                    <div key={route.path} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="font-bold text-[var(--text)]">{route.name}</div>
                        <code className="rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-xs text-[var(--text-3)]">{route.path}</code>
                      </div>
                      <div className="mt-1 text-sm leading-7 text-[var(--text-2)]">{route.description}</div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        <aside className="space-y-6 min-w-0">
          <section className="public-panel-v72 public-panel-v72-soft">
            <div className="public-section-label">Quick access</div>
            <h2 className="text-xl font-black">ทางลัดที่ใช้บ่อย</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-2)]">
              {[
                'Ctrl/Cmd + K เปิด command palette',
                'G แล้วตามด้วย D = Dashboard, B = Business, M = Merchant, P = POS',
                'G + S = Settings, W = Wallets, R = Reports, A = Analytics, H = Help',
                'Landing page จะ redirect อัตโนมัติถ้า session ยัง active อยู่',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3">
                  <CheckCircle2 size={16} className="mt-1 shrink-0 text-[var(--primary)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="public-panel-v72">
            <div className="public-section-label">Next actions</div>
            <h2 className="text-xl font-black">หน้าที่ควรเข้าไปตรวจต่อหลัง setup</h2>
            <div className="mt-5 space-y-3">
              {[
                ['/status', 'ตรวจ readiness ของ env และ service'],
                ['/billing', 'เช็ก plan, invoice และการอัปเกรด'],
                ['/settings', 'ตั้งค่า shell, language, currency และ legal'],
                ['/workspace/select', 'จัดการ workspace และ context ที่จะใช้งาน'],
              ].map(([href, text]) => (
                <Link key={href} href={href} className="flex items-center justify-between rounded-[20px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold hover:bg-[var(--surface-3)]">
                  <span>{text}</span>
                  <ArrowRight size={14} className="text-[var(--text-3)]" />
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </PublicShell>
  )
}
