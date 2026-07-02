"use client"
// v1.8: Business onboarding wizard — guides new users through org setup
import { useState } from "react"
import { Building2, Users, Check, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

type Step = "org" | "employee" | "done"

export default function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep]       = useState<Step>("org")
  const [orgName, setOrgName] = useState("")
  const [orgId, setOrgId]     = useState<string | null>(null)
  const [empName, setEmpName] = useState("")
  const [salary, setSalary]   = useState("")
  const [position, setPosition] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function createOrg() {
    if (!orgName.trim()) return setError("กรุณาระบุชื่อองค์กร")
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName.trim(), currency: "THB", country: "TH" }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error ?? "สร้างองค์กรไม่สำเร็จ")
      const workspace = data?.data?.workspace ?? data?.workspace ?? data?.organization ?? null
      if (!workspace?.id) return setError("สร้างองค์กรไม่สำเร็จ: ไม่พบรหัส workspace")
      setOrgId(workspace.id)
      setStep("employee")
    } finally { setLoading(false) }
  }

  async function addEmployee() {
    if (!empName.trim() || !salary) return setError("กรุณาระบุชื่อและเงินเดือน")
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/business/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          name: empName.trim(),
          position: position || "พนักงาน",
          baseSalary: Number(salary),
          startDate: new Date().toISOString(),
          employmentType: "fulltime",
        }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error ?? "เพิ่มพนักงานไม่สำเร็จ")
      setStep("done")
    } finally { setLoading(false) }
  }

  function finish() {
    router.push("/business?tab=overview")
    router.refresh()
  }

  const steps = [
    { id: "org",      label: "สร้างองค์กร", done: !!orgId },
    { id: "employee", label: "เพิ่มพนักงาน", done: step === "done" },
    { id: "done",     label: "เสร็จสิ้น",   done: step === "done" },
  ]

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      {/* Progress */}
      <div className="mb-8 flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-colors ${
              s.done ? "bg-emerald-500 text-white" :
              step === s.id ? "bg-[#38bdf8] text-white" :
              "bg-[var(--surface2)] text-[var(--text-3)]"
            }`}>
              {s.done ? <Check size={13} /> : i + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${step === s.id ? "text-[var(--text)]" : "text-[var(--text-3)]"}`}>{s.label}</span>
            {i < steps.length - 1 && <div className={`mx-2 h-px w-8 sm:w-12 ${s.done ? "bg-emerald-500" : "bg-[var(--border)]"}`} />}
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[28px] p-7">
        {step === "org" && (
          <>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15">
              <Building2 size={22} className="text-sky-400" />
            </div>
            <h2 className="text-xl font-black">ตั้งชื่อองค์กรของคุณ</h2>
            <p className="mt-1 text-sm text-[var(--text-2)]">ใช้สำหรับ HR, Payroll, และการจัดการทีม</p>
            <div className="mt-5 space-y-3">
              <input
                value={orgName} onChange={e => setOrgName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createOrg()}
                placeholder="เช่น บริษัท สมิธ จำกัด"
                autoFocus
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface2)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              />
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <button onClick={createOrg} disabled={loading || !orgName.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 py-3 text-sm font-black text-white disabled:opacity-50 transition-opacity"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                สร้างองค์กร
              </button>
            </div>
          </>
        )}

        {step === "employee" && (
          <>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15">
              <Users size={22} className="text-violet-400" />
            </div>
            <h2 className="text-xl font-black">เพิ่มพนักงานคนแรก</h2>
            <p className="mt-1 text-sm text-[var(--text-2)]">ข้ามได้ — เพิ่มในหน้า Employees ทีหลังก็ได้</p>
            <div className="mt-5 space-y-3">
              <input value={empName} onChange={e => setEmpName(e.target.value)}
                placeholder="ชื่อพนักงาน"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface2)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40"
              />
              <input value={position} onChange={e => setPosition(e.target.value)}
                placeholder="ตำแหน่ง (ไม่บังคับ)"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface2)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40"
              />
              <input type="number" value={salary} onChange={e => setSalary(e.target.value)}
                placeholder="เงินเดือน (บาท)"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface2)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40"
              />
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <button onClick={addEmployee} disabled={loading || !empName.trim() || !salary}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 py-3 text-sm font-black text-white disabled:opacity-50"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                เพิ่มพนักงาน
              </button>
              <button onClick={() => setStep("done")} className="w-full py-2 text-xs text-[var(--text-3)] hover:text-[var(--text)] transition-colors">
                ข้ามขั้นตอนนี้ →
              </button>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
              <Check size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-black">พร้อมใช้งานแล้ว!</h2>
            <p className="mt-2 text-sm text-[var(--text-2)]">Workspace ของคุณถูกตั้งค่าเรียบร้อย — ลองเพิ่มพนักงาน คำนวณ Payroll หรือจัดการการลาได้เลย</p>
            <button onClick={finish}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-black text-white"
            >
              <ArrowRight size={15} />
              เข้าสู่ Business Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
