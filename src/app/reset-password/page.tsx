"use client"

import { useState } from "react"
import Link from "next/link"
import { KeyRound, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import PublicShell from "@/components/public/PublicShell"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const { sendPasswordResetEmail } = await import("firebase/auth")
      const { firebaseAuth } = await import("@/lib/firebase-client")
      await sendPasswordResetEmail(firebaseAuth, email.trim())
      setMessage("ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ")
    } catch (err: any) {
      setError(err?.message || "ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicShell eyebrow="Reset password" title="รับลิงก์ตั้งรหัสผ่านใหม่" description="หน้านี้รองรับการส่งอีเมลรีเซ็ตรหัสผ่านอีกครั้ง หากคุณยังไม่ได้รับลิงก์" compact>
      <div className="mx-auto max-w-[720px]">
        <section className="public-panel-v72">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-bold text-[var(--text-2)]">
            <KeyRound size={12} /> Password recovery
          </div>

          {error ? (
            <div className="public-inline-alert-v72 mb-4 border-rose-300/40 bg-rose-50/10 text-rose-300">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {message ? (
            <div className="public-inline-alert-v72 mb-4 border-emerald-300/30 bg-emerald-500/10 text-emerald-300">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="name@company.com"
              autoComplete="email"
              icon={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" size="lg" loading={loading} className="w-full" icon={<ArrowRight size={16} />} iconPosition="right">
              ส่งอีเมลอีกครั้ง
            </Button>
          </form>

          <div className="mt-4 text-sm text-[var(--text-3)]">
            พร้อมแล้ว? <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">กลับไปเข้าสู่ระบบ</Link>
          </div>
        </section>
      </div>
    </PublicShell>
  )
}
