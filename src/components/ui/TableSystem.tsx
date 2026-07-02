"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { ArrowDownUp, Search, SlidersHorizontal } from "lucide-react"

type Column = {
  key: string
  label: string
  align?: "left" | "right" | "center"
  className?: string
  render?: (row: Record<string, any>) => ReactNode
}

function compare(a: any, b: any) {
  if (typeof a === "number" && typeof b === "number") return a - b
  return String(a ?? "").localeCompare(String(b ?? ""))
}

function alignClass(align?: Column["align"]) {
  if (align === "right") return "text-right"
  if (align === "center") return "text-center"
  return "text-left"
}

function statusTone(value: string) {
  const v = value.toLowerCase()
  if (["healthy", "ready", "paid", "posted", "completed", "active"].includes(v)) return { bg: "rgba(16,185,129,.12)", text: "#10b981" }
  if (["review", "pending", "watch", "draft", "overdue"].includes(v)) return { bg: "rgba(245,158,11,.14)", text: "#f59e0b" }
  if (["open", "blocked", "error", "failed"].includes(v)) return { bg: "rgba(248,113,113,.14)", text: "#f87171" }
  return { bg: "var(--surface-3)", text: "var(--text-2)" }
}

function AutoCell({ value }: { value: any }) {
  if (typeof value === "string") {
    const tone = statusTone(value)
    if (["healthy", "ready", "paid", "posted", "completed", "active", "review", "pending", "watch", "draft", "overdue", "open", "blocked", "error", "failed"].includes(value.toLowerCase())) {
      return <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: tone.bg, color: tone.text }}>{value}</span>
    }
  }
  return <>{String(value ?? "—")}</>
}

export function TableSystem({
  title,
  subtitle,
  columns,
  rows,
  searchableKeys,
  initialSortKey,
  toolbar,
}: {
  title: string
  subtitle?: string
  columns: Column[]
  rows: Record<string, any>[]
  searchableKeys: string[]
  initialSortKey?: string
  toolbar?: ReactNode
}) {
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState(initialSortKey ?? columns[0]?.key ?? "")
  const [direction, setDirection] = useState<"asc" | "desc">("desc")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q
      ? rows.filter((row) => searchableKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q)))
      : rows
    return [...base].sort((a, b) => {
      const result = compare(a[sortKey], b[sortKey])
      return direction === "asc" ? result : -result
    })
  }, [direction, query, rows, searchableKeys, sortKey])

  return (
    <section className="glass-card rounded-[30px] p-5 lg:p-6">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Table system</div>
          <h3 className="mt-1 text-2xl font-black tracking-tight">{title}</h3>
          {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-2)]">{subtitle}</p> : null}
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          {toolbar}
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative min-w-[250px]">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search rows"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] py-2.5 pl-9 pr-3 text-sm outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setDirection((value) => value === "asc" ? "desc" : "asc")}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm font-semibold"
            >
              <ArrowDownUp size={14} />
              {direction === "asc" ? "Ascending" : "Descending"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 px-1 text-xs text-[var(--text-3)]">
        <div>{filtered.length} row{filtered.length === 1 ? "" : "s"} shown</div>
        <div className="inline-flex items-center gap-1"><SlidersHorizontal size={12} /> sortable desktop table</div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)] ${alignClass(column.align)} ${column.className ?? ""}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (sortKey === column.key) setDirection((value) => value === "asc" ? "desc" : "asc")
                      else {
                        setSortKey(column.key)
                        setDirection("desc")
                      }
                    }}
                    className={`inline-flex items-center gap-1 ${column.align === "right" ? "ml-auto" : ""}`}
                  >
                    <span>{column.label}</span>
                    <ArrowDownUp size={11} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map((row) => (
              <tr key={String(row.id)} className="bg-[var(--surface-2)]">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3.5 text-sm text-[var(--text)] ${alignClass(column.align)} ${column.className ?? ""} first:rounded-l-[18px] last:rounded-r-[18px]`}
                  >
                    {column.render ? column.render(row) : <AutoCell value={row[column.key]} />}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="rounded-[22px] border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--text-3)]">
                  No rows match this search yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
