import type { ReactNode } from "react"

export function DataTable({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={["pm-table-wrap", className].join(" ")}>{children}</div>
}

export function DataTableEmpty({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pm-table-empty">
      <div className="pm-table-empty__title">{title}</div>
      {description ? <div className="pm-table-empty__description">{description}</div> : null}
    </div>
  )
}
