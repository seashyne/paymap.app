"use client"
import { useState } from "react"
import { readApi } from "@/lib/http"
import { Copy, Check, QrCode, Building2, Store, Wallet, ExternalLink, Info, Sparkles, Shield, Zap } from "lucide-react"
import { buildCoverCSS, FRAME_GRADIENTS, FONT_STYLES, type FrameGradient } from "@/lib/pay-profile-premium"

const MODE_META = {
  personal: { label: "Personal", icon: Wallet,    color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
  business: { label: "Business", icon: Building2, color: "#0ea5e9", bg: "rgba(14,165,233,0.08)" },
  merchant: { label: "Merchant", icon: Store,      color: "#e11d48", bg: "rgba(225,29,72,0.08)" },
}

type Profile = {
  id: string; slug: string; displayName: string; bio?: string | null
  avatarUrl?: string | null; coverColor?: string | null
  coverImageUrl?: string | null; coverStyle?: string | null
  coverGradient?: string | null; coverPattern?: string | null
  frameStyle?: string | null; frameColor?: string | null; frameGradient?: string | null
  fontStyle?: string | null; layoutStyle?: string | null
  badgeText?: string | null; badgeColor?: string | null
  promptpayId?: string | null; promptpayType?: "PHONE" | "NID" | "TAX" | null
  bankAccount?: string | null; bankName?: string | null
  presetAmounts: number[]; currency: string
  allowCustom: boolean; requestNote: boolean
  workspaceType: "personal" | "business" | "merchant"
  ownerName: string; ownerImage?: string | null
}

function formatPromptPay(id: string, type?: string | null) {
  if (type === "PHONE" || id.length === 10)
    return id.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
  return id.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, "$1-$2-$3-$4-$5")
}

export default function PayPageClient({ profile }: { profile: Profile }) {
  const mode     = MODE_META[profile.workspaceType]
  const ModeIcon = mode.icon
  const accent   = profile.coverColor ?? mode.color

  const [amount, setAmount] = useState<number | "">(profile.presetAmounts[0] ?? "")
  const [note,   setNote]   = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key); setTimeout(() => setCopied(null), 2000)
  }

  const coverCSS = buildCoverCSS({
    coverStyle:    profile.coverStyle,
    coverColor:    profile.coverColor,
    coverGradient: profile.coverGradient,
    coverPattern:  profile.coverPattern,
    coverImageUrl: profile.coverImageUrl,
  }, accent)

  const fontFamily = FONT_STYLES.find(f => f.id === profile.fontStyle)?.family ?? "var(--font-sans)"
  const isBold     = profile.fontStyle === "bold"

  const fg = FRAME_GRADIENTS.find(f => f.id === (profile.frameGradient as FrameGradient))
  const frameBorder = fg?.style
    ? { border: "3px solid transparent", backgroundClip: "padding-box, border-box", backgroundImage: `none, ${fg.style}` }
    : { border: `3px solid ${profile.frameColor ?? accent + "40"}` }
  const frameRadius =
    profile.frameStyle === "circle"  ? "50%" :
    profile.frameStyle === "badge"   ? "8px" :
    profile.frameStyle === "hexagon" ? "30% 70% 70% 30% / 30% 30% 70% 70%" :
    "22px"


  async function openQr() {
    if (!profile.promptpayId) return
    setQrLoading(true)
    setActionMessage(null)
    try {
      const res = await fetch(`/api/public/pay/${profile.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount || undefined, note: note || undefined }),
      })
      const payload = await readApi<{ qrUrl: string; openUrl: string }>(res)
      if (!res.ok || !payload.data) {
        setActionMessage(payload.error ?? "สร้าง QR ไม่สำเร็จ")
        return
      }
      setQrUrl(payload.data.qrUrl)
      window.open(payload.data.openUrl, "_blank", "noopener,noreferrer")
    } catch {
      setActionMessage("สร้าง QR ไม่สำเร็จ")
    } finally {
      setQrLoading(false)
    }
  }

  const promptpayDisplay = profile.promptpayId
    ? formatPromptPay(profile.promptpayId, profile.promptpayType)
    : null

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", fontFamily, color: "#fff" }}>

      {/* ── Cover hero ── */}
      <div className="relative h-44" style={{
        background: coverCSS,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        {profile.coverStyle === "pattern" && (
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: profile.coverPattern === "dots"
              ? "radial-gradient(circle, white 1.5px, transparent 1.5px)"
              : "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)",
            backgroundSize: profile.coverPattern === "dots" ? "18px 18px" : "24px 24px",
          }} />
        )}
        {/* gradient overlay */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, transparent 20%, rgba(10,10,15,0.7) 70%, #0a0a0f 100%)",
        }} />

        {/* Floating mode badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold backdrop-blur-md"
            style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}40` }}>
            <ModeIcon size={11} />
            {mode.label}
          </div>
        </div>

        {/* URL badge */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] backdrop-blur-md"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)" }}>
            paymap.app/pay/{profile.slug}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 -mt-16 pb-20 relative">

        {/* ── Profile card ── */}
        <div className="rounded-3xl p-5 mb-4" style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          boxShadow: `0 0 60px ${accent}18, 0 20px 60px rgba(0,0,0,0.5)`,
        }}>

          <div className="flex items-end gap-4 mb-4">
            {/* Avatar */}
            <div className="relative shrink-0 -mt-10">
              <div className="h-20 w-20 flex items-center justify-center text-2xl font-black overflow-hidden"
                style={{ ...frameBorder, borderRadius: frameRadius, background: profile.avatarUrl ? "transparent" : `${accent}22`, boxShadow: `0 0 30px ${accent}40` }}>
                {profile.avatarUrl
                  ? <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                  : <span style={{ color: accent, fontFamily }}>{(profile.displayName[0] ?? "?").toUpperCase()}</span>
                }
              </div>
              {/* online dot */}
              <div className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2"
                style={{ background: "#22c55e", borderColor: "#0a0a0f" }} />
            </div>

            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-black ${isBold ? "text-2xl" : "text-xl"}`} style={{ fontFamily }}>
                  {profile.displayName}
                </span>
                {profile.badgeText && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${profile.badgeColor ?? accent}20`, color: profile.badgeColor ?? accent, border: `1px solid ${profile.badgeColor ?? accent}35` }}>
                    {profile.badgeText}
                  </span>
                )}
              </div>
              {profile.bio && (
                <p className="text-sm mt-1.5 leading-6" style={{ color: "rgba(255,255,255,0.55)" }}>{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Trust badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
              <Shield size={11} /> ยืนยันแล้ว
            </div>
            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Zap size={11} /> ไม่มีค่าธรรมเนียม
            </div>
            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
              style={{ background: mode.bg, color: accent, border: `1px solid ${accent}30` }}>
              <ModeIcon size={11} /> {mode.label}
            </div>
          </div>
        </div>

        {/* ── Payment section ── */}
        {profile.promptpayId ? (
          <div className="rounded-3xl p-5 mb-4 space-y-4" style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
          }}>

            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}20` }}>
                <QrCode size={14} style={{ color: accent }} />
              </div>
              <div>
                <div className="text-sm font-black">ชำระผ่าน PromptPay</div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>สแกนได้ทุก Mobile Banking</div>
              </div>
            </div>

            {/* Preset amounts */}
            {profile.presetAmounts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.presetAmounts.map(a => (
                  <button key={a} onClick={() => setAmount(a)}
                    className="rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200"
                    style={{
                      background: amount === a ? accent : "rgba(255,255,255,0.07)",
                      color: amount === a ? "#fff" : "rgba(255,255,255,0.65)",
                      border: `1px solid ${amount === a ? accent : "rgba(255,255,255,0.1)"}`,
                      boxShadow: amount === a ? `0 4px 20px ${accent}40` : "none",
                      transform: amount === a ? "scale(1.03)" : "scale(1)",
                    }}>
                    ฿{a.toLocaleString()}
                  </button>
                ))}
              </div>
            )}

            {/* Custom amount */}
            {profile.allowCustom && (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-lg" style={{ color: accent }}>฿</span>
                <input
                  type="number" min="1" value={amount}
                  onChange={e => setAmount(e.target.value ? Number(e.target.value) : "")}
                  placeholder="0"
                  className="w-full rounded-2xl pl-9 pr-4 py-3.5 text-xl font-black outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${amount ? accent + "60" : "rgba(255,255,255,0.1)"}`,
                    color: "#fff",
                    boxShadow: amount ? `0 0 0 3px ${accent}15` : "none",
                  }}
                />
              </div>
            )}

            {/* Note field */}
            {profile.requestNote && (
              <input
                value={note} onChange={e => setNote(e.target.value)}
                placeholder="หมายเหตุ เช่น ค่าจ้างงาน, ค่าสินค้า..."
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)",
                }}
              />
            )}

            {/* PromptPay ID card */}
            <div className="rounded-2xl p-4" style={{
              background: `linear-gradient(135deg, ${accent}12, ${accent}06)`,
              border: `1px solid ${accent}25`,
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {profile.promptpayType === "TAX" ? "เลขนิติบุคคล" :
                     profile.promptpayType === "NID" ? "เลขบัตรประชาชน" : "เบอร์โทรศัพท์"}
                  </div>
                  <div className="font-black text-2xl tracking-widest" style={{ color: accent }}>
                    {promptpayDisplay}
                  </div>
                </div>
                <button
                  onClick={() => copyText(profile.promptpayId!, "promptpay")}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all"
                  style={{
                    background: copied === "promptpay" ? `${accent}30` : `${accent}15`,
                    color: accent,
                    border: `1px solid ${accent}30`,
                  }}>
                  {copied === "promptpay" ? <Check size={13} /> : <Copy size={13} />}
                  {copied === "promptpay" ? "คัดลอกแล้ว" : "คัดลอก"}
                </button>
              </div>

              {amount ? (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: `${accent}25` }}>
                  <div className="text-[11px] mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>ยอดที่ต้องโอน</div>
                  <div className="text-4xl font-black" style={{ color: "#fff", textShadow: `0 0 30px ${accent}60` }}>
                    ฿{Number(amount).toLocaleString()}
                  </div>
                </div>
              ) : null}
            </div>

            {/* QR Button */}
            <button
              type="button"
              onClick={() => void openQr()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white transition-all disabled:opacity-60"
              disabled={qrLoading}
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                boxShadow: `0 8px 32px ${accent}50`,
              }}>
              <QrCode size={16} /> {qrLoading ? "กำลังสร้าง QR…" : "เปิด QR Code"}
              <ExternalLink size={13} className="opacity-70" />
            </button>

            {qrUrl ? (
              <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="mb-3 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>QR พร้อมแล้ว · คุณยังสามารถสแกนจากหน้านี้ได้</div>
                <img src={qrUrl} alt="PromptPay QR" className="mx-auto h-[220px] w-[220px] rounded-2xl bg-white p-3" />
              </div>
            ) : null}

            {actionMessage ? <p className="text-center text-[11px] text-amber-300">{actionMessage}</p> : null}

            <p className="text-center text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              ใช้ API สาธารณะของ PayMap เพื่อสร้าง QR จริง และเปิด promptpay.io เพื่อสำรอง flow สแกนจ่าย
            </p>
          </div>
        ) : (
          <div className="rounded-3xl p-6 mb-4 text-center" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.12)",
          }}>
            <Info size={22} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>ยังไม่ได้ตั้งค่าช่องทางรับเงิน</p>
          </div>
        )}

        {/* ── Bank account ── */}
        {profile.bankAccount && profile.bankName && (
          <div className="rounded-3xl p-5 mb-4" style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
              โอนผ่านบัญชีธนาคาร
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{profile.bankName}</div>
                <div className="font-black text-xl tracking-widest">{profile.bankAccount}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{profile.displayName}</div>
              </div>
              <button
                onClick={() => copyText(profile.bankAccount!, "bank")}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                {copied === "bank" ? <Check size={13} /> : <Copy size={13} />}
                {copied === "bank" ? "คัดลอกแล้ว" : "คัดลอก"}
              </button>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="text-center space-y-1.5 pt-4">
          <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            <Sparkles size={10} />
            สร้างโดย{" "}
            <a href="/" className="font-bold hover:opacity-80 transition-opacity" style={{ color: accent }}>
              payMap
            </a>
          </div>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
            ไม่มีค่าธรรมเนียม · ไม่เก็บข้อมูลบัตร · ตรวจสอบได้
          </p>
        </div>
      </div>
    </div>
  )
}
