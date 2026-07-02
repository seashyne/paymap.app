"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, CalendarClock, FileSpreadsheet, Users } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { apiJson, InlineNotice, WorkbenchSection, formatMoney } from "@/shared/components/workbench/shared"
import { getClientSiteLang } from "@/lib/i18n/runtime"
import { getWorkspaceMessages } from "@/lib/i18n/workspace"

type Employee = { id: string; name: string; position: string | null; department: string | null; baseSalary: number }
type PayrollRun = { id: string; month: number; year: number; status: string; totalGross: number; totalNet: number }
type LeaveRow = { id: string; employeeName: string; leaveType: string; days: number; status: string; note?: string | null; reason?: string | null }

function InfoCard({ label, value, hint, icon: Icon, accent }: { label: string; value: string; hint: string; icon: React.ComponentType<any>; accent: string }) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{label}</div>
        <div className="flex h-10 w-10 items-center justify-center rounded-[16px]" style={{ background: `${accent}18`, color: accent }}>
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-3 text-2xl font-black tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-[var(--text-3)]">{hint}</div>
    </div>
  )
}

export default function BusinessPayrollWorkbench({
  organizationId,
  employees,
  latestRuns,
  pendingLeaves = [],
}: {
  organizationId: string | null
  employees: Employee[]
  latestRuns: PayrollRun[]
  pendingLeaves?: LeaveRow[]
}) {
  const router = useRouter()
  const lang = getClientSiteLang()
  const wm = getWorkspaceMessages(lang).workbench
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    startDate: new Date().toISOString().slice(0, 10),
    baseSalary: "25000",
    employmentType: "fulltime",
    currency: "THB",
  })
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)
  const [editEmployeeForm, setEditEmployeeForm] = useState({ name: "", position: "", department: "", baseSalary: "0", status: "active" })
  const [leaveForm, setLeaveForm] = useState({
    employeeId: employees[0]?.id ?? "",
    leaveType: "annual",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    days: "1",
    reason: "",
  })
  const [payrollForm, setPayrollForm] = useState(() => {
    const now = new Date()
    return { month: String(now.getMonth() + 1), year: String(now.getFullYear()) }
  })

  const payrollSummary = useMemo(() => latestRuns[0] ?? null, [latestRuns])
  const totalBaseSalary = useMemo(() => employees.reduce((sum, employee) => sum + employee.baseSalary, 0), [employees])
  const leavePendingCount = pendingLeaves.filter((leave) => leave.status === "pending").length

  async function act(key: string, fn: () => Promise<void>) {
    setLoading(key)
    setMessage(null)
    setError(null)
    try {
      await fn()
      router.refresh()
    } catch (e: any) {
      setError(e?.message || wm.actionFailed)
    } finally {
      setLoading(null)
    }
  }

  if (!organizationId) {
    return (
      <WorkbenchSection title={wm.payrollWorkbench[0]} subtitle={wm.payrollWorkbench[1]}>
        <InlineNotice tone="danger">{wm.noOrganization}</InlineNotice>
      </WorkbenchSection>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-[var(--border)] p-6 lg:p-8" style={{ background: "radial-gradient(circle at top right, rgba(56,189,248,.16), transparent 24%), var(--card)" }}>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#38bdf8]">Business payroll cockpit</div>
              <div className="rounded-full bg-[rgba(56,189,248,.12)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#38bdf8]">Live database mode</div>
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight lg:text-[42px]">Employee, leave และ payroll run อยู่ในหน้าเดียว</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-2)]">
              หน้า payroll ถูกจัดใหม่ให้เหมือน operation cockpit สำหรับทีม finance และ HR โดยยังยิง route เดิมทั้งหมดของระบบ ทั้งการเพิ่มพนักงาน, อนุมัติลา และปิด payroll run
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoCard label="Active employees" value={String(employees.length)} hint="master data พร้อมใช้งาน" icon={Users} accent="#38bdf8" />
              <InfoCard label="Pending leave" value={String(leavePendingCount)} hint="รายการที่ต้องตัดสินใจ" icon={CalendarClock} accent="#8b5cf6" />
              <InfoCard label="Base payroll" value={formatMoney(totalBaseSalary)} hint="เงินเดือนตั้งต้นรวม" icon={Building2} accent="#22c55e" />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Latest payroll run</div>
              <div className="mt-3 text-2xl font-black">{payrollSummary ? `${payrollSummary.month}/${payrollSummary.year}` : "Not started"}</div>
              <div className="mt-1 text-sm text-[var(--text-2)] capitalize">{payrollSummary?.status ?? "draft"}</div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--border)]">
                <div className="h-full rounded-full bg-[#38bdf8]" style={{ width: payrollSummary ? (payrollSummary.status === "paid" ? "100%" : payrollSummary.status === "approved" ? "72%" : "38%") : "12%" }} />
              </div>
            </div>
            <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <div className="text-sm font-bold">Quick actions</div>
              <div className="mt-3 grid gap-2">
                <button type="button" onClick={() => document.getElementById("employee-lifecycle")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm font-semibold">เพิ่มพนักงานใหม่</button>
                <button type="button" onClick={() => document.getElementById("leave-lifecycle")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm font-semibold">อนุมัติคำขอลา</button>
                <button type="button" onClick={() => document.getElementById("payroll-lifecycle")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm font-semibold">สร้าง payroll run</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.18fr_.82fr]">
        <div className="space-y-6">
          <div id="employee-lifecycle">
            <WorkbenchSection title={wm.employeeLifecycle[0]} subtitle={wm.employeeLifecycle[1]}>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  void act("employee", async () => {
                    await apiJson("/api/business/employees", {
                      method: "POST",
                      body: JSON.stringify({ organizationId, ...employeeForm, baseSalary: Number(employeeForm.baseSalary) }),
                    })
                    setMessage(wm.successEmployee)
                    setEmployeeForm((state) => ({ ...state, name: "", email: "", position: "", department: "" }))
                  })
                }}
              >
                <Input label="ชื่อพนักงาน" value={employeeForm.name} onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })} required />
                <Input label="อีเมล" type="email" value={employeeForm.email} onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} />
                <Input label="ตำแหน่ง" value={employeeForm.position} onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })} />
                <Input label="แผนก" value={employeeForm.department} onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })} />
                <Input label="วันเริ่มงาน" type="date" value={employeeForm.startDate} onChange={(e) => setEmployeeForm({ ...employeeForm, startDate: e.target.value })} required />
                <Input label="เงินเดือน" type="number" min="1" value={employeeForm.baseSalary} onChange={(e) => setEmployeeForm({ ...employeeForm, baseSalary: e.target.value })} required />
                <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)]">
                  รูปแบบการจ้าง
                  <select className="modern-input" value={employeeForm.employmentType} onChange={(e) => setEmployeeForm({ ...employeeForm, employmentType: e.target.value })}>
                    <option value="fulltime">Full-time</option>
                    <option value="parttime">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)]">
                  สกุลเงิน
                  <select className="modern-input" value={employeeForm.currency} onChange={(e) => setEmployeeForm({ ...employeeForm, currency: e.target.value })}>
                    <option value="THB">THB</option>
                    <option value="USD">USD</option>
                  </select>
                </label>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" loading={loading === "employee"}>{wm.addEmployee}</Button>
                </div>
              </form>

              <div className="mt-6 grid gap-3">
                {employees.length ? employees.slice(0, 10).map((employee) => {
                  const editing = editingEmployeeId === employee.id
                  return (
                    <div key={employee.id} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">
                      {editing ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input label="ชื่อ" value={editEmployeeForm.name} onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, name: e.target.value })} />
                          <Input label="ตำแหน่ง" value={editEmployeeForm.position} onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, position: e.target.value })} />
                          <Input label="แผนก" value={editEmployeeForm.department} onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, department: e.target.value })} />
                          <Input label="เงินเดือน" type="number" value={editEmployeeForm.baseSalary} onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, baseSalary: e.target.value })} />
                          <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)] md:col-span-2">
                            สถานะ
                            <select className="modern-input" value={editEmployeeForm.status} onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, status: e.target.value })}>
                              <option value="active">Active</option>
                              <option value="on_leave">On leave</option>
                              <option value="resigned">Resigned</option>
                              <option value="terminated">Terminated</option>
                            </select>
                          </label>
                          <div className="md:col-span-2 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setEditingEmployeeId(null)}>{wm.cancel}</Button>
                            <Button type="button" loading={loading === `employee-save-${employee.id}`} onClick={() => {
                              void act(`employee-save-${employee.id}`, async () => {
                                await apiJson(`/api/business/employees/${employee.id}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    name: editEmployeeForm.name,
                                    position: editEmployeeForm.position,
                                    department: editEmployeeForm.department,
                                    baseSalary: Number(editEmployeeForm.baseSalary),
                                    status: editEmployeeForm.status,
                                  }),
                                })
                                setEditingEmployeeId(null)
                                setMessage(`อัปเดต ${employee.name} แล้ว`)
                              })
                            }}>{wm.save}</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="font-bold">{employee.name}</div>
                            <div className="text-[var(--text-3)]">{employee.position || "No position"} · {employee.department || "No dept"}</div>
                            <div className="mt-1 text-[var(--text-2)]">เงินเดือน {formatMoney(employee.baseSalary)}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => {
                              setEditingEmployeeId(employee.id)
                              setEditEmployeeForm({
                                name: employee.name,
                                position: employee.position || "",
                                department: employee.department || "",
                                baseSalary: String(employee.baseSalary),
                                status: "active",
                              })
                            }}>{wm.edit}</Button>
                            <Button type="button" variant="outline" loading={loading === `employee-archive-${employee.id}`} onClick={() => {
                              void act(`employee-archive-${employee.id}`, async () => {
                                await apiJson(`/api/business/employees/${employee.id}`, { method: "DELETE" })
                                setMessage(`archive ${employee.name} แล้ว`)
                              })
                            }}>Archive</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }) : <div className="text-sm text-[var(--text-3)]">{wm.noEmployees}</div>}
              </div>
            </WorkbenchSection>
          </div>

          <div id="leave-lifecycle">
            <WorkbenchSection title="Leave lifecycle" subtitle="สร้าง request, approve / reject และ reopen ได้บนหน้าจอเดียว">
              {employees.length === 0 ? (
                <InlineNotice tone="neutral">เพิ่มพนักงานก่อน จึงจะเริ่มสร้าง leave request ได้</InlineNotice>
              ) : (
                <form
                  className="grid gap-4 md:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    void act("leave", async () => {
                      await apiJson("/api/business/leave", {
                        method: "POST",
                        body: JSON.stringify({
                          organizationId,
                          employeeId: leaveForm.employeeId,
                          leaveType: leaveForm.leaveType,
                          startDate: leaveForm.startDate,
                          endDate: leaveForm.endDate,
                          days: Number(leaveForm.days),
                          reason: leaveForm.reason,
                        }),
                      })
                      setMessage("บันทึกคำขอลาเรียบร้อย")
                    })
                  }}
                >
                  <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)]">
                    พนักงาน
                    <select className="modern-input" value={leaveForm.employeeId} onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}>
                      {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)]">
                    ประเภทการลา
                    <select className="modern-input" value={leaveForm.leaveType} onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}>
                      <option value="annual">Annual</option>
                      <option value="sick">Sick</option>
                      <option value="personal">Personal</option>
                      <option value="maternity">Maternity</option>
                      <option value="paternity">Paternity</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <Input label="เริ่มลา" type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} required />
                  <Input label="สิ้นสุด" type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} required />
                  <Input label="จำนวนวัน" type="number" min="1" step="0.5" value={leaveForm.days} onChange={(e) => setLeaveForm({ ...leaveForm, days: e.target.value })} required />
                  <Input label="เหตุผล" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
                  <div className="md:col-span-2 flex justify-end"><Button type="submit" loading={loading === "leave"}>สร้างคำขอลา</Button></div>
                </form>
              )}

              <div className="mt-6 grid gap-3">
                {pendingLeaves.length ? pendingLeaves.map((leave) => (
                  <div key={leave.id} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-bold">{leave.employeeName} · {leave.leaveType}</div>
                        <div className="text-[var(--text-3)]">{leave.days} วัน · {leave.status}</div>
                        <div className="mt-1 text-[var(--text-2)]">{leave.reason || leave.note || "No note"}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" loading={loading === `leave-approve-${leave.id}`} onClick={() => void act(`leave-approve-${leave.id}`, async () => {
                          await apiJson(`/api/business/leave/${leave.id}`, { method: "PATCH", body: JSON.stringify({ status: "approved", note: "Approved from v5.2.2 workbench" }) })
                          setMessage("อนุมัติคำขอลาแล้ว")
                        })}>Approve</Button>
                        <Button type="button" variant="outline" loading={loading === `leave-reject-${leave.id}`} onClick={() => void act(`leave-reject-${leave.id}`, async () => {
                          await apiJson(`/api/business/leave/${leave.id}`, { method: "PATCH", body: JSON.stringify({ status: "rejected", rejectedReason: "Rejected from workbench" }) })
                          setMessage("ปฏิเสธคำขอลาแล้ว")
                        })}>Reject</Button>
                        <Button type="button" variant="outline" loading={loading === `leave-reopen-${leave.id}`} onClick={() => void act(`leave-reopen-${leave.id}`, async () => {
                          await apiJson(`/api/business/leave/${leave.id}`, { method: "PATCH", body: JSON.stringify({ status: "pending", note: "Reopened" }) })
                          setMessage("เปิดคำขอลาใหม่แล้ว")
                        })}>Reopen</Button>
                      </div>
                    </div>
                  </div>
                )) : <div className="text-sm text-[var(--text-3)]">ยังไม่มี leave request ล่าสุด</div>}
              </div>
            </WorkbenchSection>
          </div>
        </div>

        <div className="space-y-6">
          <div id="payroll-lifecycle">
            <WorkbenchSection title="Payroll lifecycle" subtitle="สร้าง run, approve, mark as paid หรือ reopen เพื่อปิดรอบเดือนได้ครบขึ้น">
              <form
                className="grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  void act("payroll", async () => {
                    await apiJson("/api/business/payroll", { method: "POST", body: JSON.stringify({ organizationId, month: Number(payrollForm.month), year: Number(payrollForm.year) }) })
                    setMessage("สร้าง payroll run เรียบร้อย")
                  })
                }}
              >
                <div className="grid gap-4 grid-cols-2">
                  <Input label="เดือน" type="number" min="1" max="12" value={payrollForm.month} onChange={(e) => setPayrollForm({ ...payrollForm, month: e.target.value })} required />
                  <Input label="ปี" type="number" min="2020" value={payrollForm.year} onChange={(e) => setPayrollForm({ ...payrollForm, year: e.target.value })} required />
                </div>
                <Button type="submit" loading={loading === "payroll"}>คำนวณและสร้าง payroll run</Button>
              </form>

              {payrollSummary ? (
                <div className="mt-5 rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold">Latest run: {payrollSummary.month}/{payrollSummary.year}</div>
                      <div className="text-[var(--text-3)] capitalize">{payrollSummary.status}</div>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[rgba(56,189,248,.14)] text-[#38bdf8]">
                      <FileSpreadsheet size={18} />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] p-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-[var(--text-3)]">Gross</div>
                      <div className="mt-2 text-lg font-black">{formatMoney(payrollSummary.totalGross)}</div>
                    </div>
                    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] p-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-[var(--text-3)]">Net</div>
                      <div className="mt-2 text-lg font-black">{formatMoney(payrollSummary.totalNet)}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button" variant="outline" loading={loading === `payroll-approve-${payrollSummary.id}`} onClick={() => void act(`payroll-approve-${payrollSummary.id}`, async () => {
                      await apiJson(`/api/business/payroll/${payrollSummary.id}`, { method: "PATCH", body: JSON.stringify({ action: "approve", note: "Approved from workbench" }) })
                      setMessage("อนุมัติ payroll แล้ว")
                    })}>Approve</Button>
                    <Button type="button" variant="outline" loading={loading === `payroll-pay-${payrollSummary.id}`} onClick={() => void act(`payroll-pay-${payrollSummary.id}`, async () => {
                      await apiJson(`/api/business/payroll/${payrollSummary.id}`, { method: "PATCH", body: JSON.stringify({ action: "pay", note: "Paid from workbench" }) })
                      setMessage("บันทึกว่าจ่าย payroll แล้ว")
                    })}>Mark paid</Button>
                    <Button type="button" variant="outline" loading={loading === `payroll-reopen-${payrollSummary.id}`} onClick={() => void act(`payroll-reopen-${payrollSummary.id}`, async () => {
                      await apiJson(`/api/business/payroll/${payrollSummary.id}`, { method: "PATCH", body: JSON.stringify({ action: "reopen", note: "Reopened from workbench" }) })
                      setMessage("เปิด payroll กลับเป็น draft แล้ว")
                    })}>Reopen</Button>
                  </div>
                </div>
              ) : <div className="mt-4 text-sm text-[var(--text-3)]">ยังไม่มี payroll run</div>}
            </WorkbenchSection>
          </div>

          <section className="glass-card rounded-[30px] p-5 lg:p-6">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Payroll insights</div>
            <div className="mt-4 space-y-3">
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-sm font-bold">Run readiness</div>
                <div className="mt-2 text-sm leading-6 text-[var(--text-2)]">{employees.length ? `มีพนักงาน ${employees.length} คน พร้อมคำนวณ payroll รอบใหม่ได้ทันที` : "ยังไม่มีข้อมูลพนักงานใน organization นี้"}</div>
              </div>
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-sm font-bold">Approval queue</div>
                <div className="mt-2 text-sm leading-6 text-[var(--text-2)]">มีคำขอลารออนุมัติ {leavePendingCount} รายการ ซึ่งอาจกระทบ payroll ของงวดปัจจุบัน</div>
              </div>
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-sm font-bold">Monthly close</div>
                <div className="mt-2 text-sm leading-6 text-[var(--text-2)]">หลัง approve และ mark paid แล้ว ฝั่ง accounting สามารถรับช่วงต่อไป post journal และ close รอบเดือนได้</div>
              </div>
            </div>
          </section>

          {message ? <InlineNotice tone="success">{message}</InlineNotice> : null}
          {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
        </div>
      </div>
    </div>
  )
}
