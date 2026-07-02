
export type DashboardTemplate = "personal" | "business" | "merchant" | "family"
export type DefaultPage = "dashboard" | "wallets" | "reports" | "business" | "merchant" | "settings" | "pricing" | "landing"
export type FontPreset = "dm-sans" | "inter" | "noto-sans-thai" | "system" | "mono"
export type ThemeMode = "dark" | "light" | "system" | "executive"

export type UiPreferences = {
  template: DashboardTemplate
  defaultPage: DefaultPage
  primaryColor: string
  sidebarColor: string
  sidebarWidth: number
  fontFamily: FontPreset
  borderRadius: number
  showQuickActions: boolean
  showCharts: boolean
  showBottomNav: boolean
  themeMode: ThemeMode
}

export const PRESET_COLORS = [
  "#7c3aed",
  "#2563eb",
  "#0ea5e9",
  "#14b8a6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#e11d48",
] as const

export const DEFAULT_UI_PREFERENCES: UiPreferences = {
  template: "personal",
  defaultPage: "dashboard",
  primaryColor: "#2563eb",
  sidebarColor: "rgba(255,255,255,0.92)",
  sidebarWidth: 280,
  fontFamily: "dm-sans",
  borderRadius: 24,
  showQuickActions: true,
  showCharts: true,
  showBottomNav: false,
  themeMode: "light",
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
const RGBA_RE = /^rgba?\([\d\s,.%]+\)$/i

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback
}

function asNumber(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}

function asColor(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback
  const trimmed = value.trim()
  if (HEX_RE.test(trimmed) || RGBA_RE.test(trimmed)) return trimmed
  return fallback
}

function asTemplate(value: unknown, fallback: DashboardTemplate): DashboardTemplate {
  return value === "business" || value === "merchant" || value === "family" || value === "personal" ? value : fallback
}

function asDefaultPage(value: unknown, fallback: DefaultPage): DefaultPage {
  switch (value) {
    case "wallets":
    case "reports":
    case "business":
    case "merchant":
    case "settings":
    case "pricing":
    case "landing":
    case "dashboard":
      return value
    default:
      return fallback
  }
}



function asThemeMode(value: unknown, fallback: ThemeMode): ThemeMode {
  switch (value) {
    case "light":
    case "system":
    case "dark":
    case "executive":
      return value
    default:
      return fallback
  }
}

function asFont(value: unknown, fallback: FontPreset): FontPreset {
  switch (value) {
    case "inter":
    case "noto-sans-thai":
    case "system":
    case "mono":
    case "dm-sans":
      return value
    default:
      return fallback
  }
}

export function sanitizeUiPreferences(input: unknown): UiPreferences {
  const source = (input && typeof input === "object") ? input as Record<string, unknown> : {}
  return {
    template: asTemplate(source.template, DEFAULT_UI_PREFERENCES.template),
    defaultPage: asDefaultPage(source.defaultPage, DEFAULT_UI_PREFERENCES.defaultPage),
    primaryColor: asColor(source.primaryColor, DEFAULT_UI_PREFERENCES.primaryColor),
    sidebarColor: asColor(source.sidebarColor, DEFAULT_UI_PREFERENCES.sidebarColor),
    sidebarWidth: asNumber(source.sidebarWidth, DEFAULT_UI_PREFERENCES.sidebarWidth, 240, 360),
    fontFamily: asFont(source.fontFamily, DEFAULT_UI_PREFERENCES.fontFamily),
    borderRadius: asNumber(source.borderRadius, DEFAULT_UI_PREFERENCES.borderRadius, 12, 32),
    showQuickActions: asBoolean(source.showQuickActions, DEFAULT_UI_PREFERENCES.showQuickActions),
    showCharts: asBoolean(source.showCharts, DEFAULT_UI_PREFERENCES.showCharts),
    showBottomNav: asBoolean(source.showBottomNav, DEFAULT_UI_PREFERENCES.showBottomNav),
    themeMode: asThemeMode(source.themeMode, DEFAULT_UI_PREFERENCES.themeMode),
  }
}

export function mergeUiPreferences(input: unknown): UiPreferences {
  return { ...DEFAULT_UI_PREFERENCES, ...sanitizeUiPreferences(input) }
}

export function getFontStack(font: FontPreset) {
  switch (font) {
    case "inter":
      return 'Inter, "Noto Sans Thai", system-ui, sans-serif'
    case "noto-sans-thai":
      return '"Noto Sans Thai", "DM Sans", sans-serif'
    case "system":
      return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    case "mono":
      return '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace'
    case "dm-sans":
    default:
      return '"DM Sans", "Noto Sans Thai", sans-serif'
  }
}

export function getDefaultPageHref(page: DefaultPage) {
  switch (page) {
    case "wallets": return "/wallets"
    case "reports": return "/reports"
    case "business": return "/business"
    case "merchant": return "/merchant"
    case "settings": return "/settings"
    case "pricing": return "/pricing"
    case "landing": return "/"
    case "dashboard":
    default:
      return "/dashboard"
  }
}

export function getUiPreferenceCssVars(prefs: UiPreferences): Record<string, string> {
  return {
    "--primary": prefs.primaryColor,
    "--amber": prefs.primaryColor,
    "--amber2": prefs.primaryColor,
    "--primary-soft": `color-mix(in srgb, ${prefs.primaryColor} 16%, transparent)`,
    "--font-sans": getFontStack(prefs.fontFamily),
    "--app-radius": `${prefs.borderRadius}px`,
    "--sidebar-width": `${prefs.sidebarWidth}px`,
    "--sidebar-custom-bg": prefs.sidebarColor,
  }
}


export type PreferenceWorkspaceMode = "personal" | "business" | "merchant"

export function getModeAwareDefaultPageHref(page: DefaultPage, mode: PreferenceWorkspaceMode = "personal") {
  if (mode === "business") {
    switch (page) {
      case "business":
      case "dashboard":
      case "wallets":
        return "/business"
      case "reports":
        return "/reports/financial"
      case "settings":
        return "/settings"
      case "pricing":
        return "/pricing?product=business"
      case "landing":
        return "/"
      case "merchant":
        return "/business"
      default:
        return "/business"
    }
  }

  if (mode === "merchant") {
    switch (page) {
      case "merchant":
      case "dashboard":
      case "wallets":
        return "/merchant"
      case "reports":
        return "/reports"
      case "settings":
        return "/settings"
      case "pricing":
        return "/pricing?product=merchant"
      case "landing":
        return "/"
      case "business":
        return "/merchant"
      default:
        return "/merchant"
    }
  }

  switch (page) {
    case "business":
    case "merchant":
      return "/dashboard"
    default:
      return getDefaultPageHref(page)
  }
}
