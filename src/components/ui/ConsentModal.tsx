"use client"
// PayMap v5.1 — ConsentModal
// แสดงเมื่อ user ยังไม่ยอมรับ Terms หรือ version เปลี่ยน
// Design: dark/light responsive, bilingual TH/EN, scroll-to-read

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Shield, FileText, ChevronDown, ChevronUp,
  Check, X, ExternalLink, AlertTriangle, Lock
} from "lucide-react"
import {
  TOS_SECTIONS, PRIVACY_SECTIONS,
  APP_FULL_NAME, TOS_VERSION, PRIVACY_VERSION,
  SUPPORT_EMAIL, APP_URL,
  type TOSSection,
} from "@/lib/tos-content"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConsentModalProps {
  onAccepted: () => void
  isUpdate?: boolean  // true = เวอร์ชันใหม่ ไม่ใช่ครั้งแรก
}

// ─── Accordion Section ────────────────────────────────────────────────────────

function AccordionSection({ section }: { section: TOSSection }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden",
      marginBottom: 8,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "12px 16px", cursor: "pointer",
          background: open ? "var(--surface-2)" : "var(--card)", border: "none",
          textAlign: "left", gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {section.important && (
            <AlertTriangle size={13} style={{ color: "var(--amber)", flexShrink: 0 }} />
          )}
          <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>
            {section.title}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>
            {section.titleEN}
          </span>
        </div>
        {open
          ? <ChevronUp size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />
          : <ChevronDown size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div style={{
          padding: "14px 16px",
          background: "var(--surface-3)",
          fontSize: 13, lineHeight: 1.8, color: "var(--text-2)",
          whiteSpace: "pre-line",
          borderTop: "1px solid var(--border)",
        }}>
          {section.content}
        </div>
      )}
    </div>
  )
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

type TabId = "tos" | "privacy"

function TabButton({
  active, onClick, icon, label,
}: {
  active: boolean; onClick: () => void
  icon: React.ReactNode; label: string
}) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      padding: "9px 0", borderRadius: 8, fontSize: 13, fontWeight: 600,
      cursor: "pointer", border: "none", transition: "all .15s",
      background: active ? "var(--primary)" : "transparent",
      color: active ? "#fff" : "var(--text-3)",
    }}>
      {icon} {label}
    </button>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function ConsentModal({ onAccepted, isUpdate = false }: ConsentModalProps) {
  const [tab, setTab]               = useState<TabId>("tos")
  const [scrolledTos, setScrolledTos]         = useState(false)
  const [scrolledPrivacy, setScrolledPrivacy] = useState(false)
  const [checkTos, setCheckTos]     = useState(false)
  const [checkPrivacy, setCheckPrivacy] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Track scroll position to enable checkboxes
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 60
    if (tab === "tos"     && nearBottom) setScrolledTos(true)
    if (tab === "privacy" && nearBottom) setScrolledPrivacy(true)
  }, [tab])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [handleScroll, tab])

  // Reset scroll on tab change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [tab])

  const canAccept = checkTos && checkPrivacy

  const handleAccept = async () => {
    if (!canAccept) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/user/consent", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ acceptTos: true, acceptPrivacy: true }),
      })
      const json = await res.json()
      if (json.success) {
        onAccepted()
      } else {
        setError(json.error ?? "บันทึกไม่สำเร็จ กรุณาลองใหม่")
      }
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }

  const sections = tab === "tos" ? TOS_SECTIONS : PRIVACY_SECTIONS
  const scrolled  = tab === "tos" ? scrolledTos  : scrolledPrivacy

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)",
      }} />

      {/* Modal */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}>
        <div style={{
          width: "100%", maxWidth: 680,
          background: "var(--bg-2)",
          border: "1px solid var(--border2)",
          borderRadius: 20,
          display: "flex", flexDirection: "column",
          maxHeight: "92vh",
          boxShadow: "0 32px 120px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}>

          {/* ── Header ── */}
          <div style={{
            padding: "22px 24px 18px",
            borderBottom: "1px solid var(--border)",
            background: "var(--card)",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "var(--primary-soft)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Shield size={20} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>
                  {isUpdate ? "ข้อตกลงมีการอัปเดต" : `ยินดีต้อนรับสู่ ${APP_FULL_NAME}`}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
                  {isUpdate
                    ? "กรุณาอ่านและยอมรับข้อตกลงฉบับใหม่เพื่อใช้งานต่อ"
                    : "กรุณาอ่านและยอมรับข้อตกลงก่อนเริ่มใช้งาน"}
                  {" "}· TOS v{TOS_VERSION} · Privacy v{PRIVACY_VERSION}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex", gap: 4, marginTop: 14,
              background: "var(--surface-2)", borderRadius: 10, padding: 4,
            }}>
              <TabButton
                active={tab === "tos"} onClick={() => setTab("tos")}
                icon={<FileText size={13} />} label="ข้อตกลงการใช้งาน (TOS)"
              />
              <TabButton
                active={tab === "privacy"} onClick={() => setTab("privacy")}
                icon={<Lock size={13} />} label="นโยบายความเป็นส่วนตัว"
              />
            </div>
          </div>

          {/* ── Scroll hint ── */}
          {!scrolled && (
            <div style={{
              background: "var(--primary-soft)", borderBottom: "1px solid var(--border)",
              padding: "8px 24px", fontSize: 12, color: "var(--primary)",
              display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            }}>
              <ChevronDown size={13} />
              เลื่อนลงอ่านข้อตกลงให้ครบก่อนกดยืนยัน
            </div>
          )}

          {/* ── Content ── */}
          <div
            ref={scrollRef}
            style={{
              flex: 1, overflowY: "auto", padding: "20px 24px",
            }}
          >
            {/* Version badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
              padding: "8px 14px", borderRadius: 8,
              background: "var(--surface-2)",
              fontSize: 12, color: "var(--text-3)",
            }}>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>{APP_FULL_NAME}</span>
              <span>·</span>
              {tab === "tos"
                ? `ข้อตกลงการใช้งาน ฉบับ v${TOS_VERSION}`
                : `นโยบายความเป็นส่วนตัว ฉบับ v${PRIVACY_VERSION}`}
              <a
                href={tab === "tos" ? "/terms" : "/privacy"}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, color: "var(--primary)", textDecoration: "none" }}
              >
                เปิดในหน้าต่างใหม่ <ExternalLink size={11} />
              </a>
            </div>

            {/* Sections */}
            {sections.map(sec => (
              <AccordionSection key={sec.id} section={sec} />
            ))}

            {/* Bottom spacer */}
            <div style={{ height: 12 }} />
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: "18px 24px 22px",
            borderTop: "1px solid var(--border)",
            background: "var(--card)",
            flexShrink: 0,
          }}>

            {/* Checkboxes */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {[
                {
                  id: "tos", checked: checkTos, setChecked: setCheckTos,
                  scrolled: scrolledTos, setTab: () => setTab("tos"),
                  label: "ฉันได้อ่านและยอมรับ ข้อตกลงการใช้งาน (Terms of Service)",
                  tab: "tos" as TabId,
                },
                {
                  id: "privacy", checked: checkPrivacy, setChecked: setCheckPrivacy,
                  scrolled: scrolledPrivacy, setTab: () => setTab("privacy"),
                  label: "ฉันได้อ่านและยอมรับ นโยบายความเป็นส่วนตัว (Privacy Policy)",
                  tab: "privacy" as TabId,
                },
              ].map(item => (
                <label key={item.id} style={{
                  display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
                  opacity: item.scrolled ? 1 : 0.5,
                }}>
                  <div
                    onClick={e => {
                      e.preventDefault()
                      if (!item.scrolled) {
                        setTab(item.tab)
                        if (scrollRef.current) {
                          scrollRef.current.scrollTo({ top: 99999, behavior: "smooth" })
                        }
                        return
                      }
                      item.setChecked(!item.checked)
                    }}
                    style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                      border: `2px solid ${item.checked ? "var(--primary)" : "var(--border2)"}`,
                      background: item.checked ? "var(--primary)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .15s", marginTop: 1, cursor: "pointer",
                    }}
                  >
                    {item.checked && <Check size={12} color="#fff" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                    {item.label}
                    {!item.scrolled && (
                      <span style={{ color: "var(--amber)", fontSize: 11, display: "block", marginTop: 2 }}>
                        ↑ เลื่อนอ่านให้ครบก่อน
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>

            {error && (
              <div style={{
                background: "var(--red-d)", color: "var(--red)",
                padding: "10px 14px", borderRadius: 8, fontSize: 12, marginBottom: 12,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleAccept}
              disabled={!canAccept || loading}
              style={{
                width: "100%", padding: "14px 0",
                borderRadius: 12, fontSize: 15, fontWeight: 700,
                cursor: canAccept && !loading ? "pointer" : "not-allowed",
                border: "none", transition: "all .2s",
                background: canAccept
                  ? "linear-gradient(135deg, var(--primary) 0%, #6d28d9 100%)"
                  : "var(--surface-2)",
                color: canAccept ? "#fff" : "var(--text-3)",
                boxShadow: canAccept ? "0 8px 24px rgba(124,58,237,0.35)" : "none",
                transform: canAccept && !loading ? "translateY(0)" : "translateY(0)",
              }}
            >
              {loading ? "กำลังบันทึก..." : canAccept
                ? `✓ ยืนยันการยอมรับข้อตกลงและเริ่มใช้งาน ${APP_FULL_NAME}`
                : "กรุณาอ่านและติ๊กยืนยันทั้ง 2 ข้อก่อน"}
            </button>

            <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", marginTop: 10 }}>
              หากมีคำถาม ติดต่อ{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: "var(--primary)" }}>{SUPPORT_EMAIL}</a>
              {" "}· <a href={APP_URL} style={{ color: "var(--primary)" }}>{APP_FULL_NAME}</a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
