"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Cloud, Database, Download, HardDrive, RotateCcw, Trash2, Upload } from "lucide-react"
import {
  buildPayMapBackup,
  deleteCloudBackupMetadata,
  deleteLocalFinancialData,
  downloadPayMapBackup,
  getCloudBackupState,
  importPayMapBackup,
  listLocalFinancialEntries,
  readPayMapBackupFile,
  setCloudBackupEnabled,
  type PayMapCloudBackupState,
} from "@/lib/local-first/paymap-store"

type Message = { ok: boolean; text: string } | null

function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "green" | "amber" | "neutral" }) {
  const color = tone === "green" ? "#059669" : tone === "amber" ? "#d97706" : "var(--text-2)"
  const bg = tone === "green" ? "rgba(5,150,105,.10)" : tone === "amber" ? "rgba(217,119,6,.10)" : "var(--surface-2)"
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ color, background: bg, border: "1px solid var(--border)" }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}

function ActionButton({ children, onClick, danger = false }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-80"
      style={{ background: danger ? "rgba(220,38,38,.10)" : "var(--primary-soft)", color: danger ? "#dc2626" : "var(--primary)", border: "1px solid var(--border)" }}
    >
      {children}
    </button>
  )
}

export default function PrivacyDataPanel() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [entryCount, setEntryCount] = useState(0)
  const [cloudState, setCloudState] = useState<PayMapCloudBackupState>({ enabled: false, lastBackupAt: null, provider: null })
  const [message, setMessage] = useState<Message>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const [entries, backup] = await Promise.all([listLocalFinancialEntries(), getCloudBackupState()])
      setEntryCount(entries.length)
      setCloudState(backup)
    } catch (error: any) {
      setMessage({ ok: false, text: error?.message ?? "Local storage is not available in this browser." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function exportBackup() {
    try {
      const backup = await buildPayMapBackup()
      downloadPayMapBackup(backup)
      setMessage({ ok: true, text: "Exported .paymap.json backup from this device." })
    } catch (error: any) {
      setMessage({ ok: false, text: error?.message ?? "Export failed." })
    }
  }

  async function importBackup(file?: File | null) {
    if (!file) return
    try {
      const backup = await readPayMapBackupFile(file)
      await importPayMapBackup(backup)
      setMessage({ ok: true, text: `Imported ${backup.entries.length} entries from .paymap.json.` })
      await refresh()
    } catch (error: any) {
      setMessage({ ok: false, text: error?.message ?? "Import failed." })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function enableCloudBackup() {
    const ok = window.confirm("Cloud Backup is optional. Enable it only if you want PayMap to upload financial backup data to your cloud account. Continue?")
    if (!ok) return
    const next = await setCloudBackupEnabled(true)
    setCloudState(next)
    setMessage({ ok: true, text: "Cloud Backup is on. Financial data can upload only after this explicit opt-in." })
  }

  async function disableCloudBackup() {
    const next = await setCloudBackupEnabled(false)
    setCloudState(next)
    setMessage({ ok: true, text: "Cloud Backup is off. New financial data stays local by default." })
  }

  async function backupNow() {
    if (!cloudState.enabled) {
      setMessage({ ok: false, text: "Turn on Cloud Backup before backing up to cloud." })
      return
    }
    const ok = window.confirm("Upload a financial backup snapshot now? Your financial data stays on this device unless you confirm this cloud backup action.")
    if (!ok) return
    setMessage({ ok: false, text: "Cloud upload is not connected in this local build yet, so no financial data was uploaded. Export .paymap.json for backup now." })
  }

  async function deleteLocal() {
    const ok = window.confirm("Delete all local PayMap financial data stored on this device? Export a .paymap.json backup first if you need a copy.")
    if (!ok) return
    await deleteLocalFinancialData()
    setEntryCount(0)
    setMessage({ ok: true, text: "Deleted local financial data from this device." })
  }

  async function deleteCloud() {
    const ok = window.confirm("Delete cloud backup metadata and turn Cloud Backup off for this device?")
    if (!ok) return
    const next = await deleteCloudBackupMetadata()
    setCloudState(next)
    setMessage({ ok: true, text: "Cloud backup status cleared. Delete remote cloud copies from your provider when available." })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
              <HardDrive size={14} /> Local-first storage
            </div>
            <h2 className="mt-2 text-2xl font-black">Your financial data stays on your device by default.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7" style={{ color: "var(--text-2)" }}>
              PayMap uses IndexedDB for local financial records and exports portable <code>.paymap.json</code> backups. Cloud Backup is optional and off until you enable it.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label="Local Only" tone={cloudState.enabled ? "neutral" : "green"} />
            <StatusBadge label={cloudState.enabled ? "Cloud Backup On" : "Cloud Backup Off"} tone={cloudState.enabled ? "amber" : "green"} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <Database size={20} style={{ color: "var(--primary)" }} />
          <div className="mt-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Local records</div>
          <div className="mt-2 text-3xl font-black">{loading ? "..." : entryCount}</div>
          <div className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>entries on this device</div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <Cloud size={20} style={{ color: cloudState.enabled ? "#d97706" : "var(--text-3)" }} />
          <div className="mt-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Cloud backup</div>
          <div className="mt-2 text-xl font-black">{cloudState.enabled ? "On" : "Off by default"}</div>
          <div className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>requires explicit confirmation</div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <Check size={20} style={{ color: "#059669" }} />
          <div className="mt-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Last Backup</div>
          <div className="mt-2 text-xl font-black">{cloudState.lastBackupAt ? new Date(cloudState.lastBackupAt).toLocaleString() : "Never"}</div>
          <div className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>.paymap.json export works anytime</div>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Backup tools</div>
        <div className="mt-4 flex flex-wrap gap-3">
          <ActionButton onClick={exportBackup}><Download size={15} /> Export .paymap.json</ActionButton>
          <ActionButton onClick={() => fileInputRef.current?.click()}><Upload size={15} /> Import .paymap.json</ActionButton>
          <ActionButton onClick={deleteLocal} danger><Trash2 size={15} /> Delete local data</ActionButton>
        </div>
        <input ref={fileInputRef} type="file" accept=".paymap.json,application/json" className="hidden" onChange={(event) => importBackup(event.target.files?.[0])} />
      </div>

      <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Optional Cloud Backup</div>
        <p className="mt-2 text-sm leading-7" style={{ color: "var(--text-2)" }}>
          Cloud Backup is disabled by default. PayMap must ask before uploading financial data. Turning this on records your opt-in on this device.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {cloudState.enabled ? (
            <ActionButton onClick={disableCloudBackup}><Cloud size={15} /> Turn Cloud Backup Off</ActionButton>
          ) : (
            <ActionButton onClick={enableCloudBackup}><Cloud size={15} /> Enable Cloud Backup</ActionButton>
          )}
          <ActionButton onClick={backupNow}><RotateCcw size={15} /> Backup now</ActionButton>
          <ActionButton onClick={deleteCloud} danger><Trash2 size={15} /> Delete cloud data</ActionButton>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: message.ok ? "rgba(5,150,105,.10)" : "rgba(220,38,38,.10)", color: message.ok ? "#059669" : "#dc2626", border: "1px solid var(--border)" }}>
          {message.text}
        </div>
      ) : null}
    </div>
  )
}
