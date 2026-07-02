// PayMap v5 — Plugin System
// Lightweight plugin registry — plugins can hook into events and extend UI

export interface PluginManifest {
  name: string
  version: string
  description?: string
  author?: string
  hooks?: PluginHook[]
  permissions?: PluginPermission[]
}

export type PluginHook =
  | "onTransaction"
  | "onPayroll"
  | "onInvoice"
  | "onDashboard"
  | "onSettings"

export type PluginPermission =
  | "read:transactions"
  | "write:transactions"
  | "read:reports"
  | "read:payroll"
  | "write:payroll"

export interface Plugin {
  manifest: PluginManifest
  onTransaction?: (tx: Record<string, unknown>) => Promise<void>
  onPayroll?: (payroll: Record<string, unknown>) => Promise<void>
  onInvoice?: (invoice: Record<string, unknown>) => Promise<void>
}

const registry = new Map<string, Plugin>()

export function registerPlugin(plugin: Plugin): void {
  const { name } = plugin.manifest
  if (registry.has(name)) {
    console.warn(`[Plugins] Plugin "${name}" already registered — replacing`)
  }
  registry.set(name, plugin)
  console.log(`[Plugins] Registered: ${name} v${plugin.manifest.version}`)
}

export function getPlugin(name: string): Plugin | undefined {
  return registry.get(name)
}

export function listPlugins(): PluginManifest[] {
  return Array.from(registry.values()).map((p) => p.manifest)
}

export async function dispatchHook(hook: PluginHook, payload: Record<string, unknown>): Promise<void> {
  for (const [name, plugin] of registry) {
    try {
      if (hook === "onTransaction" && plugin.onTransaction) {
        await plugin.onTransaction(payload)
      } else if (hook === "onPayroll" && plugin.onPayroll) {
        await plugin.onPayroll(payload)
      } else if (hook === "onInvoice" && plugin.onInvoice) {
        await plugin.onInvoice(payload)
      }
    } catch (err: any) {
      console.error(`[Plugins] Hook "${hook}" failed in plugin "${name}": ${err?.message}`)
    }
  }
}
