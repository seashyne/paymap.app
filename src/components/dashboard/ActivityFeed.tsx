"use client"

import { useEffect, useMemo, useState } from "react"
import { Activity, ArrowDownUp, CreditCard, Wallet, ShieldCheck } from "lucide-react"

type ActivityItem = {
  id: string
  type: string
  title: string
  description: string
  at: string
}

const seed: ActivityItem[] = [
  { id: "activity-1", type: "planner", title: "Planner updated", description: "A recent planning item was saved.", at: new Date().toISOString() },
  { id: "activity-2", type: "billing", title: "Billing status synced", description: "Subscription details were refreshed.", at: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
  { id: "activity-3", type: "workspace", title: "Workspace ready", description: "Core workspace modules are available for use.", at: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
]

function iconFor(type: string) {
  if (type === "billing") return CreditCard
  if (type === "workspace") return ShieldCheck
  if (type === "transaction") return ArrowDownUp
  if (type === "wallet") return Wallet
  return Activity
}

function formatAgo(iso: string) {
  const delta = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (delta < 60) return `${delta}m ago`
  const hours = Math.round(delta / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export default function ActivityFeed({ workspaceId }: { workspaceId?: string }) {
  const [items, setItems] = useState<ActivityItem[]>(seed)

  useEffect(() => {
    const stream = workspaceId ? `/api/realtime/stream?workspaceId=${encodeURIComponent(workspaceId)}` : `/api/realtime/stream`
    const es = new EventSource(stream)
    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        const next: ActivityItem = {
          id: `${payload.type ?? "event"}-${Date.now()}`,
          type: String(payload.type ?? "event"),
          title: String(payload.title ?? payload.type ?? "Live activity"),
          description: String(payload.description ?? "A background event was received."),
          at: new Date().toISOString(),
        }
        setItems((current) => [next, ...current].slice(0, 12))
      } catch {}
    }
    es.onerror = () => es.close()
    return () => es.close()
  }, [workspaceId])

  const visible = useMemo(() => items.slice(0, 8), [items])

  return (
    <div className="glass-card rounded-[30px] p-5 lg:p-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Activity feed</div>
          <h2 className="mt-1 text-2xl font-black tracking-tight">Live workspace activity</h2>
          <p className="mt-1 text-sm leading-7 text-[var(--text-2)]">Follow recent changes without opening every module one by one.</p>
        </div>
        <div className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-2)]">Auto-updating</div>
      </div>
      <div className="space-y-3">
        {visible.map((item) => {
          const Icon = iconFor(item.type)
          return (
            <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
              <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="truncate text-sm font-semibold text-[var(--text)]">{item.title}</div>
                  <div className="shrink-0 text-[11px] font-semibold text-[var(--text-3)]">{formatAgo(item.at)}</div>
                </div>
                <div className="mt-1 text-sm text-[var(--text-2)]">{item.description}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
