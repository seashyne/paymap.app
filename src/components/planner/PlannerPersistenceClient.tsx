"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarClock, CheckCircle2, FileText, Plus, Trash2 } from "lucide-react"
import type { SiteLang } from "@/lib/i18n/site"
import { getAppMessages, getLocaleForLang } from "@/lib/i18n/app"

type PlannerEntry = {
  id: string
  workspace: "personal" | "business" | "merchant"
  kind: "note" | "task" | "reminder"
  status: "open" | "done" | "archived"
  title: string
  content?: string | null
  dueAt?: string | null
  priority: number
  relatedPath?: string | null
}

export default function PlannerPersistenceClient({ workspace, lang = "en" }: { workspace: "personal" | "business" | "merchant"; lang?: SiteLang }) {
  const t = getAppMessages(lang)
  const locale = getLocaleForLang(lang)
  const m = {
    unscheduled: lang === "th" ? "ยังไม่ได้กำหนดเวลา" : lang === "lo" ? "ຍັງບໍ່ໄດ້ກຳນົດເວລາ" : "No due time set",
    loadError: lang === "th" ? "โหลดรายการ planner ไม่สำเร็จ" : lang === "lo" ? "ໂຫຼດລາຍການແຜນງານບໍ່ສຳເລັດ" : "Could not load planner items",
    saveError: lang === "th" ? "บันทึกรายการไม่สำเร็จ" : lang === "lo" ? "ບັນທຶກລາຍການບໍ່ສຳເລັດ" : "Could not save this item",
    saveOk: lang === "th" ? "บันทึกรายการเรียบร้อยแล้ว" : lang === "lo" ? "ບັນທຶກລາຍການແລ້ວ" : "Planner item saved",
    composerTitle: lang === "th" ? "เพิ่ม note, task หรือ reminder" : lang === "lo" ? "ເພີ່ມ note, task ຫຼື reminder" : "Add a note, task, or reminder",
    composerBody: lang === "th" ? "บันทึกรายการที่ต้องติดตามของคุณไว้ในพื้นที่นี้ แล้วกลับมาดูต่อได้ทุกเมื่อ" : lang === "lo" ? "ບັນທຶກລາຍການທີ່ຕ້ອງຕິດຕາມໄວ້ໃນພື້ນທີ່ນີ້ ແລ້ວກັບມາຕໍ່ໄດ້ທຸກເມື່ອ" : "Save follow-up items here and come back to them any time.",
    titlePlaceholder: lang === "th" ? "ชื่อรายการ เช่น ตามใบแจ้งหนี้เดือนนี้ หรือเช็กสต็อกน้ำดื่ม" : lang === "lo" ? "ຫົວຂໍ້ ເຊັ່ນ ຕິດຕາມໃບແຈ້ງໜີ້ເດືອນນີ້" : "Title, for example review this month’s invoice or check drink stock",
    contentPlaceholder: lang === "th" ? "รายละเอียดเพิ่มเติมหรือโน้ตสั้น ๆ" : lang === "lo" ? "ລາຍລະອຽດເພີ່ມເຕີມ ຫຼື ໂນ້ດສັ້ນໆ" : "Extra details or a short note",
    add: lang === "th" ? "เพิ่มรายการ" : lang === "lo" ? "ເພີ່ມລາຍການ" : "Add item",
    loading: lang === "th" ? "กำลังโหลด..." : lang === "lo" ? "ກຳລັງໂຫຼດ..." : "Loading...",
    openItems: lang === "th" ? "รายการที่ต้องจัดการ" : lang === "lo" ? "ລາຍການທີ່ຕ້ອງຈັດການ" : "Open items",
    doneItems: lang === "th" ? "ทำเสร็จแล้ว" : lang === "lo" ? "ສຳເລັດແລ້ວ" : "Completed",
    noOpen: lang === "th" ? "ยังไม่มีรายการที่คุณเพิ่มเอง" : lang === "lo" ? "ຍັງບໍ່ມີລາຍການທີ່ທ່ານເພີ່ມເອງ" : "No open items yet",
    noDone: lang === "th" ? "ยังไม่มีรายการที่ทำเสร็จ" : lang === "lo" ? "ຍັງບໍ່ມີລາຍການທີ່ສຳເລັດ" : "No completed items yet",
    overview: lang === "th" ? "ภาพรวมที่คุณเพิ่มเอง" : lang === "lo" ? "ພາບລວມທີ່ທ່ານເພີ່ມເອງ" : "Your added items",
    todoCount: lang === "th" ? "รายการที่ต้องทำ" : lang === "lo" ? "ລາຍການທີ່ຕ້ອງເຮັດ" : "Open tasks",
    doneCount: lang === "th" ? "ทำเสร็จแล้ว" : lang === "lo" ? "ສຳເລັດແລ້ວ" : "Completed",
    reopen: lang === "th" ? "เปิดอีกครั้ง" : lang === "lo" ? "ເປີດອີກຄັ້ງ" : "Reopen",
  }

  function fmtDate(value?: string | null) {
    if (!value) return m.unscheduled
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  }
  const [items, setItems] = useState<PlannerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [kind, setKind] = useState<PlannerEntry["kind"]>("task")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [dueAt, setDueAt] = useState("")
  const [priority, setPriority] = useState("2")

  async function load() {
    setLoading(true)
    try {
      setError(null)
      const res = await fetch(`/api/personal/planner?workspace=${workspace}`)
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error || m.loadError)
        return
      }
      setItems(json.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [workspace])

  async function createItem() {
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = {
        workspace,
        kind,
        title: title.trim(),
        content: content.trim() || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        priority: Number(priority),
      }
      const res = await fetch('/api/personal/planner', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error || m.saveError)
        return
      }
      setTitle("")
      setContent("")
      setDueAt("")
      setPriority("2")
      setSuccess(m.saveOk)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function toggleDone(item: PlannerEntry) {
    setError(null)
    setSuccess(null)
    const res = await fetch(`/api/personal/planner/${item.id}`, { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ status: item.status === 'done' ? 'open' : 'done' }) })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || !json.success) {
      setError(json.error || 'อัปเดตสถานะไม่สำเร็จ')
      return
    }
    setSuccess(item.status === 'done' ? 'ย้ายกลับไปยังรายการที่ต้องทำแล้ว' : 'ทำเครื่องหมายว่าเสร็จแล้ว')
    await load()
  }

  async function removeItem(id: string) {
    setError(null)
    setSuccess(null)
    const res = await fetch(`/api/personal/planner/${id}`, { method:'DELETE' })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || !json.success) {
      setError(json.error || 'ลบรายการไม่สำเร็จ')
      return
    }
    setSuccess('ลบรายการเรียบร้อยแล้ว')
    await load()
  }

  const openItems = useMemo(() => items.filter((item) => item.status !== 'done'), [items])
  const doneItems = useMemo(() => items.filter((item) => item.status === 'done'), [items])

  return (
    <div className="space-y-5">

      {error ? <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{success}</div> : null}

      <div className="planner-composer-grid">
        <div className="planner-entry-card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-[var(--text-1)]">{m.composerTitle}</div>
              <div className="mt-1 text-sm text-[var(--text-2)]">{m.composerBody}</div>
            </div>
            <div className="planner-chip">{workspace}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[['task','Task'],['reminder','Reminder'],['note','Note']].map(([id,label]) => (
              <button key={id} type="button" onClick={() => setKind(id as PlannerEntry['kind'])} className={`planner-chip ${kind === id ? 'active' : ''}`}>{label}</button>
            ))}
          </div>
          <input className="planner-field" placeholder={m.titlePlaceholder} value={title} onChange={(e)=>setTitle(e.target.value)} />
          <textarea className="planner-textarea min-h-[110px]" placeholder={m.contentPlaceholder} value={content} onChange={(e)=>setContent(e.target.value)} />
          <div className="grid gap-3 md:grid-cols-2">
            <input className="planner-field" type="datetime-local" value={dueAt} onChange={(e)=>setDueAt(e.target.value)} />
            <select className="planner-select" value={priority} onChange={(e)=>setPriority(e.target.value)}>
              <option value="1">Priority 1 · สำคัญมาก</option>
              <option value="2">Priority 2 · ปกติ</option>
              <option value="3">Priority 3 · ภายหลัง</option>
            </select>
          </div>
          <button type="button" className="planner-primary-btn w-full" onClick={createItem} disabled={saving}>
            <Plus size={16} /> {saving ? t.common.saving : m.add}
          </button>
        </div>

        <div className="planner-entry-card">
          <div className="text-lg font-bold text-[var(--text-1)]">{m.overview}</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-sm text-[var(--text-3)]">{m.todoCount}</div>
              <div className="mt-2 text-3xl font-black text-[var(--text-1)]">{openItems.length}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-sm text-[var(--text-3)]">{m.doneCount}</div>
              <div className="mt-2 text-3xl font-black text-[var(--text-1)]">{doneItems.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="planner-entry-card">
          <div className="mb-3 flex items-center gap-2 text-lg font-bold text-[var(--text-1)]"><CalendarClock size={18} /> {m.openItems}</div>
          <div className="space-y-3">
            {loading ? <div className="text-sm text-[var(--text-3)]">{m.loading}</div> : openItems.length ? openItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="planner-chip">{item.kind}</span>
                      <span className="planner-chip">P{item.priority}</span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[var(--text-1)]">{item.title}</div>
                    {item.content ? <div className="mt-1 text-sm text-[var(--text-2)]">{item.content}</div> : null}
                    <div className="mt-2 text-xs text-[var(--text-3)]">{fmtDate(item.dueAt)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="planner-secondary-btn px-3 py-2" onClick={() => toggleDone(item)}><CheckCircle2 size={15} /></button>
                    <button className="planner-secondary-btn px-3 py-2" onClick={() => removeItem(item.id)}><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            )) : <div className="text-sm text-[var(--text-3)]">{m.noOpen}</div>}
          </div>
        </div>

        <div className="planner-entry-card">
          <div className="mb-3 flex items-center gap-2 text-lg font-bold text-[var(--text-1)]"><FileText size={18} /> {m.doneItems}</div>
          <div className="space-y-3">
            {loading ? <div className="text-sm text-[var(--text-3)]">{m.loading}</div> : doneItems.length ? doneItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-1)]">{item.title}</div>
                    <div className="mt-1 text-xs text-[var(--text-3)]">{fmtDate(item.dueAt)}</div>
                  </div>
                  <button className="planner-secondary-btn px-3 py-2" onClick={() => toggleDone(item)}>{m.reopen}</button>
                </div>
              </div>
            )) : <div className="text-sm text-[var(--text-3)]">{m.noDone}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
