"use client"
import Link from "next/link"
import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  User, Globe, Lock, CreditCard, Camera, AtSign, Phone, Link2,
  Check, X, Loader2, ChevronRight, Shield, Building2,
  Store, Wallet, Sparkles, MapPin, QrCode, ExternalLink, Palette, Layout, Type, SlidersHorizontal, MonitorSmartphone,
  Database,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { COUNTRY_LIST, COUNTRIES } from "@/lib/i18n/countries"
import ThemeToggle from "@/components/ui/ThemeToggle"
import FileUploader from "@/components/ui/FileUploader"
import { DEFAULT_UI_PREFERENCES, PRESET_COLORS, mergeUiPreferences, type UiPreferences } from "@/lib/ui-preferences"
import type { ModuleSurface } from "@/lib/ui-template-modules"
import { applyTemplatePreset, getTemplatePreset } from "@/lib/ui-template-presets"
import type { SiteLang } from "@/lib/i18n/site"
import { getAppMessages } from "@/lib/i18n/app"
import PrivacyDataPanel from "@/components/local-first/PrivacyDataPanel"

// ── Types ──────────────────────────────────────────────────────────
type UserData = {
  name: string; email: string; plan: string; provider: string | null
  image?: string | null; accountMode: "personal" | "business" | "merchant"
  country: string; currency: string; locale: string; timezone: string
  emailVerified: Date | null; createdAt: Date; loginCount: number; lastLoginAt: Date | null
  displayName?: string | null; username?: string | null; bio?: string | null
  phone?: string | null; website?: string | null
  uiPreferences?: UiPreferences | null
  stripeSubscription: { plan:string; status:string; currentPeriodEnd:Date; cancelAtPeriodEnd:boolean } | null
  productSubscriptions: { product:string; planTier:string; status:string; currentPeriodEnd:Date | null }[]
}

type TabId = "profile" | "region" | "security" | "appearance" | "data" | "billing" | "payprofile"

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl p-3" style={{ background:"var(--surface-2)", border:"1px solid var(--border)" }}>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {hint ? <div className="text-xs mt-0.5" style={{ color:"var(--text-3)" }}>{hint}</div> : null}
      </div>
      <button type="button" onClick={() => onChange(!checked)} className="relative h-7 w-12 rounded-full transition-colors" style={{ background: checked ? "var(--primary)" : "rgba(148,163,184,0.35)" }}>
        <span className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all" style={{ left: checked ? "1.45rem" : "0.25rem" }} />
      </button>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────
function Msg({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
      style={{ background: ok ? "rgba(16,185,129,0.1)" : "rgba(248,113,113,0.1)", color: ok ? "#10b981" : "#f87171" }}>
      {ok ? <Check size={14}/> : <X size={14}/>} {text}
    </div>
  )
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
      {title && <div className="text-xs font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}>{title}</div>}
      {children}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold" style={{ color:"var(--text-2)" }}>{label}</label>
        {hint && <span className="text-xs" style={{ color:"var(--text-3)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Input({ icon: Icon, ...props }: { icon?: LucideIcon } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:"var(--text-3)" }} />}
      <input {...props}
        className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${Icon ? "pl-9" : ""}`}
        style={{ background:"var(--surface-2)", border:"1px solid var(--border)", color:"var(--text)", ...props.style }} />
    </div>
  )
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props}
      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
      style={{ background:"var(--surface-2)", border:"1px solid var(--border)", color:"var(--text)" }} />
  )
}

function SaveBtn({ loading, label="Save" }: { loading: boolean; label?: string }) {
  return (
    <button type="submit" disabled={loading}
      className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity disabled:opacity-60"
      style={{ background:"var(--primary)" }}>
      {loading ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
      {loading ? "Saving..." : label}
    </button>
  )
}

// ── Main Component ─────────────────────────────────────────────────
export default function SettingsClient({ user, moduleSurface, lang = "en", initialTab = "profile" }: { user: UserData; moduleSurface: ModuleSurface; lang?: SiteLang; initialTab?: TabId }) {
  const t = getAppMessages(lang)
  const MODE = {
    personal: { label:"Personal", color:"#7c3aed", bg:"rgba(124,58,237,0.1)", border:"rgba(124,58,237,0.25)", icon: Wallet, desc:t.settings.modeDescriptions.personal },
    business: { label:"Business", color:"#0ea5e9", bg:"rgba(14,165,233,0.1)", border:"rgba(14,165,233,0.25)", icon: Building2, desc:t.settings.modeDescriptions.business },
    merchant: { label:"Merchant", color:"#e11d48", bg:"rgba(225,29,72,0.1)", border:"rgba(225,29,72,0.25)", icon: Store, desc:t.settings.modeDescriptions.merchant },
  } as const
  const TABS = [
    { id:"profile", label:t.settings.tabs.profile, icon: User },
    { id:"region", label:t.settings.tabs.region, icon: Globe },
    { id:"security", label:t.settings.tabs.security, icon: Lock },
    { id:"appearance", label:t.settings.tabs.appearance, icon: Palette },
    { id:"data", label:"Privacy & Data", icon: Database },
    { id:"billing", label:t.settings.tabs.billing, icon: CreditCard },
    { id:"payprofile", label:t.settings.tabs.payprofile, icon: QrCode },
  ] as const
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [tab, setTab] = useState<TabId>(initialTab)

  const mode = MODE[user.accountMode]
  const ModeIcon = mode.icon
  const sub = useMemo(() =>
    user.productSubscriptions.find(s => s.product === user.accountMode && s.status === "active"),
    [user.productSubscriptions, user.accountMode]
  )

  // Profile state
  const [name,        setName]        = useState(user.name ?? "")
  const [displayName, setDisplayName] = useState(user.displayName ?? "")
  const [username,    setUsername]    = useState(user.username ?? "")
  const [bio,         setBio]         = useState(user.bio ?? "")
  const [phone,       setPhone]       = useState(user.phone ?? "")
  const [website,     setWebsite]     = useState(user.website ?? "")
  const [image,       setImage]       = useState(user.image ?? "")
  const [profileMsg,  setProfileMsg]  = useState<{ ok: boolean; text: string } | null>(null)
  const [profileLoad, setProfileLoad] = useState(false)

  // Region state
  const [country,    setCountry]    = useState(user.country ?? "TH")
  const [currency,   setCurrency]   = useState(user.currency ?? "THB")
  const [regionMsg,  setRegionMsg]  = useState<{ ok: boolean; text: string } | null>(null)
  const [regionLoad, setRegionLoad] = useState(false)

  // Security state
  const [curPass,  setCurPass]  = useState("")
  const [newPass,  setNewPass]  = useState("")
  const [passMsg,  setPassMsg]  = useState<{ ok: boolean; text: string } | null>(null)
  const [passLoad, setPassLoad] = useState(false)

  const isGoogle = user.provider === "google"
  const initialPrefs = useMemo(() => mergeUiPreferences(user.uiPreferences), [user.uiPreferences])
  const [uiPrefs, setUiPrefs] = useState<UiPreferences>(initialPrefs)
  const [uiMsg, setUiMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [uiLoad, setUiLoad] = useState(false)
  const [billingMsg, setBillingMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [billingLoad, setBillingLoad] = useState(false)

  function updateUiPrefs<K extends keyof UiPreferences>(key: K, value: UiPreferences[K]) {
    setUiPrefs(prev => ({ ...prev, [key]: value }))
  }

  function applyTemplate(value: UiPreferences["template"]) {
    setUiPrefs(prev => applyTemplatePreset(value, prev))
    const preset = getTemplatePreset(value)
    setUiMsg({ ok: true, text: t.settings.messages.templateApplied.replace("{label}", preset.label) })
  }

  async function saveUiPreferences(e: React.FormEvent) {
    e.preventDefault(); setUiLoad(true); setUiMsg(null)
    const res = await fetch("/api/user/ui-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(uiPrefs),
    })
    const json = await res.json().catch(() => ({}))
    setUiLoad(false)
    if (res.ok && json.preferences) setUiPrefs(mergeUiPreferences(json.preferences))
    setUiMsg({ ok: res.ok, text: json.message ?? json.error ?? "บันทึกการตั้งค่า UI แล้ว" })
    if (res.ok) startTransition(() => router.refresh())
  }


  // ── Profile save ──
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setProfileLoad(true); setProfileMsg(null)
    const res  = await fetch("/api/user/profile", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ name, displayName: displayName||null, username: username||null,
        bio: bio||null, phone: phone||null, website: website||null, image: image||null }),
    })
    const json = await res.json()
    setProfileLoad(false)
    setProfileMsg({ ok: res.ok, text: json.message ?? json.error })
    if (res.ok) startTransition(() => router.refresh())
  }

  // ── Region save ──
  async function saveRegion(e: React.FormEvent) {
    e.preventDefault(); setRegionLoad(true); setRegionMsg(null)
    const c = COUNTRIES[country]
    const res = await fetch("/api/user/profile", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ country, currency, locale: c?.locale ?? "th-TH", timezone: c?.timezone ?? "Asia/Bangkok" }),
    })
    const json = await res.json()
    setRegionLoad(false)
    setRegionMsg({ ok: res.ok, text: json.message ?? json.error })
    if (res.ok) startTransition(() => router.refresh())
  }

  // ── Password change ──
  async function changePassword(e: React.FormEvent) {
    e.preventDefault(); setPassLoad(true); setPassMsg(null)
    const res  = await fetch("/api/user/change-password", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ currentPassword: curPass, newPassword: newPass }),
    })
    const json = await res.json()
    setPassLoad(false)
    setPassMsg({ ok: res.ok, text: json.message ?? json.error })
    if (res.ok) { setCurPass(""); setNewPass("") }
  }

  // ── Billing portal ──
  async function openBilling() {
    try {
      setBillingLoad(true)
      setBillingMsg(null)
      const res = await fetch("/api/billing/portal", { method:"POST" })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.url) {
        setBillingMsg({ ok: false, text: json?.error ?? "เปิดหน้า billing ไม่สำเร็จ" })
        return
      }
      window.location.href = json.url
    } catch {
      setBillingMsg({ ok: false, text: "เชื่อมต่อระบบ billing ไม่สำเร็จ" })
    } finally {
      setBillingLoad(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">

      {/* Mode badge */}
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 text-xs font-bold"
        style={{ background: mode.bg, color: mode.color, border:`1px solid ${mode.border}` }}>
        <ModeIcon size={12}/> {mode.label}
      </div>

      <div className="grid gap-3 md:grid-cols-2 mb-6">
        {moduleSurface.cards.map((card) => {
          const IconCard = card.icon
          return (
            <div key={card.title} className="soft-panel rounded-[24px] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: mode.bg, color: mode.color }}><IconCard size={18} /></div>
                <div>
                  <div className="text-sm font-black">{card.title}</div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">{card.tag}</div>
                </div>
              </div>
              <div className="mt-3 text-sm leading-6 text-[var(--text-2)]">{card.description}</div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-8 rounded-2xl p-1" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id as TabId)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all"
            style={{
              background: tab === id ? "var(--primary)" : "transparent",
              color: tab === id ? "#fff" : "var(--text-3)",
            }}>
            <Icon size={12}/> {label}
          </button>
        ))}
      </div>

      {/* ── TAB: PROFILE ── */}
      {tab === "profile" && (
        <form onSubmit={saveProfile} className="space-y-4">

          {/* Avatar */}
          <Card title="รูปโปรไฟล์">
            <div className="grid gap-4 md:grid-cols-[88px_minmax(0,1fr)]">
              <div className="relative mx-auto md:mx-0">
                <div className="h-20 w-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-black"
                  style={{ background: mode.bg, border:`2px solid ${mode.border}` }}>
                  {image ? (
                    <img src={image} alt="" className="h-full w-full object-cover"/>
                  ) : (
                    <span style={{ color: mode.color }}>{(displayName || name || "?")[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center"
                  style={{ background: mode.color }}>
                  <Camera size={12} color="white"/>
                </div>
              </div>
              <div className="space-y-3 min-w-0">
                <FileUploader
                  category="avatars"
                  label="อัปโหลดรูป"
                  hint="JPG, PNG, WebP"
                  onSuccess={(url) => setImage(url)}
                />
                <Field label="หรือใส่ URL รูปภาพ">
                  <Input icon={Link2} value={image} onChange={e => setImage(e.target.value)}
                    placeholder="ลิงก์เว็บไซต์หรือโซเชียล" type="url"/>
                </Field>
              </div>
            </div>
          </Card>

          {/* Identity */}
          <Card title="ข้อมูลส่วนตัว">
            <Field label="ชื่อจริง">
              <Input icon={User} value={name} onChange={e => setName(e.target.value)}
                placeholder="ชื่อ-นามสกุล" required/>
            </Field>
            <Field label="ชื่อที่แสดง">
              <Input icon={User} value={displayName} onChange={e => setDisplayName(e.target.value)}
                placeholder="ชื่อที่ผู้ใช้คนอื่นเห็น"/>
            </Field>
            <Field label="Username">
              <Input icon={AtSign} value={username} onChange={e => setUsername(e.target.value.toLowerCase())}
                placeholder="ตั้งชื่อสั้นสำหรับโปรไฟล์" maxLength={30}/>
            </Field>
            <Field label="Bio">
              <Textarea value={bio} onChange={e => setBio(e.target.value)}
                placeholder="แนะนำตัวสั้นๆ" rows={3} maxLength={300}/>
            </Field>
          </Card>

          {/* Contact */}
          <Card title="ช่องทางติดต่อ">
            <Field label="Email" hint="เปลี่ยนไม่ได้">
              <Input icon={Shield} value={user.email} disabled
                style={{ opacity: 0.5, cursor:"not-allowed" }}/>
            </Field>
            <Field label="เบอร์โทรศัพท์">
              <Input icon={Phone} value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+66 81 234 5678" type="tel"/>
            </Field>
            <Field label="เว็บไซต์">
              <Input icon={Link2} value={website} onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com" type="url"/>
            </Field>
          </Card>

          {/* Mode info — read-only, profile scoped to own mode */}
          <Card title="โหมดบัญชี">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: mode.bg, border:`1px solid ${mode.border}` }}>
              <ModeIcon size={20} style={{ color: mode.color }}/>
              <div>
                <div className="font-bold text-sm" style={{ color: mode.color }}>{mode.label} — {mode.desc}</div>
                <div className="text-xs mt-0.5" style={{ color:"var(--text-3)" }}>
                  Profile นี้ใช้ได้เฉพาะโหมด {mode.label} เท่านั้น — ข้อมูลไม่ข้ามโหมด
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl p-3" style={{ background:"var(--surface-2)" }}>
                <div className="text-xs mb-0.5" style={{ color:"var(--text-3)" }}>Plan ปัจจุบัน</div>
                <div className="font-bold capitalize" style={{ color: mode.color }}>
                  {sub?.planTier ?? user.plan}
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ background:"var(--surface-2)" }}>
                <div className="text-xs mb-0.5" style={{ color:"var(--text-3)" }}>สมัครเมื่อ</div>
                <div className="font-bold">
                  {new Date(user.createdAt).toLocaleDateString("th-TH")}
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ background:"var(--surface-2)" }}>
                <div className="text-xs mb-0.5" style={{ color:"var(--text-3)" }}>Login ครั้งล่าสุด</div>
                <div className="font-bold text-xs">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("th-TH") : "—"}
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ background:"var(--surface-2)" }}>
                <div className="text-xs mb-0.5" style={{ color:"var(--text-3)" }}>Login ทั้งหมด</div>
                <div className="font-bold">{user.loginCount} ครั้ง</div>
              </div>
            </div>
          </Card>

          {profileMsg && <Msg {...profileMsg}/>}
          <div className="flex justify-end"><SaveBtn loading={profileLoad} label={t.common.save}/></div>
        </form>
      )}

      {/* ── TAB: REGION ── */}
      {tab === "region" && (
        <form onSubmit={saveRegion} className="space-y-4">

          <Card title="ประเทศและภาษา">
            <Field label="ประเทศ / ภูมิภาค" hint="กำหนด timezone, locale และระบบภาษี">
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:"var(--text-3)" }}/>
                <select value={country} onChange={e => {
                    setCountry(e.target.value)
                    const c = COUNTRIES[e.target.value]
                    if (c) setCurrency(c.currency)
                  }}
                  className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none appearance-none"
                  style={{ background:"var(--surface-2)", border:"1px solid var(--border)", color:"var(--text)" }}>
                  {COUNTRY_LIST.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </div>
              {/* Show auto-set info */}
              {COUNTRIES[country] && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { label:"Timezone", val: COUNTRIES[country].timezone },
                    { label:"Locale",   val: COUNTRIES[country].locale },
                    { label:"ระบบภาษี", val: COUNTRIES[country].taxEngine },
                  ].map(({ label, val }) => (
                    <div key={label} className="rounded-xl p-2 text-center" style={{ background:"var(--surface-2)" }}>
                      <div className="text-xs" style={{ color:"var(--text-3)" }}>{label}</div>
                      <div className="text-xs font-bold mt-0.5" style={{ color: mode.color }}>{val}</div>
                    </div>
                  ))}
                </div>
              )}
            </Field>

            <Field label="สกุลเงินหลัก" hint="ใช้เป็นค่าเริ่มต้น">
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:"var(--text-3)" }}/>
                <select value={currency} onChange={e => setCurrency(e.target.value)}
                  className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none appearance-none"
                  style={{ background:"var(--surface-2)", border:"1px solid var(--border)", color:"var(--text)" }}>
                  {COUNTRY_LIST.map(c => (
                    <option key={c.currency} value={c.currency}>{c.flag} {c.currency} — {c.name}</option>
                  ))}
                </select>
              </div>
            </Field>
          </Card>

          <Card title="ธีม">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold" style={{ color:"var(--text)" }}>Dark / Light Mode</div>
                <div className="text-xs mt-0.5" style={{ color:"var(--text-3)" }}>เปลี่ยนธีมของ payMap</div>
              </div>
              <ThemeToggle/>
            </div>
          </Card>

          {regionMsg && <Msg {...regionMsg}/>}
          <div className="flex justify-end"><SaveBtn loading={regionLoad} label="บันทึกการตั้งค่าภูมิภาค"/></div>
        </form>
      )}

      {/* ── TAB: SECURITY ── */}
      {tab === "security" && (
        <div className="space-y-4">
          <Card title="สถานะบัญชี">
            <div className="space-y-2">
              {[
                { label:"Email", val: user.email, sub: user.emailVerified ? "ยืนยันแล้ว ✓" : "ยังไม่ยืนยัน", ok: !!user.emailVerified },
                { label:"วิธี Login", val: user.provider === "google" ? "Google OAuth" : "Email & Password" },
                { label:"Email Verified", val: user.emailVerified ? new Date(user.emailVerified).toLocaleDateString("th-TH") : "—" },
              ].map(({ label, val, sub, ok }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ background:"var(--surface-2)" }}>
                  <div>
                    <div className="text-xs" style={{ color:"var(--text-3)" }}>{label}</div>
                    <div className="text-sm font-semibold mt-0.5">{val}</div>
                    {sub && <div className="text-xs mt-0.5" style={{ color: ok ? "#10b981" : "#f59e0b" }}>{sub}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {!isGoogle && (
            <form onSubmit={changePassword}>
              <Card title="เปลี่ยนรหัสผ่าน">
                <Field label="รหัสผ่านปัจจุบัน">
                  <Input icon={Lock} type="password" value={curPass} onChange={e => setCurPass(e.target.value)}
                    placeholder="รหัสผ่านเดิม" autoComplete="current-password"/>
                </Field>
                <Field label="รหัสผ่านใหม่" hint="อย่างน้อย 8 ตัวอักษร">
                  <Input icon={Shield} type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                    placeholder="รหัสผ่านใหม่" autoComplete="new-password" minLength={8}/>
                </Field>
                {passMsg && <Msg {...passMsg}/>}
                <div className="flex justify-end"><SaveBtn loading={passLoad} label="เปลี่ยนรหัสผ่าน"/></div>
              </Card>
            </form>
          )}

          {isGoogle && (
            <Card>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background:"rgba(14,165,233,0.08)", border:"1px solid rgba(14,165,233,0.2)" }}>
                <Shield size={18} style={{ color:"#38bdf8" }}/>
                <div>
                  <div className="text-sm font-bold" style={{ color:"#38bdf8" }}>Google OAuth Account</div>
                  <div className="text-xs mt-0.5" style={{ color:"var(--text-3)" }}>
                    บัญชีนี้ใช้ Google ล็อกอิน — ความปลอดภัยจัดการผ่าน Google Account ของคุณ
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}


      {/* ── TAB: APPEARANCE ── */}
      {tab === "appearance" && (
        <form onSubmit={saveUiPreferences} className="space-y-4">
          <Card title="Template & Default page">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Template หลัก">
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ["personal", "Personal"],
                    ["business", "Business"],
                    ["merchant", "Merchant"],
                    ["family", "Family"],
                  ] as const).map(([value, label]) => (
                    <button key={value} type="button" onClick={() => applyTemplate(value)} className="rounded-xl px-3 py-2 text-sm font-bold"
                      style={{ background: uiPrefs.template === value ? "var(--primary)" : "var(--surface-2)", color: uiPrefs.template === value ? "#fff" : "var(--text)", border: "1px solid var(--border)" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="หน้าเริ่มต้น">
                <div className="relative">
                  <Layout size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:"var(--text-3)" }} />
                  <select value={uiPrefs.defaultPage} onChange={e => updateUiPrefs("defaultPage", e.target.value as UiPreferences["defaultPage"])}
                    className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none appearance-none"
                    style={{ background:"var(--surface-2)", border:"1px solid var(--border)", color:"var(--text)" }}>
                    <option value="dashboard">Dashboard</option>
                    <option value="wallets">Wallets</option>
                    <option value="reports">Reports</option>
                    <option value="business">Business</option>
                    <option value="merchant">Merchant</option>
                    <option value="settings">Settings</option>
                    <option value="pricing">Pricing</option>
                    <option value="landing">Landing</option>
                  </select>
                </div>
              </Field>
            </div>
          </Card>

          <Card title="Preset behavior">
            <div className="rounded-2xl p-4" style={{ background:"var(--surface-2)", border:"1px solid var(--border)" }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black">{getTemplatePreset(uiPrefs.template).label}</div>
                  <div className="mt-1 text-xs leading-6" style={{ color:"var(--text-3)" }}>{getTemplatePreset(uiPrefs.template).description}</div>
                </div>
                <button type="button" onClick={() => applyTemplate(uiPrefs.template)} className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background:"var(--primary-soft)", color:"var(--primary)", border:"1px solid var(--border)" }}>
                  Re-apply preset
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {[
                  ["Theme", getTemplatePreset(uiPrefs.template).appearance.themeMode],
                  ["Default page", getTemplatePreset(uiPrefs.template).appearance.defaultPage],
                  ["Sidebar", `${getTemplatePreset(uiPrefs.template).appearance.sidebarWidth}px`],
                  ["Bottom nav", getTemplatePreset(uiPrefs.template).appearance.showBottomNav ? "On" : "Off"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl p-3" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}>{label}</div>
                    <div className="mt-2 text-sm font-bold capitalize">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Brand colors">
            <Field label="สีหลัก">
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button key={color} type="button" onClick={() => updateUiPrefs("primaryColor", color)} className="h-10 w-10 rounded-full border-2" style={{ background: color, borderColor: uiPrefs.primaryColor === color ? "#fff" : "transparent" }} />
                ))}
                <label className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm" style={{ background:"var(--surface-2)", border:"1px solid var(--border)" }}>
                  <Palette size={14} />
                  <span>Custom</span>
                  <input type="color" value={uiPrefs.primaryColor} onChange={e => updateUiPrefs("primaryColor", e.target.value)} className="h-8 w-8 rounded border-0 bg-transparent p-0" />
                </label>
              </div>
            </Field>

            <Field label="สี Sidebar">
              <div className="flex items-center gap-3">
                <input type="color" value={uiPrefs.sidebarColor.startsWith("#") ? uiPrefs.sidebarColor : DEFAULT_UI_PREFERENCES.primaryColor} onChange={e => updateUiPrefs("sidebarColor", e.target.value)} className="h-11 w-14 rounded-xl border-0 bg-transparent p-0" />
                <Input value={uiPrefs.sidebarColor} onChange={e => updateUiPrefs("sidebarColor", e.target.value)} placeholder="เช่น #0f172a หรือ rgba(...)" />
              </div>
            </Field>
          </Card>

          <Card title="Theme mode">
            <Field label="Theme sync" hint="บันทึกลงบัญชีและ sync ข้ามอุปกรณ์">
              <div className="grid gap-2 sm:grid-cols-4">
                {([
                  ["dark", "Dark"],
                  ["light", "Light"],
                  ["executive", "Executive"],
                  ["system", "System"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateUiPrefs("themeMode", value)}
                    className="rounded-xl px-3 py-3 text-sm font-semibold transition-all"
                    style={{
                      background: uiPrefs.themeMode === value ? "var(--primary-soft)" : "var(--surface-2)",
                      color: uiPrefs.themeMode === value ? "var(--primary)" : "var(--text-2)",
                      border: `1px solid ${uiPrefs.themeMode === value ? "var(--primary)" : "var(--border)"}`
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>
          </Card>

          <Card title="Layout tuning">
            <Field label="Sidebar width" hint={`${uiPrefs.sidebarWidth}px`}>
              <input type="range" min={240} max={360} step={4} value={uiPrefs.sidebarWidth} onChange={e => updateUiPrefs("sidebarWidth", Number(e.target.value))} className="w-full" />
            </Field>
            <Field label="Border radius" hint={`${uiPrefs.borderRadius}px`}>
              <input type="range" min={12} max={32} step={2} value={uiPrefs.borderRadius} onChange={e => updateUiPrefs("borderRadius", Number(e.target.value))} className="w-full" />
            </Field>
            <Field label="Font family">
              <div className="relative">
                <Type size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:"var(--text-3)" }} />
                <select value={uiPrefs.fontFamily} onChange={e => updateUiPrefs("fontFamily", e.target.value as UiPreferences["fontFamily"])}
                  className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none appearance-none"
                  style={{ background:"var(--surface-2)", border:"1px solid var(--border)", color:"var(--text)" }}>
                  <option value="dm-sans">DM Sans</option>
                  <option value="inter">Inter</option>
                  <option value="noto-sans-thai">Noto Sans Thai</option>
                  <option value="system">System UI</option>
                  <option value="mono">JetBrains Mono</option>
                </select>
              </div>
            </Field>
          </Card>

          <Card title="Feature toggles">
            <div className="space-y-3">
              <ToggleRow label="Quick Actions" hint="ปุ่มลอยเพิ่มรายการด่วน" checked={uiPrefs.showQuickActions} onChange={(checked) => updateUiPrefs("showQuickActions", checked)} />
              <ToggleRow label="Charts" hint="เก็บ preference สำหรับหน้ารายงาน/กราฟ" checked={uiPrefs.showCharts} onChange={(checked) => updateUiPrefs("showCharts", checked)} />
              <ToggleRow label="Bottom Nav" hint="แถบนำทางด้านล่างบนมือถือ" checked={uiPrefs.showBottomNav} onChange={(checked) => updateUiPrefs("showBottomNav", checked)} />
            </div>
          </Card>

          <Card title="Preview summary">
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { icon: Palette, label: "Primary", value: uiPrefs.primaryColor },
                { icon: SlidersHorizontal, label: "Sidebar", value: `${uiPrefs.sidebarWidth}px` },
                { icon: MonitorSmartphone, label: "Bottom Nav", value: uiPrefs.showBottomNav ? "On" : "Off" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl p-3" style={{ background:"var(--surface-2)", border:"1px solid var(--border)" }}>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}><Icon size={13} /> {label}</div>
                  <div className="mt-2 text-sm font-bold">{value}</div>
                </div>
              ))}
            </div>
          </Card>

          {uiMsg && <Msg {...uiMsg} />}
          <div className="flex justify-end"><SaveBtn loading={uiLoad} label="บันทึก Appearance & Sync" /></div>
        </form>
      )}

      {/* ── TAB: PRIVACY & DATA ── */}
      {tab === "data" && <PrivacyDataPanel />}

      {/* ── TAB: PAY PROFILE ── */}
      {tab === "payprofile" && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background:`${mode.bg}` }}>
                <QrCode size={18} style={{ color: mode.color }}/>
              </div>
              <div>
                <div className="font-black" style={{ color:"var(--text)" }}>Pay Profile</div>
                <div className="text-xs" style={{ color:"var(--text-3)" }}>
                  หน้ารับเงินสาธารณะ — ไม่มีค่าธรรมเนียม
                </div>
              </div>
            </div>
            <p className="text-sm leading-6 mb-4" style={{ color:"var(--text-2)" }}>
              สร้างหน้ารับเงินส่วนตัวที่ paymap.app/pay/ชื่อของคุณ
              ผู้จ่ายสแกน PromptPay QR ได้โดยตรง เงินโอนตรงถึงบัญชีคุณ
              payMap ไม่รับเงินแทน ไม่มีค่าธรรมเนียม
            </p>
            <Link href="/settings/pay-profile"
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white"
              style={{ background: mode.color }}>
              <QrCode size={14}/>
              จัดการ Pay Profile
              <ExternalLink size={12}/>
            </Link>
          </div>
        </div>
      )}

      {/* ── TAB: BILLING ── */}
      {tab === "billing" && (
        <div className="space-y-4">
          {/* Current plan */}
          <Card title="Plan ปัจจุบัน">
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: mode.bg, border:`1px solid ${mode.border}` }}>
              <ModeIcon size={22} style={{ color: mode.color }}/>
              <div className="flex-1">
                <div className="font-black text-lg" style={{ color: mode.color }}>
                  {mode.label} {sub?.planTier ?? user.plan}
                </div>
                <div className="text-xs mt-0.5" style={{ color:"var(--text-3)" }}>
                  {sub?.currentPeriodEnd
                    ? `ต่ออายุ ${new Date(sub.currentPeriodEnd).toLocaleDateString("th-TH")}`
                    : "Free plan — ใช้ได้ตลอด"}
                </div>
              </div>
              <Sparkles size={16} style={{ color: mode.color }}/>
            </div>

            {user.productSubscriptions.length > 0 ? (
              <div className="space-y-2">
                {user.productSubscriptions.map(s => (
                  <div key={s.product} className="flex items-center justify-between p-3 rounded-xl" style={{ background:"var(--surface-2)" }}>
                    <div className="text-sm font-semibold capitalize">{s.product} — {s.planTier}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background:"rgba(16,185,129,0.1)", color:"#10b981" }}>
                        {s.status}
                      </span>
                      {s.currentPeriodEnd && (
                        <span className="text-xs" style={{ color:"var(--text-3)" }}>
                          ถึง {new Date(s.currentPeriodEnd).toLocaleDateString("th-TH")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm" style={{ color:"var(--text-3)" }}>ไม่มี subscription ที่ active</div>
            )}
          </Card>

          <Card>
            {billingMsg && <Msg ok={billingMsg.ok} text={billingMsg.text} />}
            <button onClick={openBilling}
              className="w-full flex items-center justify-between p-3 rounded-xl transition-all hover:opacity-80 disabled:opacity-60" disabled={billingLoad}
              style={{ background:"var(--surface-2)", border:"1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <CreditCard size={16} style={{ color: mode.color }}/>
                <div className="text-sm font-bold text-left">
                  <div>จัดการ Subscription & การชำระเงิน</div>
                  <div className="text-xs font-normal mt-0.5" style={{ color:"var(--text-3)" }}>
                    ดูประวัติ, เปลี่ยน plan, ยกเลิก subscription
                  </div>
                </div>
              </div>
              {billingLoad ? <Loader2 size={16} className="animate-spin" style={{ color:"var(--text-3)" }}/> : <ChevronRight size={16} style={{ color:"var(--text-3)" }}/>}
            </button>
          </Card>

          <div className="text-center">
            <Link href="/pricing" className="text-sm font-semibold hover:underline" style={{ color: mode.color }}>
              ดูแพลนทั้งหมด →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
