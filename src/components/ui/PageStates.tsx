import Link from "next/link"
import { AlertCircle, Inbox, Loader2 } from "lucide-react"

export function PageLoadingState({ title = "Loading", subtitle = "Preparing the latest data for this page." }: { title?: string; subtitle?: string }) {
  return (
    <div className="glass-card rounded-[28px] p-6 lg:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[var(--text)]">
          <Loader2 size={20} className="animate-spin" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-2)]">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

export function EmptyStateCard({ title, description, actionHref, actionLabel }: { title: string; description: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="glass-card rounded-[28px] p-6 lg:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[var(--text)]">
          <Inbox size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-black tracking-tight">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-2)]">{description}</p>
          {actionHref && actionLabel ? <Link href={actionHref} className="public-btn public-btn-primary mt-5 inline-flex">{actionLabel}</Link> : null}
        </div>
      </div>
    </div>
  )
}

export function ErrorStateCard({ title = "Something went wrong", description = "Please try again. If this keeps happening, return to the dashboard or contact support.", actionLabel = "Try again", onAction }: { title?: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="glass-card rounded-[28px] border border-rose-400/20 p-6 lg:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-300">
          <AlertCircle size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-black tracking-tight">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-2)]">{description}</p>
          {onAction ? <button type="button" onClick={onAction} className="mt-5 rounded-2xl border border-[var(--border)] px-4 py-2.5 text-sm font-bold">{actionLabel}</button> : null}
        </div>
      </div>
    </div>
  )
}
