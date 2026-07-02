"use client"
// v1.3: Business Workspace Panel — multi-user, multi-role shared workspace
import { useState, useEffect, useCallback } from "react"
import { Users, Plus, Shield, ChevronDown, X, Loader2, Building2, Star, Settings } from "lucide-react"

type OrgRole = "owner" | "admin" | "manager" | "accountant" | "member" | "viewer"

const ROLE_LABELS: Record<OrgRole, string> = {
  owner:      "Owner",
  admin:      "Admin",
  manager:    "Manager",
  accountant: "Accountant",
  member:     "Member",
  viewer:     "Viewer (อ่านอย่างเดียว)",
}

const ROLE_COLORS: Record<OrgRole, string> = {
  owner:      "#f59e0b",
  admin:      "#8b5cf6",
  manager:    "#38bdf8",
  accountant: "#34d399",
  member:     "#94a3b8",
  viewer:     "#64748b",
}

type Member = {
  id: string
  role: OrgRole
  title: string | null
  joinedAt: string
  user: { id: string; name: string; email: string; image: string | null }
}

type Workspace = {
  id: string
  name: string
  slug: string
  myRole: OrgRole
  members: number
  teams: number
  plan: string
  currency: string
}

export default function WorkspacePanel() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWs, setActiveWs] = useState<Workspace | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [membersLoading, setMembersLoading] = useState(false)
  const [showCreateWs, setShowCreateWs] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Create workspace form
  const [wsName, setWsName] = useState("")
  const [wsSlug, setWsSlug] = useState("")

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<OrgRole>("member")
  const [inviteTitle, setInviteTitle] = useState("")
  const [inviting, setInviting] = useState(false)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const loadWorkspaces = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/workspace")
      const data = await res.json()
      if (data.workspaces) {
        setWorkspaces(data.workspaces)
        if (!activeWs && data.workspaces.length > 0) setActiveWs(data.workspaces[0])
      }
    } catch {
      showToast("โหลด workspace ไม่สำเร็จ", false)
    } finally {
      setLoading(false)
    }
  }, [activeWs])

  const loadMembers = useCallback(async (orgId: string) => {
    setMembersLoading(true)
    try {
      const res = await fetch(`/api/workspace/members?orgId=${orgId}`)
      const data = await res.json()
      if (data.members) setMembers(data.members)
    } catch {
      showToast("โหลดสมาชิกไม่สำเร็จ", false)
    } finally {
      setMembersLoading(false)
    }
  }, [])

  useEffect(() => { loadWorkspaces() }, [])
  useEffect(() => { if (activeWs) loadMembers(activeWs.id) }, [activeWs])

  const handleCreateWs = async () => {
    if (!wsName.trim()) return
    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: wsName, slug: wsSlug || wsName.toLowerCase().replace(/\s+/g, "-"), currency: "THB" }),
    })
    const data = await res.json()
    if (res.ok) {
      showToast("สร้าง Workspace สำเร็จ", true)
      setShowCreateWs(false)
      setWsName(""); setWsSlug("")
      await loadWorkspaces()
    } else {
      showToast(data.error || "เกิดข้อผิดพลาด", false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !activeWs) return
    setInviting(true)
    try {
      const res = await fetch("/api/workspace/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: activeWs.id, email: inviteEmail, role: inviteRole, title: inviteTitle }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast(`เพิ่ม ${inviteEmail} สำเร็จ`, true)
        setShowInvite(false); setInviteEmail(""); setInviteRole("member"); setInviteTitle("")
        await loadMembers(activeWs.id)
      } else {
        showToast(data.error || "เกิดข้อผิดพลาด", false)
      }
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (memberId: string, name: string) => {
    if (!activeWs || !confirm(`ต้องการนำ ${name} ออกจาก workspace?`)) return
    const res = await fetch(`/api/workspace/members?memberId=${memberId}&orgId=${activeWs.id}`, { method: "DELETE" })
    if (res.ok) {
      showToast(`นำ ${name} ออกสำเร็จ`, true)
      setMembers(prev => prev.filter(m => m.id !== memberId))
    } else {
      const d = await res.json()
      showToast(d.error || "ลบไม่สำเร็จ", false)
    }
  }

  const canManage = activeWs && ["owner", "admin"].includes(activeWs.myRole)

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-xl transition-all ${toast.ok ? "bg-emerald-500" : "bg-rose-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Workspace Selector Header */}
      <div className="glass-card rounded-[28px] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-sky-500/15 p-2.5"><Building2 size={16} className="text-sky-400" /></div>
            <div>
              <div className="text-sm font-black">Business Workspace</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">shared team workspace</div>
            </div>
          </div>
          <button
            onClick={() => setShowCreateWs(true)}
            className="flex items-center gap-1.5 rounded-xl bg-sky-500/15 px-3 py-2 text-xs font-bold text-sky-400 hover:bg-sky-500/25 transition-colors"
          >
            <Plus size={13} /> สร้าง Workspace
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--text-3)]">
            <Loader2 size={14} className="animate-spin" /> กำลังโหลด...
          </div>
        ) : workspaces.length === 0 ? (
          <div className="soft-panel rounded-[20px] p-4 text-center">
            <div className="text-sm text-[var(--text-2)]">ยังไม่มี Workspace</div>
            <div className="text-xs text-[var(--text-3)] mt-1">กด "สร้าง Workspace" เพื่อเริ่มต้น</div>
          </div>
        ) : (
          <div className="grid gap-2">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setActiveWs(ws)}
                className={`soft-panel rounded-[20px] p-4 text-left transition-all ${activeWs?.id === ws.id ? "ring-2 ring-sky-500/40" : "hover:ring-1 hover:ring-[var(--border2)]"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm">{ws.name}</div>
                    <div className="text-[11px] text-[var(--text-3)] mt-0.5">@{ws.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg"
                      style={{ background: `${ROLE_COLORS[ws.myRole]}22`, color: ROLE_COLORS[ws.myRole] }}>
                      {ROLE_LABELS[ws.myRole]}
                    </span>
                    <div className="text-xs text-[var(--text-3)]">{ws.members} คน</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Members Panel */}
      {activeWs && (
        <div className="glass-card rounded-[28px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-violet-500/15 p-2.5"><Users size={16} className="text-violet-400" /></div>
              <div>
                <div className="text-sm font-black">สมาชิก — {activeWs.name}</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{members.length} คน</div>
              </div>
            </div>
            {canManage && (
              <button
                onClick={() => setShowInvite(true)}
                className="flex items-center gap-1.5 rounded-xl bg-violet-500/15 px-3 py-2 text-xs font-bold text-violet-400 hover:bg-violet-500/25 transition-colors"
              >
                <Plus size={13} /> เชิญสมาชิก
              </button>
            )}
          </div>

          {membersLoading ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-3)]">
              <Loader2 size={14} className="animate-spin" /> โหลดสมาชิก...
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="soft-panel rounded-[18px] p-3.5 flex items-center gap-3">
                  <div className="h-9 w-9 flex-shrink-0 rounded-xl overflow-hidden bg-[var(--surface2)] flex items-center justify-center text-sm font-black">
                    {m.user.image ? <img src={m.user.image} alt="" className="h-full w-full object-cover" /> : m.user.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate flex items-center gap-1.5">
                      {m.user.name}
                      {m.role === "owner" && <Star size={11} className="text-amber-400 flex-shrink-0" />}
                    </div>
                    <div className="text-[11px] text-[var(--text-3)] truncate">{m.user.email}</div>
                    {m.title && <div className="text-[11px] text-[var(--text-2)]">{m.title}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg"
                      style={{ background: `${ROLE_COLORS[m.role]}22`, color: ROLE_COLORS[m.role] }}>
                      {ROLE_LABELS[m.role]}
                    </span>
                    {canManage && m.role !== "owner" && (
                      <button
                        onClick={() => handleRemove(m.id, m.user.name)}
                        className="rounded-lg p-1.5 text-[var(--text-3)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Role Legend */}
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)] mb-3 flex items-center gap-1.5">
              <Shield size={10} /> ระดับสิทธิ์
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(ROLE_LABELS) as [OrgRole, string][]).map(([role, label]) => (
                <div key={role} className="flex items-center gap-2 text-[11px]">
                  <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: ROLE_COLORS[role] }} />
                  <span className="text-[var(--text-2)]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Workspace */}
      {showCreateWs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card rounded-[28px] p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="font-black">สร้าง Workspace ใหม่</div>
              <button onClick={() => setShowCreateWs(false)} className="rounded-xl p-1.5 hover:bg-[var(--surface2)]"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--text-3)] mb-1.5 block">ชื่อองค์กร / ทีม *</label>
                <input
                  className="w-full rounded-xl bg-[var(--surface2)] border border-[var(--border)] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  placeholder="เช่น ABC Company"
                  value={wsName}
                  onChange={e => { setWsName(e.target.value); if (!wsSlug) setWsSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")) }}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] mb-1.5 block">Slug (URL)</label>
                <input
                  className="w-full rounded-xl bg-[var(--surface2)] border border-[var(--border)] px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  placeholder="abc-company"
                  value={wsSlug}
                  onChange={e => setWsSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                />
              </div>
              <button
                onClick={handleCreateWs}
                disabled={!wsName.trim()}
                className="w-full rounded-xl bg-sky-500 py-2.5 text-sm font-bold text-white disabled:opacity-40 hover:bg-sky-400 transition-colors"
              >
                สร้าง Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Invite Member */}
      {showInvite && activeWs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card rounded-[28px] p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="font-black">เชิญสมาชิก</div>
              <button onClick={() => setShowInvite(false)} className="rounded-xl p-1.5 hover:bg-[var(--surface2)]"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--text-3)] mb-1.5 block">Email ผู้ใช้ในระบบ *</label>
                <input
                  className="w-full rounded-xl bg-[var(--surface2)] border border-[var(--border)] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  placeholder="user@example.com"
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] mb-1.5 block">บทบาท</label>
                <select
                  className="w-full rounded-xl bg-[var(--surface2)] border border-[var(--border)] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as OrgRole)}
                >
                  {(Object.entries(ROLE_LABELS) as [OrgRole, string][])
                    .filter(([r]) => r !== "owner")
                    .map(([role, label]) => (
                      <option key={role} value={role}>{label}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] mb-1.5 block">ตำแหน่ง (ไม่บังคับ)</label>
                <input
                  className="w-full rounded-xl bg-[var(--surface2)] border border-[var(--border)] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  placeholder="เช่น นักบัญชี, ผู้จัดการฝ่ายขาย"
                  value={inviteTitle}
                  onChange={e => setInviteTitle(e.target.value)}
                />
              </div>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviting}
                className="w-full rounded-xl bg-violet-500 py-2.5 text-sm font-bold text-white disabled:opacity-40 hover:bg-violet-400 transition-colors flex items-center justify-center gap-2"
              >
                {inviting && <Loader2 size={14} className="animate-spin" />}
                เชิญสมาชิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
