"use client"

import { useState } from "react"
import Link from "next/link"
import { KeyRound, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import { sendPasswordResetEmail } from "firebase/auth"
import { firebaseAuth } from "@/lib/firebase-client"
import PublicShell from "@/components/public/PublicShell"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"

export default function ForgotPasswordPage() {
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
      await sendPasswordResetEmail(firebaseAuth, email.trim())
      setMessage("ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ")
    } catch (err: any) {
      setError(err?.message || "ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicShell eyebrow="Password reset" title="รีเซ็ตรหัสผ่าน" description="กรอกอีเมลที่ใช้สมัคร แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ" compact>
      <div className="mx-auto grid max-w-[820px] gap-6 lg:grid-cols-[.86fr_1.14fr]">
        <section className="public-panel-v72 public-panel-v72-soft">
          <div className="public-mode-icon-v72 h-12 w-12"><KeyRound size={18} /></div>
          <h2 className="mt-5 text-2xl font-black text-[var(--text)]">ช่วยคุณกลับเข้าใช้งานได้เร็วขึ้น</h2>
          <div className="mt-6 space-y-3">
            {[
              "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลที่ใช้สมัคร",
              "ลิงก์จะพาคุณกลับมาที่หน้าเข้าสู่ระบบอย่างปลอดภัย",
              "ใช้ได้ทั้งบัญชี Personal, Business และ Merchant",
            ].map((item) => (
              <div key={item} className="public-feature-row-v72">
                <CheckCircle2 size={15} className="text-[var(--primary)]" /> {item}
              </div>
            ))}
          </div>
        </section>

        <section className="public-panel-v72">
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
              ส่งลิงก์รีเซ็ตรหัสผ่าน
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--text-3)]">
            <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">กลับไปหน้าเข้าสู่ระบบ</Link>
            <Link href="/register?mode=business" className="hover:text-[var(--text)] hover:underline">สร้างบัญชีใหม่</Link>
          </div>
        </section>
      </div>
    </PublicShell>
  )
}
