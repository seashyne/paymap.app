"use client"

import { useEffect, useMemo, useState } from "react"

type RealtimeEvent = {
  at?: string
  payload?: Record<string, unknown>
  channel?: string
}

export default function RealtimeDashboardClient({ workspaceId }: { workspaceId?: string }) {
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const [status, setStatus] = useState<"connecting" | "live" | "closed">("connecting")

  const streamUrl = useMemo(() => {
    const qs = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : ""
    return `/api/realtime/stream${qs}`
  }, [workspaceId])

  useEffect(() => {
    const source = new EventSource(streamUrl)
    source.onopen = () => setStatus("live")
    source.onerror = () => setStatus("closed")
    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        setEvents((prev) => [payload, ...prev].slice(0, 8))
      } catch {}
    }
    return () => source.close()
  }, [streamUrl])

  return (
    <section className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Realtime activity</div>
          <div className="mt-1 text-xs text-[var(--text-3)]">สตรีมอีเวนต์ล่าสุดจาก dashboard, billing, auth และ planner</div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "live" ? "bg-emerald-500/15 text-emerald-300" : status === "connecting" ? "bg-amber-500/15 text-amber-300" : "bg-rose-500/15 text-rose-300"}`}>{status}</span>
      </div>
      <div className="mt-4 space-y-3">
        {events.length ? events.map((item, index) => (
          <div key={`${item.at}-${index}`} className="rounded-2xl bg-[var(--surface-2)] p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{String(item.payload?.type ?? "event")}</span>
              <span className="text-xs text-[var(--text-3)]">{item.at ? new Date(item.at).toLocaleTimeString() : "now"}</span>
            </div>
            <pre className="mt-2 overflow-x-auto text-xs text-[var(--text-2)]">{JSON.stringify(item.payload ?? {}, null, 2)}</pre>
          </div>
        )) : <div className="rounded-2xl bg-[var(--surface-2)] p-3 text-sm text-[var(--text-2)]">ยังไม่มีอีเวนต์ใหม่ในสตรีมนี้</div>}
      </div>
    </section>
  )
}
