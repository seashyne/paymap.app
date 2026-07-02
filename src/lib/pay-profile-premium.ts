// Premium Pay Profile — design system

export type CoverStyle    = "color" | "image" | "gradient" | "pattern"
export type FrameStyle    = "rounded" | "circle" | "hexagon" | "ring" | "glow" | "badge"
export type FontStyle     = "default" | "serif" | "mono" | "bold" | "elegant"
export type LayoutStyle   = "center" | "left" | "card" | "minimal" | "magazine"
export type FrameGradient = "none" | "gold" | "silver" | "rose" | "ocean" | "aurora" | "fire"

// ── Gradient presets (coverGradient value) ───────────────────────
export const COVER_GRADIENTS: { id: string; label: string; value: string; preview: string }[] = [
  { id:"violet-blue",  label:"Violet Blue",  value:"135deg,#7c3aed,#2563eb",  preview:"linear-gradient(135deg,#7c3aed,#2563eb)" },
  { id:"rose-orange",  label:"Sunset",       value:"135deg,#e11d48,#f97316",  preview:"linear-gradient(135deg,#e11d48,#f97316)" },
  { id:"teal-blue",    label:"Ocean",        value:"135deg,#0ea5e9,#14b8a6",  preview:"linear-gradient(135deg,#0ea5e9,#14b8a6)" },
  { id:"green-teal",   label:"Emerald",      value:"135deg,#10b981,#0ea5e9",  preview:"linear-gradient(135deg,#10b981,#0ea5e9)" },
  { id:"pink-purple",  label:"Candy",        value:"135deg,#ec4899,#8b5cf6",  preview:"linear-gradient(135deg,#ec4899,#8b5cf6)" },
  { id:"gold-amber",   label:"Gold",         value:"135deg,#f59e0b,#d97706",  preview:"linear-gradient(135deg,#f59e0b,#d97706)" },
  { id:"dark-violet",  label:"Midnight",     value:"135deg,#0f0f1a,#1e1b4b",  preview:"linear-gradient(135deg,#0f0f1a,#1e1b4b)" },
  { id:"aurora",       label:"Aurora",       value:"135deg,#6ee7b7,#3b82f6,#9333ea", preview:"linear-gradient(135deg,#6ee7b7,#3b82f6,#9333ea)" },
]

// ── Pattern backgrounds ──────────────────────────────────────────
export const COVER_PATTERNS: { id: string; label: string }[] = [
  { id:"dots",    label:"Dots" },
  { id:"grid",    label:"Grid" },
  { id:"waves",   label:"Waves" },
  { id:"circuit", label:"Circuit" },
  { id:"noise",   label:"Noise" },
  { id:"diamond", label:"Diamond" },
]

// ── Frame presets ────────────────────────────────────────────────
export const FRAME_GRADIENTS: { id: FrameGradient; label: string; style: string }[] = [
  { id:"none",    label:"ไม่มี",     style:"" },
  { id:"gold",    label:"ทอง",      style:"linear-gradient(135deg,#f59e0b,#d97706,#fbbf24)" },
  { id:"silver",  label:"เงิน",     style:"linear-gradient(135deg,#94a3b8,#cbd5e1,#64748b)" },
  { id:"rose",    label:"Rose",     style:"linear-gradient(135deg,#fb7185,#f43f5e,#fda4af)" },
  { id:"ocean",   label:"Ocean",    style:"linear-gradient(135deg,#0ea5e9,#2563eb,#38bdf8)" },
  { id:"aurora",  label:"Aurora",   style:"linear-gradient(135deg,#6ee7b7,#3b82f6,#9333ea)" },
  { id:"fire",    label:"Fire",     style:"linear-gradient(135deg,#ef4444,#f97316,#fbbf24)" },
]

// ── Font stacks ──────────────────────────────────────────────────
export const FONT_STYLES: { id: FontStyle; label: string; family: string; preview: string }[] = [
  { id:"default", label:"Default",  family:"var(--font-sans)",    preview:"Aa" },
  { id:"serif",   label:"Serif",    family:"Georgia, serif",      preview:"Aa" },
  { id:"mono",    label:"Mono",     family:"'Courier New', mono", preview:"Aa" },
  { id:"bold",    label:"Bold",     family:"var(--font-sans)",    preview:"Aa" },
  { id:"elegant", label:"Elegant",  family:"Palatino, serif",     preview:"Aa" },
]

// ── Layout styles ────────────────────────────────────────────────
export const LAYOUT_STYLES: { id: LayoutStyle; label: string; desc: string }[] = [
  { id:"center",   label:"Classic",  desc:"กลางหน้า — เหมาะกับทุกแบบ" },
  { id:"left",     label:"Modern",   desc:"ซ้ายจัด — ดู professional" },
  { id:"card",     label:"Card",     desc:"กล่องใหญ่ — เน้น brand" },
  { id:"minimal",  label:"Minimal",  desc:"เรียบ — เน้นข้อมูล" },
  { id:"magazine", label:"Magazine", desc:"รูปใหญ่เต็ม — เหมาะ creator" },
]

// ── Helper: build CSS background from profile ───────────────────
export function buildCoverCSS(p: {
  coverStyle?: string | null
  coverColor?: string | null
  coverGradient?: string | null
  coverPattern?: string | null
  coverImageUrl?: string | null
}, fallbackColor = "#7c3aed"): string {
  switch (p.coverStyle) {
    case "gradient":
      if (p.coverGradient) {
        const parts = p.coverGradient.split(",")
        return `linear-gradient(${parts.join(",")})`
      }
      return fallbackColor
    case "image":
      if (p.coverImageUrl)
        return `url(${p.coverImageUrl}) center/cover no-repeat`
      return fallbackColor
    case "pattern":
      return fallbackColor // pattern บน color — render ด้วย SVG overlay
    default:
      return p.coverColor ?? fallbackColor
  }
}

// ── Helper: build avatar wrapper CSS ───────────────────────────
export function buildFrameCSS(p: {
  frameGradient?: string | null
  frameColor?:    string | null
  frameStyle?:    string | null
}, accentColor = "#7c3aed") {
  const fg = FRAME_GRADIENTS.find(f => f.id === p.frameGradient)
  const border = fg?.style || (p.frameColor ? p.frameColor : `${accentColor}40`)
  const borderStyle = fg?.style ? `2px solid transparent` : `3px solid ${border}`
  const backgroundClip = fg?.style ? "padding-box, border-box" : undefined
  const backgroundImage = fg?.style ? `none, ${fg.style}` : undefined
  return { borderStyle, backgroundClip, backgroundImage, borderRadius: buildFrameRadius(p.frameStyle) }
}

function buildFrameRadius(style?: string | null) {
  switch (style) {
    case "circle":  return "50%"
    case "hexagon": return "30% 70% 70% 30% / 30% 30% 70% 70%"
    case "badge":   return "8px"
    default:        return "20px"
  }
}

// ── Plan gate ────────────────────────────────────────────────────
export function isPremiumCustomization(plan: string, tier?: string | null): boolean {
  const paid = ["pro","family","sme","scale","enterprise","starter","growth"]
  return paid.includes(plan) || (tier ? paid.includes(tier) : false)
}
