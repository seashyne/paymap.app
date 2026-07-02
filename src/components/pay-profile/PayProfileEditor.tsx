"use client"

import { useMemo, useState, type InputHTMLAttributes, type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Image,
  Layout,
  Loader2,
  Lock,
  Palette,
  Phone,
  Plus,
  Sparkles,
  Star,
  Store,
  Wallet,
  X,
} from "lucide-react"
import Link from "next/link"
import FileUploader from "@/components/ui/FileUploader"
import {
  COVER_GRADIENTS,
  COVER_PATTERNS,
  FRAME_GRADIENTS,
  FONT_STYLES,
  LAYOUT_STYLES,
  buildCoverCSS,
  isPremiumCustomization,
  type CoverStyle,
  type FrameGradient,
  type FrameStyle,
  type FontStyle,
  type LayoutStyle,
} from "@/lib/pay-profile-premium"

type WorkspaceType = "personal" | "business" | "merchant"

type ExistingProfile = {
  id: string
  slug: string
  displayName: string
  bio?: string | null
  avatarUrl?: string | null
  coverColor?: string | null
  isActive: boolean
  coverImageUrl?: string | null
  coverStyle?: string | null
  coverGradient?: string | null
  coverPattern?: string | null
  frameStyle?: string | null
  frameColor?: string | null
  frameGradient?: string | null
  fontStyle?: string | null
  layoutStyle?: string | null
  badgeText?: string | null
  badgeColor?: string | null
  promptpayId?: string | null
  promptpayType?: "PHONE" | "NID" | "TAX" | null
  bankAccount?: string | null
  bankName?: string | null
  presetAmounts: number[]
  currency: string
  allowCustom: boolean
  requestNote: boolean
  totalReceived: number
}

type ProfileTemplate = {
  id: "creator" | "shop" | "minimal"
  label: string
  displayName: string
  bio: string
  coverStyle: CoverStyle
  coverColor?: string
  coverGradient?: string
  frameStyle: FrameStyle
  fontStyle: FontStyle
  layoutStyle: LayoutStyle
  badgeText: string
}

const MODE_META: Record<WorkspaceType, { label: string; icon: LucideIcon; color: string }> = {
  personal: { label: "Personal", icon: Wallet, color: "#7c3aed" },
  business: { label: "Business", icon: Building2, color: "#0ea5e9" },
  merchant: { label: "Merchant", icon: Store, color: "#e11d48" },
}

const PRESET_SUGGESTIONS = [50, 100, 150, 200, 300, 500, 1000, 2000, 3000, 5000]

const PROFILE_TEMPLATES: readonly ProfileTemplate[] = [
  {
    id: "creator",
    label: "Creator",
    displayName: "ชื่อของคุณ",
    bio: "รับทิป ค่าบริการ หรือการสนับสนุน",
    coverStyle: "gradient",
    coverGradient: COVER_GRADIENTS[0].value,
    frameStyle: "circle",
    fontStyle: "bold",
    layoutStyle: "center",
    badgeText: "Support",
  },
  {
    id: "shop",
    label: "Shop",
    displayName: "ชื่อร้าน",
    bio: "รับชำระค่าสินค้าและบริการ",
    coverStyle: "color",
    coverColor: "#0f766e",
    frameStyle: "rounded",
    fontStyle: "default",
    layoutStyle: "card",
    badgeText: "Open",
  },
  {
    id: "minimal",
    label: "Minimal",
    displayName: "ชื่อบัญชี",
    bio: "สแกนและจ่ายได้ทันที",
    coverStyle: "color",
    coverColor: "#111827",
    frameStyle: "badge",
    fontStyle: "mono",
    layoutStyle: "minimal",
    badgeText: "Pay",
  },
] as const

type EditorTab = "basic" | "cover" | "avatar" | "style" | "payment" | "options"

type EditorTabItem = {
  id: EditorTab
  label: string
  icon: LucideIcon
  premium?: boolean
}

const EDITOR_TABS: EditorTabItem[] = [
  { id: "basic", label: "พื้นฐาน", icon: Wallet },
  { id: "cover", label: "พื้นหลัง", icon: Image, premium: true },
  { id: "avatar", label: "รูป & กรอบ", icon: Star, premium: true },
  { id: "style", label: "สไตล์", icon: Palette, premium: true },
  { id: "payment", label: "รับเงิน", icon: CreditCard },
  { id: "options", label: "ตัวเลือก", icon: Layout },
]

function Msg({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm"
      style={{
        background: ok ? "rgba(16,185,129,0.1)" : "rgba(248,113,113,0.1)",
        color: ok ? "#10b981" : "#f87171",
      }}
    >
      {ok ? <Check size={14} /> : <X size={14} />} {text}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>
          {label}
        </label>
        {hint ? (
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            {hint}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  )
}

function TInput({ icon: Icon, ...props }: { icon?: LucideIcon } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      {Icon ? (
        <Icon
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-3)" }}
        />
      ) : null}
      <input
        {...props}
        className={`w-full rounded-xl py-2.5 text-sm outline-none ${Icon ? "pl-9 pr-3" : "px-3"}`}
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
      />
    </div>
  )
}

function PremiumGate({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40">{children}</div>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.55)" }}
      >
        <Lock size={20} color="#fbbf24" />
        <div className="text-sm font-bold text-white">Premium Feature</div>
        <Link href="/pricing" className="rounded-full px-4 py-1.5 text-xs font-bold" style={{ background: "#fbbf24", color: "#000" }}>
          Upgrade ดู Plans →
        </Link>
      </div>
    </div>
  )
}

function Toggle({ val, set, label, desc }: { val: boolean; set: (v: boolean) => void; label: string; desc: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          {label}
        </div>
        <div className="text-xs" style={{ color: "var(--text-3)" }}>
          {desc}
        </div>
      </div>
      <button
        type="button"
        onClick={() => set(!val)}
        className="relative h-6 w-11 rounded-full transition-colors"
        style={{ background: val ? "#10b981" : "var(--border)" }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: val ? "translateX(20px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  )
}

export default function PayProfileEditor({
  workspaceType,
  existing,
  userPlan = "free",
  userSubTier,
}: {
  workspaceType: WorkspaceType
  existing: ExistingProfile | null
  userPlan?: string
  userSubTier?: string
}) {
  const router = useRouter()
  const meta = MODE_META[workspaceType]
  const ModeIcon = meta.icon
  const color = meta.color
  const isPremium = isPremiumCustomization(userPlan, userSubTier)

  const [tab, setTab] = useState<EditorTab>("basic")
  const [displayName, setDisplayName] = useState(existing?.displayName ?? "")
  const [bio, setBio] = useState(existing?.bio ?? "")
  const [avatarUrl, setAvatarUrl] = useState(existing?.avatarUrl ?? "")
  const [badgeText, setBadgeText] = useState(existing?.badgeText ?? "")
  const [badgeColor, setBadgeColor] = useState(existing?.badgeColor ?? "#fbbf24")
  const [coverStyle, setCoverStyle] = useState<CoverStyle>((existing?.coverStyle as CoverStyle) ?? "color")
  const [coverColor, setCoverColor] = useState(existing?.coverColor ?? color)
  const [coverGrad, setCoverGrad] = useState(existing?.coverGradient ?? COVER_GRADIENTS[0].value)
  const [coverImg, setCoverImg] = useState(existing?.coverImageUrl ?? "")
  const [coverPattern, setCoverPattern] = useState(existing?.coverPattern ?? "dots")
  const [frameStyle, setFrameStyle] = useState<FrameStyle>((existing?.frameStyle as FrameStyle) ?? "rounded")
  const [frameColor, setFrameColor] = useState(existing?.frameColor ?? color)
  const [frameGrad, setFrameGrad] = useState<FrameGradient>((existing?.frameGradient as FrameGradient) ?? "none")
  const [fontStyle, setFontStyle] = useState<FontStyle>((existing?.fontStyle as FontStyle) ?? "default")
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>((existing?.layoutStyle as LayoutStyle) ?? "center")
  const [promptpayId, setPromptpayId] = useState(existing?.promptpayId ?? "")
  const [promptpayType, setPromptpayType] = useState<"PHONE" | "NID" | "TAX">(existing?.promptpayType ?? "PHONE")
  const [bankAccount, setBankAccount] = useState(existing?.bankAccount ?? "")
  const [bankName, setBankName] = useState(existing?.bankName ?? "")
  const [presets, setPresets] = useState<number[]>(existing?.presetAmounts ?? [])
  const [allowCustom, setAllowCustom] = useState(existing?.allowCustom ?? true)
  const [requestNote, setRequestNote] = useState(existing?.requestNote ?? false)
  const [isActive, setIsActive] = useState(existing?.isActive ?? true)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const publicUrl = existing
    ? `${typeof window !== "undefined" ? window.location.origin : "https://paymap.app"}/pay/${existing.slug}`
    : null

  const previewCover = buildCoverCSS(
    {
      coverStyle,
      coverColor,
      coverGradient: coverGrad,
      coverPattern,
      coverImageUrl: coverImg || null,
    },
    color,
  )

  const avatarShapeStyle = useMemo(
    () => ({
      borderRadius: frameStyle === "circle" ? "50%" : frameStyle === "badge" ? "8px" : "20px",
      outline: frameGrad !== "none" ? "3px solid transparent" : frameColor ? `3px solid ${frameColor}` : `3px solid ${color}40`,
      outlineOffset: "2px",
    }),
    [color, frameColor, frameGrad, frameStyle],
  )

  function togglePreset(amount: number) {
    setPresets((current) =>
      current.includes(amount) ? current.filter((x) => x !== amount) : [...current, amount].sort((a, b) => a - b),
    )
  }

  function applyTemplate(templateId: ProfileTemplate["id"]) {
    const template = PROFILE_TEMPLATES.find((item) => item.id === templateId)
    if (!template) return
    setDisplayName((current) => current || template.displayName)
    setBio((current) => current || template.bio)
    setCoverStyle(template.coverStyle)
    if (template.coverColor) setCoverColor(template.coverColor)
    if (template.coverGradient) setCoverGrad(template.coverGradient)
    setFrameStyle(template.frameStyle)
    setFontStyle(template.fontStyle)
    setLayoutStyle(template.layoutStyle)
    setBadgeText((current) => current || template.badgeText)
  }

  async function handleSave() {
    if (!displayName.trim()) {
      setMsg({ ok: false, text: "กรุณากรอกชื่อ" })
      return
    }

    setLoading(true)
    setMsg(null)

    try {
      const payload = {
        workspaceType,
        displayName,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        badgeText: badgeText || null,
        badgeColor,
        coverStyle,
        coverColor,
        coverGradient: coverGrad || null,
        coverImageUrl: coverImg || null,
        coverPattern: coverPattern || null,
        frameStyle,
        frameColor,
        frameGradient: frameGrad !== "none" ? frameGrad : null,
        fontStyle,
        layoutStyle,
        promptpayId: promptpayId || null,
        promptpayType,
        bankAccount: bankAccount || null,
        bankName: bankName || null,
        presetAmounts: presets,
        allowCustom,
        requestNote,
        isActive,
      }

      const res = await fetch("/api/pay-profile", {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (!res.ok) {
        setMsg({ ok: false, text: json.error })
        return
      }

      setMsg({ ok: true, text: existing ? "บันทึกสำเร็จ" : "สร้าง Pay Profile แล้ว!" })
      if (!existing) router.refresh()
    } catch {
      setMsg({ ok: false, text: "เกิดข้อผิดพลาด" })
    } finally {
      setLoading(false)
    }
  }

  function copyLink() {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderBasicTab = () => (
    <div className="space-y-4 rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <Field label="เริ่มจากเทมเพลต">
        <div className="grid gap-2 sm:grid-cols-3">
          {PROFILE_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => applyTemplate(template.id)}
              className="rounded-2xl border px-4 py-3 text-left transition-all hover:opacity-90"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
            >
              <div className="text-sm font-black">{template.label}</div>
              <div className="mt-1 text-xs" style={{ color: "var(--text-3)" }}>
                เลือกแล้วแก้ต่อได้ทันที
              </div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="ชื่อที่แสดง">
        <TInput value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="ชื่อที่ลูกค้าจะเห็น" />
      </Field>

      <Field label="คำอธิบาย">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          maxLength={200}
          placeholder="ข้อความสั้นใต้ชื่อ"
          className="w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
      </Field>

      <Field label="รูปโปรไฟล์">
        <div className="space-y-3">
          <FileUploader category="avatars" label="อัปโหลดรูป" hint="JPG, PNG หรือ WebP สูงสุด 2MB" onSuccess={(url) => setAvatarUrl(url)} />
          <TInput icon={Image} value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="หรือวาง URL รูปภาพ" type="url" />
        </div>
      </Field>
    </div>
  )

  const renderCoverTab = () => {
    const content = (
      <div className="space-y-5 rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <Field label="ประเภทพื้นหลัง">
          <div className="grid grid-cols-4 gap-2">
            {([
              { id: "color", label: "สีพื้น" },
              { id: "gradient", label: "Gradient" },
              { id: "image", label: "รูปภาพ" },
              { id: "pattern", label: "Pattern" },
            ] as const).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCoverStyle(t.id)}
                className="rounded-xl py-2 text-xs font-bold transition-all"
                style={{
                  background: coverStyle === t.id ? color : "var(--surface-2)",
                  color: coverStyle === t.id ? "#fff" : "var(--text-2)",
                  border: `1px solid ${coverStyle === t.id ? color : "var(--border)"}`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        {coverStyle === "color" ? (
          <Field label="สีพื้นหลัง">
            <div className="flex items-center gap-3">
              <input type="color" value={coverColor} onChange={(e) => setCoverColor(e.target.value)} className="h-10 w-16 cursor-pointer rounded-xl" style={{ background: "transparent", border: "none" }} />
              <div className="flex flex-wrap gap-2">
                {["#7c3aed", "#0ea5e9", "#e11d48", "#10b981", "#f59e0b", "#0f172a", "#1e293b", "#ffffff"].map((value) => (
                  <button key={value} type="button" onClick={() => setCoverColor(value)} className="h-8 w-8 rounded-lg border-2 transition-all" style={{ background: value, borderColor: coverColor === value ? "var(--text)" : "var(--border)" }} />
                ))}
              </div>
            </div>
          </Field>
        ) : null}

        {coverStyle === "gradient" ? (
          <Field label="เลือก Gradient">
            <div className="grid grid-cols-4 gap-2">
              {COVER_GRADIENTS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setCoverGrad(g.value)}
                  className="h-14 rounded-xl border-2 text-xs font-bold text-white transition-all"
                  style={{
                    background: g.preview,
                    borderColor: coverGrad === g.value ? "white" : "transparent",
                    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </Field>
        ) : null}

        {coverStyle === "image" ? (
          <Field label="URL รูปภาพพื้นหลัง">
            <TInput icon={Image} value={coverImg} onChange={(e) => setCoverImg(e.target.value)} placeholder="https://..." type="url" />
          </Field>
        ) : null}

        {coverStyle === "pattern" ? (
          <Field label="เลือก Pattern">
            <div className="flex flex-wrap gap-2">
              {COVER_PATTERNS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCoverPattern(p.id)}
                  className="rounded-xl px-4 py-2 text-xs font-bold transition-all"
                  style={{
                    background: coverPattern === p.id ? color : "var(--surface-2)",
                    color: coverPattern === p.id ? "#fff" : "var(--text-2)",
                    border: `1px solid ${coverPattern === p.id ? color : "var(--border)"}`,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <div className="mb-1 text-xs" style={{ color: "var(--text-3)" }}>
                สีพื้น + Pattern
              </div>
              <div className="flex items-center gap-2">
                <input type="color" value={coverColor} onChange={(e) => setCoverColor(e.target.value)} className="h-9 w-14 cursor-pointer rounded-xl" />
              </div>
            </div>
          </Field>
        ) : null}
      </div>
    )

    return isPremium ? (
      content
    ) : (
      <PremiumGate>
        <div className="space-y-4 rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="grid grid-cols-4 gap-2">
            {COVER_GRADIENTS.slice(0, 4).map((g) => (
              <div key={g.id} className="h-14 rounded-xl" style={{ background: g.preview }} />
            ))}
          </div>
          <div className="h-8 rounded-xl" style={{ background: "var(--surface-2)" }} />
        </div>
      </PremiumGate>
    )
  }

  const renderAvatarTab = () => {
    const content = (
      <div className="space-y-5 rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <Field label="URL รูปโปรไฟล์">
          <TInput icon={Image} value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." type="url" />
        </Field>

        <Field label="รูปทรงกรอบ">
          <div className="flex flex-wrap gap-2">
            {([
              { id: "rounded", label: "มน" },
              { id: "circle", label: "วงกลม" },
              { id: "hexagon", label: "หกเหลี่ยม" },
              { id: "badge", label: "สี่เหลี่ยม" },
            ] as const).map((shape) => (
              <button
                key={shape.id}
                type="button"
                onClick={() => setFrameStyle(shape.id)}
                className="rounded-xl px-4 py-2 text-xs font-bold transition-all"
                style={{
                  background: frameStyle === shape.id ? color : "var(--surface-2)",
                  color: frameStyle === shape.id ? "#fff" : "var(--text-2)",
                  border: `1px solid ${frameStyle === shape.id ? color : "var(--border)"}`,
                }}
              >
                {shape.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="กรอบพิเศษ">
          <div className="grid grid-cols-4 gap-2">
            {FRAME_GRADIENTS.map((fg) => (
              <button
                key={fg.id}
                type="button"
                onClick={() => setFrameGrad(fg.id as FrameGradient)}
                className="h-10 rounded-xl border-2 text-xs font-bold transition-all"
                style={{
                  background: fg.style || "var(--surface-2)",
                  borderColor: frameGrad === fg.id ? "white" : "transparent",
                  color: fg.style ? "white" : "var(--text-2)",
                  textShadow: fg.style ? "0 1px 3px rgba(0,0,0,0.6)" : "none",
                }}
              >
                {fg.label}
              </button>
            ))}
          </div>
        </Field>

        {frameGrad === "none" ? (
          <Field label="สีกรอบ">
            <div className="flex items-center gap-3">
              <input type="color" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} className="h-9 w-14 cursor-pointer rounded-xl" />
              <div className="flex gap-2">
                {[color, "#fbbf24", "#f87171", "#34d399", "#ffffff", "#000000"].map((value) => (
                  <button key={value} type="button" onClick={() => setFrameColor(value)} className="h-7 w-7 rounded-lg border-2" style={{ background: value, borderColor: frameColor === value ? "var(--text)" : "var(--border)" }} />
                ))}
              </div>
            </div>
          </Field>
        ) : null}

        <Field label="Badge ข้อความ" hint="เช่น ✅ Verified, 🔥 Open for work">
          <div className="flex gap-2">
            <TInput value={badgeText} onChange={(e) => setBadgeText(e.target.value)} placeholder="เช่น Verified, Open for work" maxLength={20} />
            <input type="color" value={badgeColor} onChange={(e) => setBadgeColor(e.target.value)} className="h-10 w-12 shrink-0 cursor-pointer rounded-xl" />
          </div>
        </Field>
      </div>
    )

    return isPremium ? (
      content
    ) : (
      <PremiumGate>
        <div className="space-y-4 rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex gap-2">
            {["มน", "วงกลม", "หกเหลี่ยม", "สี่เหลี่ยม"].map((shape) => (
              <div key={shape} className="rounded-xl px-4 py-2 text-xs" style={{ background: "var(--surface-2)" }}>
                {shape}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {FRAME_GRADIENTS.map((fg) => (
              <div key={fg.id} className="h-10 rounded-xl" style={{ background: fg.style || "var(--surface-2)" }} />
            ))}
          </div>
        </div>
      </PremiumGate>
    )
  }

  const renderStyleTab = () => {
    const content = (
      <div className="space-y-5 rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <Field label="ฟอนต์">
          <div className="grid grid-cols-3 gap-2">
            {FONT_STYLES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFontStyle(f.id)}
                className="rounded-xl border-2 py-3 text-sm transition-all"
                style={{
                  fontFamily: f.family,
                  background: fontStyle === f.id ? `${color}15` : "var(--surface-2)",
                  borderColor: fontStyle === f.id ? color : "var(--border)",
                  color: fontStyle === f.id ? color : "var(--text-2)",
                  fontWeight: f.id === "bold" ? 900 : 500,
                }}
              >
                {f.preview} {f.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Layout">
          <div className="space-y-2">
            {LAYOUT_STYLES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLayoutStyle(l.id)}
                className="flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-sm transition-all"
                style={{
                  background: layoutStyle === l.id ? `${color}15` : "var(--surface-2)",
                  borderColor: layoutStyle === l.id ? color : "var(--border)",
                }}
              >
                <span className="font-bold" style={{ color: layoutStyle === l.id ? color : "var(--text)" }}>
                  {l.label}
                </span>
                <span className="text-xs" style={{ color: "var(--text-3)" }}>
                  {l.desc}
                </span>
              </button>
            ))}
          </div>
        </Field>
      </div>
    )

    return isPremium ? (
      content
    ) : (
      <PremiumGate>
        <div className="space-y-4 rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="grid grid-cols-3 gap-2">
            {FONT_STYLES.map((f) => (
              <div key={f.id} className="rounded-xl py-3 text-center text-sm" style={{ background: "var(--surface-2)", fontFamily: f.family }}>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </PremiumGate>
    )
  }

  const renderPaymentTab = () => (
    <div className="space-y-4 rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <Field label="ประเภท PromptPay">
        <div className="flex gap-2">
          {(["PHONE", "NID", "TAX"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPromptpayType(type)}
              className="flex-1 rounded-xl py-2 text-xs font-bold transition-all"
              style={{
                background: promptpayType === type ? color : "var(--surface-2)",
                color: promptpayType === type ? "#fff" : "var(--text-2)",
                border: `1px solid ${promptpayType === type ? color : "var(--border)"}`,
              }}
            >
              {type === "PHONE" ? "เบอร์โทร" : type === "NID" ? "เลขบัตร" : "นิติบุคคล"}
            </button>
          ))}
        </div>
      </Field>

      <Field label="PromptPay ID" hint={promptpayType === "PHONE" ? "10 หลัก" : "13 หลัก"}>
        <TInput
          icon={Phone}
          value={promptpayId}
          onChange={(e) => setPromptpayId(e.target.value.replace(/\D/g, ""))}
          placeholder={promptpayType === "PHONE" ? "0812345678" : "1234567890123"}
          maxLength={13}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="ชื่อธนาคาร">
          <TInput value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="กสิกร, SCB, ..." />
        </Field>
        <Field label="เลขบัญชี">
          <TInput icon={CreditCard} value={bankAccount} onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ""))} placeholder="1234567890" />
        </Field>
      </div>

      <Field label="จำนวนแนะนำ">
        <div className="flex flex-wrap gap-2">
          {PRESET_SUGGESTIONS.map((amount) => {
            const selected = presets.includes(amount)
            return (
              <button
                key={amount}
                type="button"
                onClick={() => togglePreset(amount)}
                className="rounded-xl px-3 py-1.5 text-xs font-bold transition-all"
                style={{
                  background: selected ? color : "var(--surface-2)",
                  color: selected ? "#fff" : "var(--text-2)",
                  border: `1px solid ${selected ? color : "var(--border)"}`,
                }}
              >
                {selected ? <Check size={10} className="mr-1 inline" /> : <Plus size={10} className="mr-1 inline" />}
                ฿{amount.toLocaleString()}
              </button>
            )
          })}
        </div>
      </Field>
    </div>
  )

  const renderOptionsTab = () => (
    <div className="space-y-3 rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <Toggle val={allowCustom} set={setAllowCustom} label="กรอกจำนวนเองได้" desc="ไม่จำกัดอยู่แค่จำนวนแนะนำ" />
      <Toggle val={requestNote} set={setRequestNote} label="ขอระบุหมายเหตุ" desc="เพิ่มช่องหมายเหตุให้ผู้จ่าย" />
      <Toggle val={isActive} set={setIsActive} label="เปิดใช้งาน" desc="ปิดเพื่อซ่อนหน้าจากสาธารณะ" />
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
          <ModeIcon size={12} />
          {meta.label} Pay Profile
          {isPremium ? <Sparkles size={10} style={{ color: "#fbbf24" }} /> : null}
        </div>

        {existing ? (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isActive ? "bg-green-400" : "bg-red-400"}`} />
            <span className="text-xs" style={{ color: "var(--text-3)" }}>
              {existing.totalReceived} visits
            </span>
          </div>
        ) : null}
      </div>

      {existing ? (
        <div className="flex items-center gap-2 rounded-2xl p-3" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold" style={{ color: "#10b981" }}>
              ลิงก์สำหรับแชร์
            </div>
            <div className="mt-0.5 truncate text-xs" style={{ color: "var(--text-2)" }}>
              {publicUrl}
            </div>
          </div>
          <button type="button" onClick={copyLink} className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
          <Link href={`/pay/${existing.slug}`} target="_blank" className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
            <ExternalLink size={12} />
          </Link>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl" style={{ border: "1px solid var(--border)" }}>
        <div className="relative h-24" style={{ background: previewCover, backgroundSize: "cover", backgroundPosition: "center" }}>
          {coverStyle === "pattern" ? (
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  coverPattern === "dots"
                    ? "radial-gradient(circle, white 1px, transparent 1px)"
                    : coverPattern === "grid"
                      ? "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)"
                      : "none",
                backgroundSize: coverPattern === "dots" ? "16px 16px" : "20px 20px",
              }}
            />
          ) : null}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4))" }} />
        </div>

        <div className="px-5 pb-4" style={{ background: "var(--card)" }}>
          <div className="-mt-8 mb-3 flex items-end gap-3">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border-4 text-2xl font-black"
              style={{
                background: avatarUrl ? "transparent" : `${color}22`,
                borderColor: "var(--card)",
                ...avatarShapeStyle,
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span style={{ color, fontFamily: fontStyle === "mono" ? "monospace" : fontStyle === "serif" ? "Georgia" : "inherit" }}>
                  {(displayName || "?")[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`truncate font-black text-base ${fontStyle === "bold" ? "text-xl" : ""}`}
                  style={{
                    color: "var(--text)",
                    fontFamily:
                      fontStyle === "mono"
                        ? "monospace"
                        : fontStyle === "serif"
                          ? "Georgia, serif"
                          : fontStyle === "elegant"
                            ? "Palatino, serif"
                            : "inherit",
                  }}
                >
                  {displayName || "ชื่อของคุณ"}
                </span>
                {badgeText ? (
                  <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${badgeColor}22`, color: badgeColor, border: `1px solid ${badgeColor}40` }}>
                    {badgeText}
                  </span>
                ) : null}
              </div>
              {bio ? (
                <p className="mt-0.5 truncate text-xs" style={{ color: "var(--text-2)" }}>
                  {bio}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
            <ModeIcon size={10} style={{ color }} />
            <span style={{ color }}>{meta.label}</span>
            <span>· paymap.app/pay/{existing?.slug ?? "slug"}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-2xl p-1" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {EDITOR_TABS.map(({ id, label, icon: Icon, premium }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className="flex whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition-all"
            style={{ background: tab === id ? "var(--primary)" : "transparent", color: tab === id ? "#fff" : "var(--text-3)" }}
          >
            <span className="flex items-center gap-1">
              <Icon size={11} /> {label}
              {premium && !isPremium ? <Lock size={9} style={{ color: "#fbbf24" }} /> : null}
            </span>
          </button>
        ))}
      </div>

      {tab === "basic" ? renderBasicTab() : null}
      {tab === "cover" ? renderCoverTab() : null}
      {tab === "avatar" ? renderAvatarTab() : null}
      {tab === "style" ? renderStyleTab() : null}
      {tab === "payment" ? renderPaymentTab() : null}
      {tab === "options" ? renderOptionsTab() : null}

      {!isPremium ? (
        <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
          <Sparkles size={18} style={{ color: "#fbbf24" }} className="shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-bold" style={{ color: "#fbbf24" }}>
              Premium Customization
            </div>
            <div className="mt-0.5 text-xs" style={{ color: "var(--text-2)" }}>
              Upgrade เพื่อปลดล็อก พื้นหลัง · กรอบรูป · ฟอนต์ · Layout สุดเอกลักษณ์
            </div>
          </div>
          <Link href="/pricing" className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold" style={{ background: "#fbbf24", color: "#000" }}>
            Upgrade
          </Link>
        </div>
      ) : null}

      {msg ? <Msg {...msg} /> : null}

      <button type="button" onClick={handleSave} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-60" style={{ background: color }}>
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        {loading ? "กำลังบันทึก..." : existing ? "บันทึกการเปลี่ยนแปลง" : "สร้าง Pay Profile"}
      </button>

      <p className="text-center text-xs" style={{ color: "var(--text-3)" }}>
        เงินโอนตรงเข้าบัญชีของคุณ
      </p>
    </div>
  )
}
