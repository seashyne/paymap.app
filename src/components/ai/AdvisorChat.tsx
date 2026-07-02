"use client"
// v1.8: AI Financial Advisor — floating chat powered by Claude Sonnet
// รู้ข้อมูลการเงินจริงของ user ตอบได้ตรงจุด
import { useState, useRef, useEffect } from "react"
import { Sparkles, Send, Loader2, X, Minus, ChevronDown } from "lucide-react"

type Message = { role: "user" | "assistant"; content: string; ts?: number }

const SUGGESTED = [
  "เดือนนี้ควรลดรายจ่ายอะไร?",
  "ออมเพิ่มเท่าไหร่ดี?",
  "SSF/RMF ควรลงทุนไหม?",
  "budget หมวดไหนน่าเป็นห่วง?",
]

export default function AdvisorChat() {
  const [open, setOpen]         = useState(false)
  const [minimized, setMin]     = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [remaining, setRem]     = useState<number | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80)
      inputRef.current?.focus()
    }
  }, [messages, open, minimized])

  // Greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "สวัสดีครับ! ผม payMap AI 👋\nผมดูข้อมูลการเงินของคุณแล้ว ถามได้เลยนะครับ — budget, ออม, ภาษี, วางแผน ยินดีช่วย!",
        ts: Date.now(),
      }])
    }
  }, [open])

  async function send(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput("")
    setError(null)
    const userMsg: Message = { role: "user", content: msg, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionHistory: history }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.upgradeRequired) {
          setError(null)
          setMessages(prev => [...prev, {
            role: "assistant",
            content: `⚠️ ${data.error}\n\n[อัปเกรดที่ paymap.app/pricing](https://paymap.app/pricing)`,
            ts: Date.now(),
          }])
          return
        }
        if (data.setup) {
          setError("AI Advisor ยังไม่ได้ตั้งค่า กรุณาเพิ่ม ANTHROPIC_API_KEY ใน .env.local")
          return
        }
        setError(data.error ?? "เกิดข้อผิดพลาด")
        return
      }
      setMessages(prev => [...prev, { role: "assistant", content: data.reply, ts: Date.now() }])
      if (data.remaining != null) setRem(data.remaining)
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้ ลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  // Closed — show launch button
  if (!open) return (
    <button
      onClick={() => { setOpen(true); setMin(false) }}
      className="fixed bottom-24 right-6 z-40 flex items-center gap-2 rounded-full py-3 pl-3 pr-4 text-sm font-black text-white shadow-2xl transition-all duration-200 hover:scale-105 hover:shadow-purple-500/30 active:scale-95"
      style={{ background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)" }}
      title="AI Financial Advisor"
    >
      <Sparkles size={15} />
      <span className="hidden sm:inline">AI Advisor</span>
    </button>
  )

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-[28px] border border-[var(--border)] shadow-2xl transition-all duration-200"
      style={{
        width: minimized ? "220px" : "360px",
        height: minimized ? "52px" : "520px",
        background: "var(--card)",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="flex flex-shrink-0 cursor-pointer items-center justify-between gap-2 px-4 py-3.5"
        style={{ background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)" }}
        onClick={() => setMin(v => !v)}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-white" />
          <span className="text-sm font-black text-white">AI Advisor</span>
          {remaining != null && (
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-mono text-white/80">
              {remaining}/20
            </span>
          )}
        </div>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setMin(v => !v)}
            className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            {minimized ? <ChevronDown size={13} /> : <Minus size={13} />}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── Body (hidden when minimized) ───────────────────────── */}
      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 px-3 py-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {m.role === "assistant" && (
                  <div
                    className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}
                  >
                    <Sparkles size={10} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "rounded-br-sm bg-[#8b5cf6] text-white"
                      : "rounded-bl-sm bg-[var(--surface2)] text-[var(--text)]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div
                  className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}
                >
                  <Sparkles size={10} className="text-white" />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-[var(--surface2)] px-3 py-2.5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-[var(--text-3)] opacity-60"
                        style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
                ❌ {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggested questions — show only at start */}
          {messages.length <= 1 && !loading && (
            <div className="flex-shrink-0 px-3 pb-2">
              <p className="mb-1.5 text-[10px] font-semibold text-[var(--text-3)]">ลองถาม:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED.map(q => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-2.5 py-1 text-[10px] text-[var(--text-2)] transition-colors hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-400"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="flex flex-shrink-0 items-center gap-2 border-t border-[var(--border)] px-3 py-2.5">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="ถามเรื่องการเงิน..."
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent text-xs text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-30"
              style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}
            >
              {loading ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
