"use client"

import type { ReactNode } from "react"
import { X } from "lucide-react"

type SidePanelProps = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  widthClassName?: string
}

export default function SidePanel({ open, title, description, onClose, children, widthClassName = "w-full max-w-xl" }: SidePanelProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[95]" aria-modal="true" role="dialog">
      <button className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]" onClick={onClose} aria-label="Close details panel" />
      <aside className={`absolute right-0 top-0 h-full ${widthClassName} border-l border-[var(--border)] bg-[var(--card)] shadow-2xl`}>
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Details</div>
              <h2 className="mt-1 text-xl font-black tracking-tight text-[var(--text)]">{title}</h2>
              {description ? <p className="mt-1 text-sm leading-6 text-[var(--text-2)]">{description}</p> : null}
            </div>
            <button onClick={onClose} className="inline-flex items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-2 text-[var(--text-2)] hover:text-[var(--text)]">
              <X size={16} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        </div>
      </aside>
    </div>
  )
}
