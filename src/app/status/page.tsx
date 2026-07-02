import Link from "next/link"
import { CheckCircle2, CircleDashed, ShieldAlert } from "lucide-react"
import { getRuntimeServicesStatus, getRuntimeSummary } from "@/lib/runtime-status"
import { APP_VERSION, DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { V151_ROUTE_MAP, V151_ROUTE_MODE_LABELS } from "@/lib/v151-route-map"
import { getFlowAuditSummary } from "@/lib/v152-flow-audit"

export const metadata = {
  title: "System Status — payMap",
}

export default function StatusPage() {
  const services = getRuntimeServicesStatus()
  const summary = getRuntimeSummary(services)
  const routeCounts = Object.entries(V151_ROUTE_MODE_LABELS).map(([mode, label]) => ({ label, count: V151_ROUTE_MAP.filter((item) => item.mode === mode).length }))
  const audit = getFlowAuditSummary()

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
      <section className="glass-card rounded-[34px] p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">
              PayMap {APP_VERSION} · {DASHBOARD_VERSION_LABEL}
            </div>
            <h1 className="mt-2 text-3xl font-black lg:text-5xl">System readiness dashboard</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-2)]">
              หน้านี้สรุปว่า service ภายนอกที่สำคัญของ PayMap ถูกตั้งค่าพร้อมใช้งานจริงหรือยัง เพื่อช่วยตรวจ production readiness ก่อน deploy
            </p>
          </div>
          <div className={`rounded-[24px] border px-5 py-4 ${summary.productionReadyCore ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-amber-400/20 bg-amber-400/10 text-amber-300"}`}>
            <div className="text-xs font-mono uppercase tracking-[0.16em]">Core status</div>
            <div className="mt-1 text-lg font-black">{summary.productionReadyCore ? "Core ready" : "Needs setup"}</div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="glass-card rounded-[28px] p-5">
          <div className="text-sm font-semibold text-[var(--text-2)]">Required missing</div>
          <div className="mt-2 text-3xl font-black">{summary.requiredMissing.length}</div>
          <div className="mt-2 text-sm text-[var(--text-3)]">database และ auth secret ต้องพร้อมก่อนใช้งานจริง</div>
        </div>
        <div className="glass-card rounded-[28px] p-5">
          <div className="text-sm font-semibold text-[var(--text-2)]">Optional missing</div>
          <div className="mt-2 text-3xl font-black">{summary.optionalMissing.length}</div>
          <div className="mt-2 text-sm text-[var(--text-3)]">stripe, email, firebase, r2, ai, redis เปิดเพิ่มตาม feature ที่ใช้งาน</div>
        </div>
        <div className="glass-card rounded-[28px] p-5">
          <div className="text-sm font-semibold text-[var(--text-2)]">Next actions</div>
          <div className="mt-2 text-sm leading-7 text-[var(--text-3)]">
            ตั้งค่า env ให้ครบ แล้วตรวจต่อที่ <code>/api/health?public=1</code> และ flow login / upload / billing
          </div>
        </div>
      </section>

      <section className="mt-8 glass-card rounded-[28px] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-lg font-black">Route coverage in v15.2</div>
            <div className="mt-2 text-sm leading-7 text-[var(--text-2)]">สรุปจำนวน route ที่ถูก map ไว้ใน public, personal, business, merchant และ admin รวมถึงใช้เป็นฐานตรวจ regression หลัง build, auth guard, และ desktop-only enforcement</div>
          </div>
          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold">Total routes: {V151_ROUTE_MAP.length}</div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {routeCounts.map((item) => (
            <div key={item.label} className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">{item.label}</div>
              <div className="mt-2 text-2xl font-black">{item.count}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-[20px] border border-emerald-400/20 bg-emerald-400/10 p-4">
            <div className="text-xs font-mono uppercase tracking-[0.16em] text-emerald-200">Wired</div>
            <div className="mt-2 text-2xl font-black text-emerald-100">{audit.wired}</div>
          </div>
          <div className="rounded-[20px] border border-amber-400/20 bg-amber-400/10 p-4">
            <div className="text-xs font-mono uppercase tracking-[0.16em] text-amber-200">Partial</div>
            <div className="mt-2 text-2xl font-black text-amber-100">{audit.partial}</div>
          </div>
          <div className="rounded-[20px] border border-slate-400/20 bg-slate-400/10 p-4">
            <div className="text-xs font-mono uppercase tracking-[0.16em] text-slate-200">UI-only</div>
            <div className="mt-2 text-2xl font-black text-slate-100">{audit.uiOnly}</div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        {services.map((service) => {
          const ok = service.configured
          const Icon = ok ? CheckCircle2 : service.severity === "required" ? ShieldAlert : CircleDashed
          return (
            <div key={service.key} className="glass-card rounded-[28px] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{service.severity}</div>
                  <div className="mt-1 text-xl font-black">{service.label}</div>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${ok ? "bg-emerald-400/12 text-emerald-300" : service.severity === "required" ? "bg-amber-400/12 text-amber-300" : "bg-sky-400/12 text-sky-300"}`}>
                  <Icon size={14} /> {ok ? "Configured" : "Pending"}
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">{service.note}</p>
            </div>
          )
        })}
      </section>

      <section className="mt-8 glass-card rounded-[28px] p-6">
        <div className="text-lg font-black">Suggested verification order</div>
        <ol className="mt-4 grid gap-3 text-sm leading-7 text-[var(--text-2)] lg:grid-cols-2">
          <li>1. ตรวจ <code>DATABASE_URL</code> และ <code>AUTH_SECRET</code></li>
          <li>2. รัน <code>bun run build</code> และ <code>bun run dev</code></li>
          <li>3. ทดสอบ login / register / forgot password</li>
          <li>4. ทดสอบ settings theme + persistence</li>
          <li>5. ทดสอบ upload รูปสินค้าและรูปโปรไฟล์</li>
          <li>6. ทดสอบ stripe checkout, portal และ webhook</li>
          <li>7. ทดสอบ reports, merchant POS, business finance และ help/legal pages</li>
        </ol>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/help" className="btn-outline">Open Help Center</Link>
          <Link href="/dashboard" className="btn-primary">Back to product</Link>
        </div>
      </section>
    </main>
  )
}
