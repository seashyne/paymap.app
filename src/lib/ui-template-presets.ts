import type { DefaultPage, UiPreferences, DashboardTemplate } from "@/lib/ui-preferences"

export type TemplatePreset = {
  id: DashboardTemplate
  label: string
  badge: string
  description: string
  recommendedMode: "personal" | "business" | "merchant"
  appearance: Pick<UiPreferences, "defaultPage" | "primaryColor" | "sidebarColor" | "sidebarWidth" | "fontFamily" | "borderRadius" | "showQuickActions" | "showCharts" | "showBottomNav" | "themeMode">
  shell: {
    maxWidth: number
    heroGlow: string
    panelStyle: "airy" | "executive" | "commerce" | "family"
    contentPadding: number
    topNavStyle: "chips" | "tabs"
  }
}

const TEMPLATE_PRESETS: Record<DashboardTemplate, TemplatePreset> = {
  personal: {
    id: "personal",
    label: "Personal Focus",
    badge: "Personal",
    description: "โฟกัสภาพรวมการเงินส่วนตัว อ่านง่าย โปร่ง และเข้าถึง Wallet / Reports เร็ว",
    recommendedMode: "personal",
    appearance: {
      defaultPage: "dashboard",
      primaryColor: "#7c3aed",
      sidebarColor: "rgba(15, 23, 42, 0.92)",
      sidebarWidth: 272,
      fontFamily: "dm-sans",
      borderRadius: 24,
      showQuickActions: true,
      showCharts: true,
      showBottomNav: true,
      themeMode: "dark",
    },
    shell: { maxWidth: 1520, heroGlow: "var(--blue)", panelStyle: "airy", contentPadding: 32, topNavStyle: "chips" },
  },
  business: {
    id: "business",
    label: "Business Executive",
    badge: "Business",
    description: "เน้นความเป็น executive workspace หนาแน่นขึ้น เหมาะกับ payroll, accounting และ reports",
    recommendedMode: "business",
    appearance: {
      defaultPage: "business",
      primaryColor: "#0ea5e9",
      sidebarColor: "rgba(5, 12, 26, 0.96)",
      sidebarWidth: 312,
      fontFamily: "inter",
      borderRadius: 20,
      showQuickActions: true,
      showCharts: true,
      showBottomNav: false,
      themeMode: "dark",
    },
    shell: { maxWidth: 1680, heroGlow: "#38bdf8", panelStyle: "executive", contentPadding: 36, topNavStyle: "tabs" },
  },
  merchant: {
    id: "merchant",
    label: "Merchant Control",
    badge: "Merchant",
    description: "ออกแบบให้เห็นยอดขาย สต็อก และ action เร็วขึ้น เหมาะกับ owner ที่ใช้หน้าร้านทุกวัน",
    recommendedMode: "merchant",
    appearance: {
      defaultPage: "merchant",
      primaryColor: "#e11d48",
      sidebarColor: "rgba(28, 10, 19, 0.95)",
      sidebarWidth: 296,
      fontFamily: "inter",
      borderRadius: 18,
      showQuickActions: true,
      showCharts: true,
      showBottomNav: true,
      themeMode: "dark",
    },
    shell: { maxWidth: 1600, heroGlow: "#fb7185", panelStyle: "commerce", contentPadding: 30, topNavStyle: "tabs" },
  },
  family: {
    id: "family",
    label: "Family Shared Hub",
    badge: "Family",
    description: "โทนสว่างขึ้น มนขึ้น และเน้น family / goals / overview สำหรับใช้งานร่วมกันในบ้าน",
    recommendedMode: "personal",
    appearance: {
      defaultPage: "dashboard",
      primaryColor: "#14b8a6",
      sidebarColor: "rgba(10, 34, 39, 0.88)",
      sidebarWidth: 264,
      fontFamily: "noto-sans-thai",
      borderRadius: 28,
      showQuickActions: false,
      showCharts: true,
      showBottomNav: true,
      themeMode: "light",
    },
    shell: { maxWidth: 1480, heroGlow: "#14b8a6", panelStyle: "family", contentPadding: 28, topNavStyle: "chips" },
  },
}

export function getTemplatePreset(template: DashboardTemplate) {
  return TEMPLATE_PRESETS[template] ?? TEMPLATE_PRESETS.personal
}

export function applyTemplatePreset(template: DashboardTemplate, current?: UiPreferences): UiPreferences {
  const preset = getTemplatePreset(template)
  return {
    ...(current ?? {} as UiPreferences),
    ...preset.appearance,
    template,
  }
}

export function getTemplateCssVars(template: DashboardTemplate): Record<string, string> {
  const preset = getTemplatePreset(template)
  return {
    "--app-max-width": `${preset.shell.maxWidth}px`,
    "--page-shell-padding": `${preset.shell.contentPadding}px`,
    "--template-hero-glow": preset.shell.heroGlow,
  }
}

export function getTemplateSummary(template: DashboardTemplate) {
  const preset = getTemplatePreset(template)
  return `${preset.label} · ${preset.description}`
}

export function getTemplateLandingPage(template: DashboardTemplate): DefaultPage {
  return getTemplatePreset(template).appearance.defaultPage
}
