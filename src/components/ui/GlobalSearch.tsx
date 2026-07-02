"use client"

import type { ComponentType } from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Command, Plus, Search, Sparkles, X } from "lucide-react"
import { V151_ROUTE_MAP, searchRoutes } from "@/lib/v151-route-map"

type Item = {
  id: string
  group: string
  title: string
  subtitle: string
  href?: string
  action?: () => void
  badge?: string
  icon: ComponentType<any>
  keywords?: string[]
}

const GROUP_ORDER = ["Create", "Navigate", "Context", "System"]

const STATIC_ITEMS: Item[] = [
  { id: "create-wallet", group: "Create", title: "Create wallet", subtitle: "Open wallet workspace and start a new account", href: "/wallets", badge: "Money", icon: Plus, keywords: ["new wallet", "add wallet"] },
  { id: "create-transaction", group: "Create", title: "Create transaction", subtitle: "Jump to personal dashboard quick-add flow", href: "/dashboard", badge: "Quick", icon: Plus, keywords: ["new transaction", "expense", "income"] },
  { id: "create-invoice", group: "Create", title: "Create invoice", subtitle: "Open business invoice workflow", href: "/business/invoices", badge: "Business", icon: Plus, keywords: ["invoice", "billing"] },
  { id: "create-order", group: "Create", title: "Start POS order", subtitle: "Jump directly to merchant checkout", href: "/merchant/pos", badge: "POS", icon: Plus, keywords: ["order", "checkout", "cashier"] },
  { id: "sys-ai", group: "System", title: "Open AI assist", subtitle: "Review suggestions, anomalies, and next actions", href: "/analytics", badge: "AI", icon: Sparkles, keywords: ["ai", "assistant", "insights"] },
]

function routeToItem(path: string) {
  const route = V151_ROUTE_MAP.find((entry) => entry.path === path)
  if (!route) return null
  const group = route.mode === "public" ? "System" : route.mode === "personal" ? "Navigate" : route.mode === "business" || route.mode === "merchant" ? "Context" : "System"
  return {
    id: `route-${route.path}`,
    group,
    title: route.name,
    subtitle: route.description,
    href: route.path.includes("[") ? undefined : route.path,
    badge: route.audience,
    icon: route.icon,
    keywords: route.keywords,
  } satisfies Item
}

const SHORTCUTS: Record<string, string> = {
  d: "/dashboard",
  b: "/business",
  m: "/merchant",
  a: "/analytics",
  s: "/settings",
  w: "/wallets",
  r: "/reports",
  p: "/merchant/pos",
  g: "/guide",
  h: "/help",
}

export default function GlobalSearch() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const [pendingGoto, setPendingGoto] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((value) => !value)
        return
      }
      if (!open && e.key.toLowerCase() === "g") {
        const activeTag = (document.activeElement?.tagName || "").toLowerCase()
        if (activeTag !== "input" && activeTag !== "textarea") {
          setPendingGoto(true)
          window.setTimeout(() => setPendingGoto(false), 900)
        }
        return
      }
      if (pendingGoto) {
        const path = SHORTCUTS[e.key.toLowerCase()]
        if (path) {
          e.preventDefault()
          setPendingGoto(false)
          router.push(path)
          return
        }
      }
      if (e.key === "Escape") {
        setOpen(false)
        setPendingGoto(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, pendingGoto, router])

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 50)
    else {
      setQuery("")
      setSelected(0)
    }
  }, [open])

  const items = useMemo<Item[]>(() => {
    const routeItems = [
      "/dashboard",
      "/wallets",
      "/reports",
      "/analytics",
      "/business",
      "/business/invoices",
      "/business/accounting",
      "/merchant",
      "/merchant/pos",
      "/merchant/inventory",
      "/settings",
      "/billing",
      "/guide",
      "/help",
      "/status",
      "/download",
      "/admin",
    ].map(routeToItem).filter(Boolean) as Item[]
    return [...STATIC_ITEMS, ...routeItems]
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    const dynamicMatches = searchRoutes(q)
      .filter((entry) => !entry.path.includes("["))
      .map((entry) => routeToItem(entry.path))
      .filter(Boolean) as Item[]
    const localMatches = items.filter((item) => `${item.title} ${item.subtitle} ${item.group} ${(item.keywords ?? []).join(" ")}`.toLowerCase().includes(q))
    const merged = [...localMatches]
    dynamicMatches.forEach((item) => {
      if (!merged.find((existing) => existing.id === item.id)) merged.push(item)
    })
    return merged
  }, [items, query])

  function run(item: Item) {
    setOpen(false)
    if (item.action) item.action()
    else if (item.href) router.push(item.href)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelected((value) => Math.min(value + 1, results.length - 1))
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelected((value) => Math.max(value - 1, 0))
    }
    if ((e.key === "Enter" || e.key === "Tab") && results[selected]) {
      e.preventDefault()
      run(results[selected])
    }
  }

  const grouped = GROUP_ORDER.map((group) => ({ group, items: results.filter((item) => item.group === group) })).filter((entry) => entry.items.length)

  if (!open) {
    return (
      <div className="flex items-center gap-2">
        {pendingGoto ? <div className="hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[11px] font-semibold text-[var(--text-2)] md:block">Press D/B/M/P/S/W/R/A</div> : null}
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-3)] transition hover:border-[var(--border-strong)] hover:text-[var(--text)]">
          <Search size={12} />
          <span className="hidden sm:inline">Search routes, switch context, or run command</span>
          <kbd className="hidden items-center gap-1 rounded border border-[var(--border)] px-1 py-0.5 font-mono text-[9px] sm:inline-flex"><Command size={9} />K</kbd>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[10vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-3xl overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--card)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5">
          <Search size={16} className="text-[var(--text-3)]" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown} placeholder="Search pages, routes, workspaces, or actions..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-3)]" />
          {query ? <button onClick={() => setQuery("")} className="rounded-lg p-1 text-[var(--text-3)]"><X size={12} /></button> : null}
          <kbd className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--text-3)]">ESC</kbd>
        </div>
        <div className="border-b border-[var(--border)] px-4 py-2 text-[11px] text-[var(--text-3)]">PayMap v15.1 command palette. Use <span className="font-semibold text-[var(--text-2)]">↑ ↓</span> to move, <span className="font-semibold text-[var(--text-2)]">Enter</span> or <span className="font-semibold text-[var(--text-2)]">Tab</span> to run. Quick jump: <span className="font-semibold text-[var(--text-2)]">G then D/B/M/P/S/W/R/A/H</span>.</div>
        <div className="max-h-[520px] overflow-y-auto py-2">
          {grouped.map((group) => (
            <div key={group.group}>
              <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-3)]">{group.group}</div>
              {group.items.map((item) => {
                const index = results.indexOf(item)
                const active = index === selected
                const Icon = item.icon
                return (
                  <button key={item.id} type="button" onClick={() => run(item)} onMouseEnter={() => setSelected(index)} className={active ? "flex w-full items-center gap-3 bg-[var(--surface-2)] px-4 py-3 text-left" : "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--surface-2)]"}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[var(--border)] bg-[var(--card)]"><Icon size={16} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2"><span className="truncate text-sm font-semibold">{item.title}</span>{item.badge ? <span className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-3)]">{item.badge}</span> : null}</span>
                      <span className="block truncate text-xs text-[var(--text-3)]">{item.subtitle}</span>
                    </span>
                    {active ? <ArrowRight size={13} className="text-[var(--text-3)]" /> : null}
                  </button>
                )
              })}
            </div>
          ))}
          {!results.length ? <div className="px-4 py-10 text-center text-sm text-[var(--text-3)]">No command matches “{query}”.</div> : null}
        </div>
      </div>
    </div>
  )
}
