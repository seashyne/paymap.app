"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { apiJson, InlineNotice, WorkbenchSection } from "@/shared/components/workbench/shared"

type Organization = { id: string; name: string; slug: string; myRole: string; members: number; teams: number; employees: number }
type Workspace = { slug: string; name: string; type?: string; href?: string; myRole?: string }
type Member = { id: string; role: string; title?: string | null; user: { id: string; name: string; email: string } }

export default function EnterpriseControlsWorkbench({ organizations, workspaces, initialMembers = [] }: { organizations: Organization[]; workspaces: Workspace[]; initialMembers?: Member[] }) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [orgForm, setOrgForm] = useState({ name: "", slug: "", currency: "THB", country: "TH" })
  const [workspaceForm, setWorkspaceForm] = useState({ name: "", type: "business", currency: "THB", country: "TH" })
  const [inviteForm, setInviteForm] = useState({ email: "", role: "member", title: "" })
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const primaryOrgId = organizations[0]?.id ?? null

  async function act(key: string, fn: () => Promise<void>) {
    setLoading(key)
    setMessage(null)
    setError(null)
    try {
      await fn()
      router.refresh()
    } catch (e: any) {
      setError(e?.message || "Action failed")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-6">
        <WorkbenchSection title="Create enterprise organization" subtitle="สร้าง organization จริงผ่าน /api/enterprise/organizations แล้วให้ control center ใช้ข้อมูลชุดเดียวกัน">
          <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); void act("org", async () => {
            await apiJson("/api/enterprise/organizations", { method: "POST", body: JSON.stringify(orgForm) })
            setMessage("สร้าง organization เรียบร้อย")
            setOrgForm({ ...orgForm, name: "", slug: "" })
          }) }}>
            <Input label="Organization name" value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} required />
            <Input label="Slug" value={orgForm.slug} onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value })} required />
            <div className="grid gap-4 grid-cols-2"><Input label="Currency" value={orgForm.currency} onChange={(e) => setOrgForm({ ...orgForm, currency: e.target.value })} /><Input label="Country" value={orgForm.country} onChange={(e) => setOrgForm({ ...orgForm, country: e.target.value })} /></div>
            <Button type="submit" loading={loading === "org"}>Create organization</Button>
          </form>
        </WorkbenchSection>

        <WorkbenchSection title="Create workspace" subtitle="สร้าง business/merchant workspace จาก control center ได้เลย ไม่ต้องกระโดดไปหน้า onboarding แยก">
          <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); void act("workspace", async () => {
            await apiJson("/api/workspaces", { method: "POST", body: JSON.stringify(workspaceForm) })
            setMessage("สร้าง workspace เรียบร้อย")
            setWorkspaceForm({ ...workspaceForm, name: "" })
          }) }}>
            <Input label="Workspace name" value={workspaceForm.name} onChange={(e) => setWorkspaceForm({ ...workspaceForm, name: e.target.value })} required />
            <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)]">Type<select className="modern-input" value={workspaceForm.type} onChange={(e) => setWorkspaceForm({ ...workspaceForm, type: e.target.value })}><option value="business">Business</option><option value="merchant">Merchant</option><option value="personal">Personal</option></select></label>
            <div className="grid gap-4 grid-cols-2"><Input label="Currency" value={workspaceForm.currency} onChange={(e) => setWorkspaceForm({ ...workspaceForm, currency: e.target.value })} /><Input label="Country" value={workspaceForm.country} onChange={(e) => setWorkspaceForm({ ...workspaceForm, country: e.target.value })} /></div>
            <Button type="submit" loading={loading === "workspace"}>Create workspace</Button>
          </form>
        </WorkbenchSection>
      </div>

      <div className="space-y-6">
        <WorkbenchSection title="Member lifecycle" subtitle="เชิญ ปรับ role และลบสมาชิกของ organization หลักได้จากหน้าเดียว">
          {!primaryOrgId ? <InlineNotice tone="neutral">สร้าง organization ก่อน จึงจะเริ่มจัดการสมาชิกได้</InlineNotice> : (
            <>
              <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); void act("invite", async () => {
                const res = await apiJson<{ data?: { member?: Member } }>("/api/workspace/members", { method: "POST", body: JSON.stringify({ orgId: primaryOrgId, email: inviteForm.email, role: inviteForm.role, title: inviteForm.title }) })
                setMembers((prev) => res?.data?.member ? [...prev, res.data.member] : prev)
                setMessage("เพิ่มสมาชิกแล้ว")
                setInviteForm({ email: "", role: "member", title: "" })
              }) }}>
                <Input label="Email" type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} required />
                <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)]">Role<select className="modern-input" value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}><option value="member">Member</option><option value="manager">Manager</option><option value="admin">Admin</option></select></label>
                <Input label="Title" value={inviteForm.title} onChange={(e) => setInviteForm({ ...inviteForm, title: e.target.value })} />
                <Button type="submit" loading={loading === "invite"}>Invite member</Button>
              </form>
              <div className="mt-4 space-y-2">
                {members.length ? members.map((member) => (
                  <div key={member.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-bold">{member.user.name}</div>
                        <div className="text-[var(--text-3)]">{member.user.email} · {member.role}</div>
                      </div>
                      <div className="flex gap-2">
                        <label className="sr-only">role</label>
                        <select className="modern-input" value={member.role} onChange={(e) => void act(`member-role-${member.id}`, async () => {
                          await apiJson("/api/workspace/members", { method: "PATCH", body: JSON.stringify({ memberId: member.id, orgId: primaryOrgId, role: e.target.value }) })
                          setMembers((prev) => prev.map((row) => row.id === member.id ? { ...row, role: e.target.value } : row))
                          setMessage(`อัปเดต role ของ ${member.user.name} แล้ว`)
                        })}>
                          <option value="member">Member</option><option value="manager">Manager</option><option value="admin">Admin</option><option value="owner">Owner</option>
                        </select>
                        <Button type="button" variant="outline" loading={loading === `member-remove-${member.id}`} onClick={() => void act(`member-remove-${member.id}`, async () => {
                          await fetch(`/api/workspace/members?memberId=${member.id}&orgId=${primaryOrgId}`, { method: "DELETE" }).then(async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j?.error || 'Remove failed') })
                          setMembers((prev) => prev.filter((row) => row.id !== member.id))
                          setMessage(`ลบ ${member.user.name} ออกจาก workspace แล้ว`)
                        })}>Remove</Button>
                      </div>
                    </div>
                  </div>
                )) : <div className="text-sm text-[var(--text-3)]">ยังไม่มีสมาชิกในรายการที่โหลดมา</div>}
              </div>
            </>
          )}
        </WorkbenchSection>

        <WorkbenchSection title="Organization list" subtitle="registry ล่าสุดของ enterprise mode">
          <div className="space-y-2">{organizations.length ? organizations.map((org) => <div key={org.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm"><div className="font-bold">{org.name}</div><div className="text-[var(--text-3)]">/{org.slug} · {org.myRole}</div><div className="mt-1 text-[var(--text-2)]">Members {org.members} · Teams {org.teams} · Employees {org.employees}</div></div>) : <div className="text-sm text-[var(--text-3)]">ยังไม่มี organization</div>}</div>
        </WorkbenchSection>

        <WorkbenchSection title="Workspace list" subtitle="ผูก enterprise controls กับ workspace routing จริงของแพลตฟอร์ม">
          <div className="space-y-2">{workspaces.length ? workspaces.map((workspace, idx) => <div key={`${workspace.slug}-${idx}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm"><div className="font-bold">{workspace.name}</div><div className="text-[var(--text-3)]">{workspace.slug} · {workspace.type || workspace.myRole || "workspace"}</div></div>) : <div className="text-sm text-[var(--text-3)]">ยังไม่มี workspace</div>}</div>
        </WorkbenchSection>

        {message ? <InlineNotice tone="success">{message}</InlineNotice> : null}
        {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
      </div>
    </div>
  )
}
