"use client"
// v2.0: Family Workspace — fixed real usage + improved UI
import { useState, useEffect, useCallback } from "react"
import {
  Heart, Users, Plus, X, Loader2, TrendingUp, TrendingDown,
  Wallet, Crown, UserCheck, Copy, Check, AlertCircle
} from "lucide-react"

type FamilyRole = "owner" | "spouse" | "adult" | "child"
const ROLE_TH: Record<FamilyRole, string> = { owner: "เจ้าของ", spouse: "คู่สมรส", adult: "สมาชิก", child: "บุตร/หลาน" }
const ROLE_COLOR: Record<FamilyRole, string> = { owner: "#f59e0b", spouse: "#ec4899", adult: "#60a5fa", child: "#a78bfa" }

type Member = {
  id: string; role: FamilyRole; nickname: string | null
  user: { id: string; name: string; email: string; image: string | null }
  income: number; expense: number; net: number
}
type Family = {
  id: string; name: string; currency: string; myRole: FamilyRole
  members: { id: string; role: FamilyRole; nickname: string | null; user: { id: string; name: string; email: string; image: string | null } }[]
  budgetCount: number
}
type FamilySummary = {
  familyName: string; currency: string
  totalIncome: number; totalExpense: number; net: number
  memberSummary: Member[]; month: number; year: number
}

function fmt(n: number, currency = "THB") {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)
}
const MONTH_TH = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ msg, ok, onClose }: { msg: string; ok: boolean; onClose: () => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-2xl"
      style={{ background: ok ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)", backdropFilter: "blur(10px)" }}>
      {ok ? <Check size={15} /> : <AlertCircle size={15} />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={13} /></button>
    </div>
  )
}

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ user, nickname, size = 10 }: { user: { name: string; image: string | null }; nickname?: string | null; size?: number }) {
  const label = (nickname || user.name)[0]?.toUpperCase()
  return (
    <div className={`h-${size} w-${size} rounded-xl overflow-hidden flex items-center justify-center text-sm font-black shrink-0`}
      style={{ background: "rgba(255,255,255,0.1)" }}>
      {user.image
        ? <img src={user.image} alt="" className="h-full w-full object-cover" />
        : <span style={{ color: "rgba(255,255,255,0.7)" }}>{label}</span>
      }
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function FamilyPanel() {
  const [families, setFamilies]       = useState<Family[]>([])
  const [active, setActive]           = useState<Family | null>(null)
  const [summary, setSummary]         = useState<FamilySummary | null>(null)
  const [loading, setLoading]         = useState(true)
  const [sumLoading, setSumLoading]   = useState(false)
  const [showCreate, setShowCreate]   = useState(false)
  const [showInvite, setShowInvite]   = useState(false)
  const [newName, setNewName]         = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole]   = useState<FamilyRole>("adult")
  const [inviteNick, setInviteNick]   = useState("")
  const [creating, setCreating]       = useState(false)
  const [inviting, setInviting]       = useState(false)
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null)
  const [removingId, setRemovingId]   = useState<string | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Load families ──────────────────────────────────────────────────────
  const loadFamilies = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/family")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "โหลดไม่สำเร็จ")
      const list: Family[] = data.families ?? []
      setFamilies(list)
      if (list.length > 0 && !active) setActive(list[0])
    } catch (e: any) {
      showToast(e.message || "โหลดข้อมูล family ไม่สำเร็จ", false)
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line

  // ── Load summary ───────────────────────────────────────────────────────
  const loadSummary = useCallback(async (id: string) => {
    setSumLoading(true)
    try {
      const res  = await fetch(`/api/family/summary?familyId=${id}`)
      const data = await res.json()
      if (res.ok && data.summary) setSummary(data.summary)
    } catch {} finally { setSumLoading(false) }
  }, [])

  useEffect(() => { loadFamilies() }, []) // eslint-disable-line
  useEffect(() => { if (active) loadSummary(active.id) }, [active]) // eslint-disable-line

  // ── Create family ──────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res  = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "สร้างไม่สำเร็จ")
      showToast(`สร้าง "${newName}" สำเร็จ! 🎉`, true)
      setShowCreate(false)
      setNewName("")
      await loadFamilies()
    } catch (e: any) {
      showToast(e.message, false)
    } finally { setCreating(false) }
  }

  // ── Invite member ──────────────────────────────────────────────────────
  const handleInvite = async () => {
    if (!inviteEmail.trim() || !active) return
    setInviting(true)
    try {
      const res  = await fetch("/api/family/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyId: active.id, email: inviteEmail.trim(), role: inviteRole, nickname: inviteNick.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "เพิ่มสมาชิกไม่สำเร็จ")
      showToast("เพิ่มสมาชิกสำเร็จ ✅", true)
      setShowInvite(false)
      setInviteEmail("")
      setInviteNick("")
      setInviteRole("adult")
      await loadFamilies()
      await loadSummary(active.id)
    } catch (e: any) {
      showToast(e.message, false)
    } finally { setInviting(false) }
  }

  // ── Remove member ──────────────────────────────────────────────────────
  const handleRemove = async (memberId: string, name: string) => {
    if (!active || !confirm(`นำ "${name}" ออกจาก family ใช่ไหม?`)) return
    setRemovingId(memberId)
    try {
      const res  = await fetch(`/api/family/members?memberId=${memberId}&familyId=${active.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "ลบสมาชิกไม่สำเร็จ")
      showToast(`นำ ${name} ออกสำเร็จ`, true)
      await loadFamilies()
    } catch (e: any) {
      showToast(e.message, false)
    } finally { setRemovingId(null) }
  }

  const canManage = active && ["owner", "spouse"].includes(active.myRole)

  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5">
      {toast && <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />}

      {/* ── Family list / header ── */}
      <div className="glass-card rounded-[28px] p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{ background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.25)" }}>
              <Heart size={16} className="text-rose-400" />
            </div>
            <div>
              <div className="text-sm font-black">Family Workspace</div>
              <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>งบประมาณร่วมกันทั้งบ้าน</div>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all hover:scale-105"
            style={{ background: "rgba(244,63,94,0.12)", color: "#fb7185", border: "1px solid rgba(244,63,94,0.2)" }}>
            <Plus size={13} /> สร้าง Family
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Loader2 size={16} className="animate-spin" /> กำลังโหลด...
          </div>
        ) : families.length === 0 ? (
          // ── Empty state ──
          <div className="rounded-[22px] p-8 text-center"
            style={{ background: "rgba(244,63,94,0.05)", border: "1px dashed rgba(244,63,94,0.2)" }}>
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
              style={{ background: "rgba(244,63,94,0.1)" }}>
              <Heart size={32} style={{ color: "rgba(244,63,94,0.5)" }} />
            </div>
            <div className="font-black text-lg mb-2">ยังไม่มี Family Workspace</div>
            <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
              สร้าง family เพื่อติดตามการเงินร่วมกันทั้งบ้าน
              ดูสรุปรายรับ-รายจ่ายของแต่ละสมาชิก
            </p>
            <button onClick={() => setShowCreate(true)}
              className="rounded-2xl px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow: "0 4px 20px rgba(244,63,94,0.35)" }}>
              + สร้าง Family แรก
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {families.map(f => (
              <button key={f.id} onClick={() => setActive(f)}
                className="w-full rounded-[20px] p-4 text-left transition-all"
                style={{
                  background: active?.id === f.id ? "rgba(244,63,94,0.08)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active?.id === f.id ? "rgba(244,63,94,0.3)" : "rgba(255,255,255,0.07)"}`,
                  boxShadow: active?.id === f.id ? "0 0 0 2px rgba(244,63,94,0.15)" : "none",
                }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Heart size={13} className="text-rose-400" />
                    <span className="font-black text-sm">{f.name}</span>
                  </div>
                  <span className="rounded-lg px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: `${ROLE_COLOR[f.myRole]}15`, color: ROLE_COLOR[f.myRole] }}>
                    {ROLE_TH[f.myRole]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {f.members.slice(0, 7).map((m, i) => (
                    <div key={m.id} className="h-7 w-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold border-2"
                      style={{ background: "rgba(255,255,255,0.1)", borderColor: "#0a0a0f", marginLeft: i > 0 ? "-6px" : "0" }}
                      title={m.nickname || m.user.name}>
                      {m.user.image
                        ? <img src={m.user.image} className="h-full w-full object-cover" alt="" />
                        : (m.nickname || m.user.name)[0]
                      }
                    </div>
                  ))}
                  <span className="text-[11px] ml-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {f.members.length} สมาชิก · {f.budgetCount} budget
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Summary ── */}
      {active && (
        <div className="space-y-4">
          {sumLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              <Loader2 size={15} className="animate-spin" /> โหลดสรุป...
            </div>
          ) : summary && (
            <>
              {/* Monthly totals */}
              <div className="glass-card rounded-[28px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-black">{summary.familyName}</div>
                    <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {MONTH_TH[summary.month]} {summary.year + 543}
                    </div>
                  </div>
                  {canManage && (
                    <button onClick={() => setShowInvite(true)}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold"
                      style={{ background: "rgba(244,63,94,0.1)", color: "#fb7185", border: "1px solid rgba(244,63,94,0.2)" }}>
                      <Plus size={12} /> เพิ่มสมาชิก
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "รายรับรวม", value: summary.totalIncome, icon: TrendingUp, color: "#4ade80" },
                    { label: "รายจ่ายรวม", value: summary.totalExpense, icon: TrendingDown, color: "#f87171" },
                    { label: "คงเหลือ", value: summary.net, icon: Wallet, color: summary.net >= 0 ? "#60a5fa" : "#f87171" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-[20px] p-4 text-center"
                      style={{ background: `${color}0a`, border: `1px solid ${color}20` }}>
                      <Icon size={14} className="mx-auto mb-1.5" style={{ color }} />
                      <div className="text-base font-black" style={{ color }}>{fmt(value, summary.currency)}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-member breakdown */}
              <div className="glass-card rounded-[28px] p-5">
                <div className="text-sm font-black mb-4 flex items-center gap-2">
                  <Users size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
                  รายละเอียดแต่ละสมาชิก
                </div>
                <div className="space-y-3">
                  {summary.memberSummary.map(m => (
                    <div key={m.id} className="rounded-[20px] p-4"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar user={m.user} nickname={m.nickname} size={10} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {m.role === "owner" && <Crown size={11} style={{ color: ROLE_COLOR.owner }} />}
                            <span className="font-bold text-sm truncate">{m.nickname || m.user.name}</span>
                          </div>
                          <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {ROLE_TH[m.role]} · {m.user.email}
                          </div>
                        </div>
                        {canManage && m.role !== "owner" && (
                          <button onClick={() => handleRemove(m.id, m.nickname || m.user.name)}
                            disabled={removingId === m.id}
                            className="rounded-lg p-1.5 transition-colors hover:bg-rose-500/15"
                            style={{ color: "rgba(255,255,255,0.3)" }}>
                            {removingId === m.id
                              ? <Loader2 size={13} className="animate-spin" />
                              : <X size={13} />
                            }
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs text-center">
                        <div>
                          <div className="font-bold" style={{ color: "#4ade80" }}>{fmt(m.income, summary.currency)}</div>
                          <div style={{ color: "rgba(255,255,255,0.35)" }}>รับ</div>
                        </div>
                        <div>
                          <div className="font-bold" style={{ color: "#f87171" }}>{fmt(m.expense, summary.currency)}</div>
                          <div style={{ color: "rgba(255,255,255,0.35)" }}>จ่าย</div>
                        </div>
                        <div>
                          <div className="font-bold" style={{ color: m.net >= 0 ? "#60a5fa" : "#f87171" }}>
                            {fmt(m.net, summary.currency)}
                          </div>
                          <div style={{ color: "rgba(255,255,255,0.35)" }}>คงเหลือ</div>
                        </div>
                      </div>

                      {m.income > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                            <span>ใช้จ่าย {Math.round((m.expense / m.income) * 100)}%</span>
                            <span>จาก {fmt(m.income, summary.currency)}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, (m.expense / m.income) * 100)}%`,
                                background: m.expense / m.income > 0.9
                                  ? "linear-gradient(90deg, #f87171, #ef4444)"
                                  : "linear-gradient(90deg, #4ade80, #22c55e)",
                              }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Modal: Create Family ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 80px rgba(0,0,0,0.7)" }}>
            <div className="flex items-center gap-2 mb-5">
              <Heart size={16} className="text-rose-400" />
              <span className="font-black">สร้าง Family Workspace</span>
            </div>
            <div className="space-y-3">
              <input
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${newName ? "rgba(244,63,94,0.4)" : "rgba(255,255,255,0.1)"}`,
                  color: "#fff",
                }}
                placeholder="ชื่อครอบครัว เช่น ครอบครัวสมิธ *"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
                  ยกเลิก
                </button>
                <button onClick={handleCreate} disabled={!newName.trim() || creating}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
                  {creating && <Loader2 size={13} className="animate-spin" />}
                  สร้าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Invite Member ── */}
      {showInvite && active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 80px rgba(0,0,0,0.7)" }}>
            <div className="font-black mb-1">เพิ่มสมาชิกใน {active.name}</div>
            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
              ผู้รับต้องมีบัญชี payMap Personal อยู่แล้ว
            </p>
            <div className="space-y-3">
              <input
                type="email"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                placeholder="Email ของสมาชิก *"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
              />
              <select
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as FamilyRole)}>
                <option value="spouse">💑 คู่สมรส — จัดการได้เต็ม</option>
                <option value="adult">👤 สมาชิกผู้ใหญ่ — ดูข้อมูลรวม</option>
                <option value="child">👶 บุตร/หลาน — สิทธิ์จำกัด</option>
              </select>
              <input
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                placeholder="ชื่อเล่น (ไม่บังคับ)"
                value={inviteNick}
                onChange={e => setInviteNick(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => setShowInvite(false)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
                  ยกเลิก
                </button>
                <button onClick={handleInvite} disabled={!inviteEmail.trim() || inviting}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
                  {inviting && <Loader2 size={13} className="animate-spin" />}
                  เพิ่มสมาชิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
