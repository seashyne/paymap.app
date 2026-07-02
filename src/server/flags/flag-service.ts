const defaultFlags: Record<string, boolean> = {
  "new-dashboard": true,
  "admin-center": true,
  "realtime-dashboard": true,
}

export async function isEnabled(flag: string, _workspaceId?: string) {
  const envKey = `FEATURE_${flag.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`
  const raw = process.env[envKey]
  if (raw === "true") return true
  if (raw === "false") return false
  return !!defaultFlags[flag]
}
