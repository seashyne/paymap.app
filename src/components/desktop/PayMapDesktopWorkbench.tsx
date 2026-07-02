"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent, ReactNode } from "react"
import {
  Archive,
  BarChart3,
  ChevronRight,
  CloudOff,
  Command,
  Download,
  FileJson,
  HardDrive,
  LayoutDashboard,
  Lock,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  Wallet,
} from "lucide-react"
import { LogoIcon } from "@/components/ui/Logo"
import {
  buildPayMapBackup,
  downloadPayMapBackup,
  getCloudBackupState,
  importPayMapBackup,
  listLocalFinancialEntries,
  readPayMapBackupFile,
  saveLocalFinancialEntry,
  type PayMapCloudBackupState,
  type PayMapFinancialEntry,
} from "@/lib/local-first/paymap-store"

type DraftEntry = {
  type: "income" | "expense"
  amount: string
  category: string
  note: string
}

const starterEntries: Array<Omit<PayMapFinancialEntry, "id" | "createdAt" | "updatedAt">> = [
  { type: "income", amount: 48000, currency: "THB", date: "2026-07-01", category: "Income", note: "Salary received", source: "demo" },
  { type: "expense", amount: 12000, currency: "THB", date: "2026-07-02", category: "Bills", note: "Rent reserve", source: "demo" },
  { type: "expense", amount: 1850, currency: "THB", date: "2026-07-02", category: "Daily spend", note: "Groceries", source: "demo" },
]

function formatMoney(value: number, currency = "THB") {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency, maximumFractionDigits: 0 }).format(value)
}

function SidebarItem({ icon, label, active }: { icon: ReactNode; label: string; active?: boolean }) {
  return (
    <button className={`obsidian-nav-item ${active ? "active" : ""}`} type="button">
      {icon}
      <span>{label}</span>
    </button>
  )
}

function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" }) {
  return <span className={`obsidian-badge obsidian-badge-${tone}`}>{children}</span>
}

export default function PayMapDesktopWorkbench() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [entries, setEntries] = useState<PayMapFinancialEntry[]>([])
  const [cloud, setCloud] = useState<PayMapCloudBackupState>({ enabled: false, lastBackupAt: null, provider: null })
  const [query, setQuery] = useState("")
  const [message, setMessage] = useState("Local vault ready")
  const [draft, setDraft] = useState<DraftEntry>({ type: "expense", amount: "", category: "", note: "" })

  async function refresh() {
    const [nextEntries, nextCloud] = await Promise.all([listLocalFinancialEntries(), getCloudBackupState()])
    setEntries(nextEntries.sort((a, b) => b.date.localeCompare(a.date)))
    setCloud(nextCloud)
  }

  useEffect(() => {
    refresh().catch((error) => setMessage(error.message))
  }, [])

  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return entries
    return entries.filter((entry) =>
      [entry.note, entry.category, entry.type, entry.date].filter(Boolean).join(" ").toLowerCase().includes(needle)
    )
  }, [entries, query])

  const totals = useMemo(() => {
    const income = entries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0)
    const expense = entries.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0)
    return { income, expense, profit: income - expense, count: entries.length }
  }, [entries])

  async function seedDemo() {
    for (const entry of starterEntries) {
      await saveLocalFinancialEntry(entry)
    }
    setMessage("Demo money records added locally")
    await refresh()
  }

  async function addEntry() {
    const amount = Number(draft.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Enter a valid amount first")
      return
    }
    await saveLocalFinancialEntry({
      type: draft.type,
      amount,
      currency: "THB",
      date: new Date().toISOString().slice(0, 10),
      category: draft.category.trim() || "Uncategorized",
      note: draft.note.trim() || (draft.type === "income" ? "Income" : "Expense"),
      source: "desktop",
    })
    setDraft({ type: "expense", amount: "", category: "", note: "" })
    setMessage("Saved to this device")
    await refresh()
  }

  async function exportBackup() {
    downloadPayMapBackup(await buildPayMapBackup())
    setMessage("Exported .paymap.json backup")
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      await importPayMapBackup(await readPayMapBackupFile(file))
      setMessage("Imported .paymap.json backup")
      await refresh()
    } catch (error: any) {
      setMessage(error?.message ?? "Import failed")
    } finally {
      event.target.value = ""
    }
  }

  return (
    <div className="obsidian-desktop-shell">
      <aside className="obsidian-ribbon" aria-label="PayMap tools">
        <div className="obsidian-ribbon-logo"><LogoIcon size={26} /></div>
        <button type="button" title="Dashboard"><LayoutDashboard size={18} /></button>
        <button type="button" title="Wallets"><Wallet size={18} /></button>
        <button type="button" title="Reports"><BarChart3 size={18} /></button>
        <button type="button" title="Settings"><Settings size={18} /></button>
      </aside>

      <aside className="obsidian-sidebar">
        <div className="obsidian-sidebar-header">
          <div>
            <div className="obsidian-kicker">PayMap Vault</div>
            <h1>Local Money</h1>
          </div>
          <StatusBadge tone="green"><HardDrive size={12} /> Local</StatusBadge>
        </div>

        <div className="obsidian-search">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records, categories..." />
        </div>

        <div className="obsidian-sidebar-section">
          <div className="obsidian-section-title">Workspace</div>
          <SidebarItem active icon={<LayoutDashboard size={15} />} label="Dashboard" />
          <SidebarItem icon={<Wallet size={15} />} label="Income & expenses" />
          <SidebarItem icon={<Archive size={15} />} label=".paymap.json backups" />
          <SidebarItem icon={<ShieldCheck size={15} />} label="Privacy & Data" />
        </div>

        <div className="obsidian-sidebar-section">
          <div className="obsidian-section-title">Storage</div>
          <div className="obsidian-tree-row"><ChevronRight size={14} /> Local Only</div>
          <div className="obsidian-tree-row"><ChevronRight size={14} /> Cloud Backup Off</div>
          <div className="obsidian-tree-row"><ChevronRight size={14} /> Last Backup: {cloud.lastBackupAt ? new Date(cloud.lastBackupAt).toLocaleString() : "Never"}</div>
        </div>

        <div className="obsidian-sidebar-footer">
          <Lock size={14} />
          Your financial data stays on this device by default.
        </div>
      </aside>

      <main className="obsidian-workspace">
        <header className="obsidian-titlebar">
          <div>
            <div className="obsidian-kicker">Private money dashboard</div>
            <h2>Your private money workspace.</h2>
          </div>
          <div className="obsidian-command"><Command size={15} /> Ctrl K</div>
        </header>

        <section className="obsidian-status-strip">
          <StatusBadge tone="green"><HardDrive size={13} /> Local Only</StatusBadge>
          <StatusBadge><CloudOff size={13} /> Cloud Backup Off</StatusBadge>
          <StatusBadge><FileJson size={13} /> .paymap.json</StatusBadge>
          <span className="obsidian-message">{message}</span>
        </section>

        <section className="obsidian-grid">
          <div className="obsidian-note obsidian-note-primary">
            <div className="obsidian-kicker">Real Profit</div>
            <div className="obsidian-money">{formatMoney(totals.profit)}</div>
            <p>Income minus expenses from records stored locally in this desktop vault.</p>
          </div>
          <div className="obsidian-note">
            <div className="obsidian-kicker">Income</div>
            <div className="obsidian-money small">{formatMoney(totals.income)}</div>
          </div>
          <div className="obsidian-note">
            <div className="obsidian-kicker">Expenses</div>
            <div className="obsidian-money small">{formatMoney(totals.expense)}</div>
          </div>
          <div className="obsidian-note">
            <div className="obsidian-kicker">Records</div>
            <div className="obsidian-money small">{totals.count}</div>
          </div>
        </section>

        <section className="obsidian-split">
          <div className="obsidian-panel">
            <div className="obsidian-panel-head">
              <div>
                <div className="obsidian-kicker">Ledger</div>
                <h3>Money movements</h3>
              </div>
              <button className="obsidian-button ghost" type="button" onClick={seedDemo}>Add demo data</button>
            </div>
            <div className="obsidian-table">
              {filteredEntries.length ? filteredEntries.map((entry) => (
                <div className="obsidian-row" key={entry.id}>
                  <span>{entry.date}</span>
                  <strong>{entry.note || entry.type}</strong>
                  <span>{entry.category || "Uncategorized"}</span>
                  <b className={entry.type === "income" ? "positive" : "negative"}>
                    {entry.type === "income" ? "+" : "-"}{formatMoney(entry.amount)}
                  </b>
                </div>
              )) : (
                <div className="obsidian-empty">
                  <Wallet size={22} />
                  <strong>No records yet</strong>
                  <span>Add a record or import a .paymap.json backup to start.</span>
                </div>
              )}
            </div>
          </div>

          <aside className="obsidian-panel">
            <div className="obsidian-panel-head">
              <div>
                <div className="obsidian-kicker">Quick Capture</div>
                <h3>Add record</h3>
              </div>
              <Plus size={18} />
            </div>
            <div className="obsidian-form">
              <div className="obsidian-segmented">
                <button className={draft.type === "expense" ? "active" : ""} type="button" onClick={() => setDraft((s) => ({ ...s, type: "expense" }))}>Expense</button>
                <button className={draft.type === "income" ? "active" : ""} type="button" onClick={() => setDraft((s) => ({ ...s, type: "income" }))}>Income</button>
              </div>
              <input value={draft.amount} onChange={(event) => setDraft((s) => ({ ...s, amount: event.target.value }))} inputMode="decimal" placeholder="Amount" />
              <input value={draft.category} onChange={(event) => setDraft((s) => ({ ...s, category: event.target.value }))} placeholder="Category" />
              <input value={draft.note} onChange={(event) => setDraft((s) => ({ ...s, note: event.target.value }))} placeholder="Note" />
              <button className="obsidian-button" type="button" onClick={addEntry}><Plus size={15} /> Save locally</button>
            </div>

            <div className="obsidian-backup-actions">
              <button className="obsidian-button ghost" type="button" onClick={exportBackup}><Download size={15} /> Export</button>
              <button className="obsidian-button ghost" type="button" onClick={() => fileInputRef.current?.click()}><Upload size={15} /> Import</button>
              <input ref={fileInputRef} className="hidden" type="file" accept=".paymap.json,application/json" onChange={importBackup} />
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
