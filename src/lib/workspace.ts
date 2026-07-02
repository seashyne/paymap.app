export type WorkspaceMode = "personal" | "business" | "merchant"

export function normalizeWorkspaceMode(mode?: string | null): WorkspaceMode {
  if (mode === "business" || mode === "merchant") return mode
  return "personal"
}

export const normalizeAccountMode = normalizeWorkspaceMode

export function isSafeInternalRedirectPath(path?: string | null) {
  if (!path || typeof path !== "string") return false
  if (!path.startsWith("/")) return false
  if (path.startsWith("//")) return false
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(path)) return false
  return true
}

export function sanitizeInternalRedirectPath(path?: string | null, fallback = "/dashboard") {
  return isSafeInternalRedirectPath(path) ? path : fallback
}

export function workspacePath(mode?: string | null) {
  switch (normalizeWorkspaceMode(mode)) {
    case "business":
      return "/business"
    case "merchant":
      return "/merchant"
    default:
      return "/dashboard"
  }
}

export const accountHomePath = workspacePath

export function inferWorkspaceModeFromPath(path?: string | null): WorkspaceMode | null {
  if (typeof path !== "string" || !isSafeInternalRedirectPath(path)) return null
  const safePath = path
  if (safePath.startsWith("/business")) return "business"
  if (safePath.startsWith("/merchant")) return "merchant"
  if (
    safePath.startsWith("/dashboard") ||
    safePath.startsWith("/wallets") ||
    safePath.startsWith("/analytics") ||
    safePath.startsWith("/reports") ||
    safePath.startsWith("/billing") ||
    safePath.startsWith("/settings") ||
    safePath.startsWith("/planner") ||
    safePath.startsWith("/tax") ||
    safePath.startsWith("/installments") ||
    safePath.startsWith("/investments") ||
    safePath.startsWith("/loans") ||
    safePath.startsWith("/networth") ||
    safePath.startsWith("/simulation") ||
    safePath.startsWith("/achievements")
  ) {
    return "personal"
  }
  return null
}

export function buildWorkspaceSelectPath(nextPath?: string | null) {
  const safeNext = sanitizeInternalRedirectPath(nextPath, "")
  return safeNext ? `/workspace/select?next=${encodeURIComponent(safeNext)}` : "/workspace/select"
}

export function resolvePostAuthPath(mode?: string | null, nextPath?: string | null) {
  const normalized = normalizeWorkspaceMode(mode)
  const fallback = workspacePath(normalized)
  if (!nextPath) return fallback
  if (!isSafeInternalRedirectPath(nextPath)) return fallback

  // Always redirect away from auth/public pages
  const blockedPrefixes = ["/login", "/register", "/workspace/select", "/pricing", "/pay/"]
  if (blockedPrefixes.some(p => nextPath.startsWith(p))) return fallback

  // Block cross-mode deep links
  if (normalized === "personal" && (nextPath.startsWith("/business") || nextPath.startsWith("/merchant"))) return fallback
  if (normalized === "business" && nextPath.startsWith("/merchant")) return fallback
  if (normalized === "merchant" && nextPath.startsWith("/business")) return fallback

  // Allow /w/[slug] workspace routes — they self-validate via resolveWorkspaceSlug
  if (nextPath.startsWith("/w/")) return nextPath

  return nextPath
}
