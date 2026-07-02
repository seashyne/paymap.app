import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "var(--primary)",
  action,
}: {
  icon?: LucideIcon
  label: string
  value: ReactNode
  sub?: ReactNode
  tone?: string
  action?: ReactNode
}) {
  return (
    <div className="pm-stat-card">
      <div className="pm-stat-card__top">
        {Icon ? (
          <div className="pm-stat-card__icon" style={{ color: tone, background: `${tone}18` }}>
            <Icon size={18} />
          </div>
        ) : <div />}
        {action ? <div>{action}</div> : null}
      </div>
      <div className="pm-stat-card__value">{value}</div>
      <div className="pm-stat-card__label">{label}</div>
      {sub ? <div className="pm-stat-card__sub">{sub}</div> : null}
    </div>
  )
}
