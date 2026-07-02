"use client"

import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ChevronDown, Search, SlidersHorizontal } from "lucide-react"

export type AdvancedTableColumn<T> = {
  key: keyof T | string
  label: string
  className?: string
  headerClassName?: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
  searchValue?: (row: T) => string
}

type Props<T> = {
  rows: T[]
  columns: AdvancedTableColumn<T>[]
  rowKey: (row: T) => string
  onRowSelect?: (row: T) => void
  defaultSortKey?: string
  title?: string
  description?: string
}

export default function AdvancedTable<T extends Record<string, any>>({ rows, columns, rowKey, onRowSelect, defaultSortKey, title, description }: Props<T>) {
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState(defaultSortKey ?? String(columns.find((c) => c.sortable)?.key ?? columns[0]?.key ?? ""))
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [openColumns, setOpenColumns] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => Object.fromEntries(columns.map((c) => [String(c.key), true])))

  const processed = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const filtered = !normalized ? rows : rows.filter((row) => columns.some((column) => {
      const source = column.searchValue ? column.searchValue(row) : String(row[column.key as keyof T] ?? "")
      return source.toLowerCase().includes(normalized)
    }))
    const next = [...filtered]
    next.sort((a, b) => {
      const av = a[sortKey as keyof T] as unknown
      const bv = b[sortKey as keyof T] as unknown
      const aValue = av instanceof Date ? av.getTime() : typeof av === "number" ? av : String(av ?? "").toLowerCase()
      const bValue = bv instanceof Date ? bv.getTime() : typeof bv === "number" ? bv : String(bv ?? "").toLowerCase()
      if (aValue === bValue) return 0
      const cmp = aValue > bValue ? 1 : -1
      return sortDir === "asc" ? cmp : -cmp
    })
    return next
  }, [columns, query, rows, sortDir, sortKey])

  const activeColumns = columns.filter((column) => visibleColumns[String(column.key)] !== false)

  return (
    <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--s1)]">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {title ? <div className="text-base font-semibold text-[var(--text)]">{title}</div> : null}
          {description ? <div className="text-sm text-[var(--text-3)]">{description}</div> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1 lg:flex-none">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rows" className="modern-input py-2.5 pl-9 pr-3 text-sm" />
          </div>
          <div className="relative">
            <button type="button" onClick={() => setOpenColumns((v) => !v)} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text)]">
              <SlidersHorizontal size={14} /> Columns <ChevronDown size={14} />
            </button>
            {openColumns ? (
              <div className="absolute right-0 z-10 mt-2 min-w-[220px] rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-2xl">
                {columns.map((column) => {
                  const key = String(column.key)
                  return (
                    <label key={key} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--surface-2)]">
                      <input type="checkbox" checked={visibleColumns[key] !== false} onChange={(e) => setVisibleColumns((current) => ({ ...current, [key]: e.target.checked }))} />
                      <span>{column.label}</span>
                    </label>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-[1] bg-[var(--s2)] text-left text-[var(--text-3)]">
            <tr>
              {activeColumns.map((column) => {
                const key = String(column.key)
                const active = key === sortKey
                return (
                  <th key={key} className={`px-4 py-3 font-medium ${column.headerClassName ?? ""}`}>
                    <button type="button" disabled={!column.sortable} onClick={() => { if (!column.sortable) return; if (sortKey === key) setSortDir((v) => v === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDir("desc") } }} className={`inline-flex items-center gap-1 ${column.sortable ? "hover:text-[var(--text)]" : "cursor-default"}`}>
                      <span>{column.label}</span>
                      {column.sortable ? active ? (sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowDown size={12} className="opacity-40" /> : null}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {processed.map((row) => (
              <tr key={rowKey(row)} className={`border-t border-[var(--border)] ${onRowSelect ? "cursor-pointer hover:bg-[var(--surface-2)]/70" : ""}`} onClick={() => onRowSelect?.(row)}>
                {activeColumns.map((column) => (
                  <td key={String(column.key)} className={`px-4 py-3 text-[var(--text-2)] ${column.className ?? ""}`}>
                    {column.render ? column.render(row) : String(row[column.key as keyof T] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {processed.length === 0 ? <div className="px-5 py-8 text-center text-sm text-[var(--text-3)]">No matching rows found.</div> : null}
    </div>
  )
}
