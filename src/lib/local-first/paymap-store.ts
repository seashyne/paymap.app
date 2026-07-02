export type PayMapFinancialEntry = {
  id: string
  type: "income" | "expense"
  amount: number
  currency: string
  date: string
  category?: string
  note?: string
  source?: string
  createdAt: string
  updatedAt: string
}

export type PayMapCloudBackupState = {
  enabled: boolean
  lastBackupAt: string | null
  provider: "paymap-cloud" | null
}

export type PayMapBackupFile = {
  format: "paymap.local.backup"
  version: 1
  exportedAt: string
  deviceOnly: boolean
  cloudBackup: PayMapCloudBackupState
  entries: PayMapFinancialEntry[]
}

const DB_NAME = "paymap-local-first"
const DB_VERSION = 1
const ENTRY_STORE = "financialEntries"
const META_STORE = "metadata"
const CLOUD_BACKUP_KEY = "cloudBackup"
const LAST_IMPORT_KEY = "lastImportAt"

function assertBrowser() {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    throw new Error("IndexedDB is not available in this environment.")
  }
}

function openPayMapDb(): Promise<IDBDatabase> {
  assertBrowser()
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(ENTRY_STORE)) {
        const store = db.createObjectStore(ENTRY_STORE, { keyPath: "id" })
        store.createIndex("date", "date")
        store.createIndex("type", "type")
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(storeName: string, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openPayMapDb()
  try {
    return await requestToPromise(run(db.transaction(storeName, mode).objectStore(storeName)))
  } finally {
    db.close()
  }
}

export async function listLocalFinancialEntries() {
  return withStore<PayMapFinancialEntry[]>(ENTRY_STORE, "readonly", (store) => store.getAll())
}

export async function saveLocalFinancialEntry(entry: Omit<PayMapFinancialEntry, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
  const now = new Date().toISOString()
  const record: PayMapFinancialEntry = {
    id: entry.id ?? crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...entry,
  }
  await withStore<IDBValidKey>(ENTRY_STORE, "readwrite", (store) => store.put(record))
  return record
}

export async function importPayMapBackup(backup: PayMapBackupFile) {
  if (backup.format !== "paymap.local.backup" || backup.version !== 1 || !Array.isArray(backup.entries)) {
    throw new Error("Invalid .paymap.json backup file.")
  }
  const db = await openPayMapDb()
  try {
    const tx = db.transaction([ENTRY_STORE, META_STORE], "readwrite")
    const entries = tx.objectStore(ENTRY_STORE)
    const meta = tx.objectStore(META_STORE)
    for (const entry of backup.entries) {
      entries.put({
        ...entry,
        updatedAt: new Date().toISOString(),
      })
    }
    meta.put(new Date().toISOString(), LAST_IMPORT_KEY)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

export async function getCloudBackupState(): Promise<PayMapCloudBackupState> {
  const state = await withStore<PayMapCloudBackupState | undefined>(META_STORE, "readonly", (store) => store.get(CLOUD_BACKUP_KEY))
  return state ?? { enabled: false, lastBackupAt: null, provider: null }
}

export async function setCloudBackupEnabled(enabled: boolean) {
  const current = await getCloudBackupState()
  const next: PayMapCloudBackupState = {
    enabled,
    lastBackupAt: current.lastBackupAt,
    provider: enabled ? "paymap-cloud" : null,
  }
  await withStore<IDBValidKey>(META_STORE, "readwrite", (store) => store.put(next, CLOUD_BACKUP_KEY))
  return next
}

export async function markCloudBackupComplete() {
  const next: PayMapCloudBackupState = {
    enabled: true,
    lastBackupAt: new Date().toISOString(),
    provider: "paymap-cloud",
  }
  await withStore<IDBValidKey>(META_STORE, "readwrite", (store) => store.put(next, CLOUD_BACKUP_KEY))
  return next
}

export async function deleteLocalFinancialData() {
  await withStore<undefined>(ENTRY_STORE, "readwrite", (store) => store.clear())
}

export async function deleteCloudBackupMetadata() {
  const next: PayMapCloudBackupState = { enabled: false, lastBackupAt: null, provider: null }
  await withStore<IDBValidKey>(META_STORE, "readwrite", (store) => store.put(next, CLOUD_BACKUP_KEY))
  return next
}

export async function buildPayMapBackup(): Promise<PayMapBackupFile> {
  const [entries, cloudBackup] = await Promise.all([listLocalFinancialEntries(), getCloudBackupState()])
  return {
    format: "paymap.local.backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    deviceOnly: !cloudBackup.enabled,
    cloudBackup,
    entries,
  }
}

export function downloadPayMapBackup(backup: PayMapBackupFile) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/paymap+json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `paymap-backup-${new Date().toISOString().slice(0, 10)}.paymap.json`
  link.click()
  URL.revokeObjectURL(url)
}

export async function readPayMapBackupFile(file: File): Promise<PayMapBackupFile> {
  if (!file.name.endsWith(".paymap.json") && !file.name.endsWith(".json")) {
    throw new Error("Please choose a .paymap.json backup file.")
  }
  return JSON.parse(await file.text()) as PayMapBackupFile
}
