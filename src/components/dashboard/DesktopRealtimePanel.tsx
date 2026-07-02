import RealtimeDashboardClient from "@/components/analytics/RealtimeDashboardClient"

export default function DesktopRealtimePanel({ workspaceId }: { workspaceId?: string }) {
  return (
    <div className="glass-card rounded-[30px] p-5 lg:p-6">
      <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Realtime dashboard</div>
          <h2 className="mt-1 text-2xl font-black tracking-tight">Live operational feed</h2>
          <p className="mt-1 text-sm leading-7 text-[var(--text-2)]">Monitor planner, billing, auth, and workspace activity without leaving the dashboard.</p>
        </div>
        <div className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-2)]">
          Auto-refreshing activity stream
        </div>
      </div>
      <RealtimeDashboardClient workspaceId={workspaceId} />
    </div>
  )
}
