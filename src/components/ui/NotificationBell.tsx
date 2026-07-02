"use client"
// v1.6: Notification Bell — in-app alerts with unread badge
import { useState, useEffect, useRef, useCallback } from "react"
import { Bell, X, Check, CheckCheck, Wallet, AlertTriangle, Calendar, BarChart3, RefreshCw } from "lucide-react"

type Notification = {
  id: string
  type: string
  title: string
  body: string
  readAt: string | null
  createdAt: string
  payload?: Record<string, any>
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  budget_alert:        <AlertTriangle size={13} className="text-amber-400" />,
  subscription_due:    <RefreshCw size={13} className="text-sky-400" />,
  approval_required:   <Calendar size={13} className="text-violet-400" />,
  monthly_report:      <BarChart3 size={13} className="text-emerald-400" />,
  recurring_detected:  <Wallet size={13} className="text-rose-400" />,
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "เมื่อกี้"
  if (mins < 60) return `${mins} นาทีที่แล้ว`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`
  return `${Math.floor(hrs / 24)} วันที่แล้ว`
}

export default function NotificationBell() {
  const [open, setOpen]           = useState(false)
  const [notifs, setNotifs]       = useState<Notification[]>([])
  const [unread, setUnread]       = useState(0)
  const [loading, setLoading]     = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      if (!res.ok) return
      const data = await res.json()
      setNotifs(data.notifications ?? [])
      setUnread(data.unreadCount ?? 0)
    } catch {}
  }, [])

  useEffect(() => {
    load()
    const iv = setInterval(load, 30_000) // poll every 30s
    return () => clearInterval(iv)
  }, [load])

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [])

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })
    setNotifs(n => n.map(x => ({ ...x, readAt: x.readAt ?? new Date().toISOString() })))
    setUnread(0)
  }

  const markRead = async (id: string) => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setNotifs(n => n.map(x => x.id === id ? { ...x, readAt: new Date().toISOString() } : x))
    setUnread(u => Math.max(0, u - 1))
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(v => !v); if (!open && unread > 0) {} }}
        className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-2)] transition-colors hover:bg-[var(--surface2)] hover:text-[var(--text)]"
        aria-label="การแจ้งเตือน"
      >
        <Bell size={15} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-0.5 text-[9px] font-black text-white leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-[24px] border border-[var(--border2)] bg-[var(--card)] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-[var(--text-3)]" />
              <span className="text-sm font-black">การแจ้งเตือน</span>
              {unread > 0 && (
                <span className="rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-bold text-rose-400">{unread}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={markAllRead} title="อ่านทั้งหมด"
                  className="rounded-xl p-1.5 text-[var(--text-3)] hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                  <CheckCheck size={13} />
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="rounded-xl p-1.5 text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface2)] transition-colors">
                <X size={13} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={24} className="mx-auto mb-3 text-[var(--text-3)]" />
                <div className="text-sm text-[var(--text-3)]">ยังไม่มีการแจ้งเตือน</div>
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  className={`group flex gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0 cursor-default transition-colors ${
                    !n.readAt ? "bg-[var(--surface2)]" : "hover:bg-[var(--surface2)]/50"
                  }`}
                >
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--bg)]">
                    {TYPE_ICON[n.type] ?? <Bell size={13} className="text-[var(--text-3)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className={`text-xs font-bold leading-tight ${!n.readAt ? "text-[var(--text)]" : "text-[var(--text-2)]"}`}>{n.title}</div>
                      {!n.readAt && (
                        <button onClick={() => markRead(n.id)}
                          className="flex-shrink-0 rounded-lg p-0.5 text-[var(--text-3)] opacity-0 group-hover:opacity-100 hover:text-emerald-400 transition-all">
                          <Check size={11} />
                        </button>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-[var(--text-3)] leading-relaxed">{n.body}</div>
                    <div className="mt-1 text-[10px] font-mono text-[var(--text-3)] opacity-60">{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.readAt && (
                    <div className="mt-2 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-sky-400" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
