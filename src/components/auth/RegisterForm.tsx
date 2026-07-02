"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react"
import { registerSchema, type RegisterInput } from "@/lib/validations"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import PasswordStrength from "@/components/auth/PasswordStrength"
import { buildWorkspaceSelectPath, resolvePostAuthPath } from "@/lib/workspace"
import type { SiteLang } from "@/lib/i18n/site"

const FIREBASE_CONFIGURED = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== ""
)

async function finalizeFirebaseLogin(idToken: string, mode?: string, nextPath?: string) {
  const res = await fetch("/api/auth/firebase-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, mode, next: nextPath }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "สร้าง session ไม่สำเร็จ")
  return json
}

async function registerDirect(
  payload: { name: string; email: string; password: string; mode?: string },
  nextPath?: string
) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, next: nextPath }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "สร้างบัญชีไม่สำเร็จ")
  return json
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.71c.02 2.15 1.89 2.87 1.91 2.88-.02.05-.3 1.04-.98 2.05-.59.87-1.2 1.73-2.16 1.75-.95.02-1.26-.56-2.35-.56-1.09 0-1.44.54-2.33.58-.92.03-1.63-.93-2.22-1.8-1.2-1.74-2.12-4.92-.89-7.06.61-1.06 1.7-1.73 2.88-1.75.9-.02 1.75.61 2.35.61.6 0 1.72-.76 2.89-.65.49.02 1.86.2 2.74 1.48-.07.04-1.64.96-1.62 2.47Zm-2.23-5.56c.49-.59.82-1.4.73-2.21-.71.03-1.56.47-2.07 1.06-.46.53-.86 1.35-.75 2.14.79.06 1.61-.4 2.09-.99Z" />
    </svg>
  )
}

export default function RegisterForm({
  selectedMode,
  prefilledEmail,
  nextPath: requestedNextPath,
  lang = "en",
}: {
  selectedMode?: "personal" | "business" | "merchant"
  prefilledEmail?: string
  nextPath?: string
  lang?: SiteLang
}) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: prefilledEmail ?? "", password: "", confirmPassword: "" },
  })

  useEffect(() => {
    if (prefilledEmail) setValue("email", prefilledEmail)
  }, [prefilledEmail, setValue])

  const passwordValue = watch("password", "")
  const isGenericSignup = !selectedMode

  const copy = lang === "th" ? {
    name: "ชื่อ-นามสกุล", email: "อีเมล", password: "รหัสผ่าน", confirmPassword: "ยืนยันรหัสผ่าน",
    namePlaceholder: "สมชาย ใจดี", emailPlaceholder: "your@email.com", newPasswordPlaceholder: "อย่างน้อย 8 ตัวอักษร", confirmPlaceholder: "••••••••",
    isolatedData: "ข้อมูลการเงินจะอยู่ในเครื่องเป็นค่าเริ่มต้น และจะไม่อัปโหลดขึ้น Cloud Backup เว้นแต่คุณเปิดเอง",
    createAccount: "สร้างบัญชี", processing: "กำลังดำเนินการ...", orSignup: "หรือสมัครด้วย", google: "สมัครด้วย Google", apple: "สมัครด้วย Apple", success: "สร้างบัญชีสำเร็จ กำลังพาคุณไปเลือก workspace"
  } : lang === "lo" ? {
    name: "ຊື່ເຕັມ", email: "ອີເມວ", password: "ລະຫັດຜ່ານ", confirmPassword: "ຢືນຢັນລະຫັດຜ່ານ",
    namePlaceholder: "Alex Johnson", emailPlaceholder: "your@email.com", newPasswordPlaceholder: "ຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ", confirmPlaceholder: "••••••••",
    isolatedData: "ຂໍ້ມູນການເງິນຈະຢູ່ໃນອຸປະກອນເປັນຄ່າເລີ່ມຕົ້ນ ແລະຈະບໍ່ອັບໂຫຼດໄປ Cloud Backup ເວັ້ນແຕ່ທ່ານເປີດເອງ.",
    createAccount: "ສ້າງບັນຊີ", processing: "ກໍາລັງດໍາເນີນການ...", orSignup: "ຫຼືສະໝັກດ້ວຍ", google: "ສະໝັກດ້ວຍ Google", apple: "ສະໝັກດ້ວຍ Apple", success: "ສ້າງບັນຊີສໍາເລັດ ກໍາລັງພາທ່ານໄປເລືອກ workspace"
  } : {
    name: "Full name", email: "Email", password: "Password", confirmPassword: "Confirm password",
    namePlaceholder: "Alex Johnson", emailPlaceholder: "your@email.com", newPasswordPlaceholder: "At least 8 characters", confirmPlaceholder: "Repeat your password",
    isolatedData: "Your financial data stays on this device by default and will not upload to Cloud Backup unless you enable it.",
    createAccount: "Create account", processing: "Working...", orSignup: "Or sign up with", google: "Sign up with Google", apple: "Sign up with Apple", success: "Account created. Taking you to workspace selection."
  }
  const nextPath = selectedMode
    ? resolvePostAuthPath(selectedMode, requestedNextPath)
    : buildWorkspaceSelectPath(requestedNextPath)

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null)
    try {
      let json: any
      if (FIREBASE_CONFIGURED) {
        const { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } = await import("firebase/auth")
        const { firebaseAuth } = await import("@/lib/firebase-client")
        const credential = await createUserWithEmailAndPassword(firebaseAuth, data.email.trim(), data.password)
        await updateProfile(credential.user, { displayName: data.name.trim() })
        await sendEmailVerification(credential.user, { url: `${window.location.origin}/login?verified=1` })
        const idToken = await credential.user.getIdToken(true)
        json = await finalizeFirebaseLogin(idToken, selectedMode, nextPath)
      } else {
        json = await registerDirect(
          { name: data.name.trim(), email: data.email.trim(), password: data.password, mode: selectedMode },
          nextPath
        )
      }

      setSuccess(true)
      router.replace(json?.redirectTo || nextPath)
      router.refresh()
    } catch (error: any) {
      const code = error?.code || ""
      if (code.includes("auth/email-already-in-use")) {
        setServerError(isGenericSignup ? "อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบแทน" : `อีเมลนี้มีบัญชีในพื้นที่นี้อยู่แล้ว กรุณาเข้าสู่ระบบ`)
        return
      }
      if (code.includes("auth/weak-password")) {
        setServerError("รหัสผ่านสั้นเกินไป กรุณาใช้รหัสผ่านที่ปลอดภัยมากขึ้น")
        return
      }
      setServerError(error?.message || "ยังไม่สามารถสร้างบัญชีได้ กรุณาลองใหม่อีกครั้ง")
    }
  }

  const handleGoogleRegister = async () => {
    if (!FIREBASE_CONFIGURED) {
      setServerError("ยังไม่พร้อมใช้งานการดำเนินการด้วย Google ในตอนนี้ กรุณาสมัครด้วยอีเมลและรหัสผ่านก่อน")
      return
    }
    setServerError(null)
    setGoogleLoading(true)
    try {
      const { signInWithPopup } = await import("firebase/auth")
      const { firebaseAuth, googleProvider } = await import("@/lib/firebase-client")
      const result = await signInWithPopup(firebaseAuth, googleProvider)
      const idToken = await result.user.getIdToken(true)
      const json = await finalizeFirebaseLogin(idToken, selectedMode, nextPath)
      setSuccess(true)
      router.replace(json?.redirectTo || nextPath)
      router.refresh()
    } catch (error: any) {
      const code = error?.code || ""
      if (code !== "auth/popup-closed-by-user") {
        setServerError(error?.message || "ดำเนินการด้วย Google ไม่สำเร็จ")
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleAppleRegister = async () => {
    if (!FIREBASE_CONFIGURED) {
      setServerError("ยังไม่พร้อมใช้งานการดำเนินการด้วย Apple ในตอนนี้ กรุณาสมัครด้วยอีเมลและรหัสผ่านก่อน")
      return
    }
    setServerError(null)
    setAppleLoading(true)
    try {
      const { signInWithPopup } = await import("firebase/auth")
      const { firebaseAuth, appleProvider } = await import("@/lib/firebase-client")
      const result = await signInWithPopup(firebaseAuth, appleProvider)
      const idToken = await result.user.getIdToken(true)
      const json = await finalizeFirebaseLogin(idToken, selectedMode, nextPath)
      setSuccess(true)
      router.replace(json?.redirectTo || nextPath)
      router.refresh()
    } catch (error: any) {
      const code = error?.code || ""
      if (code !== "auth/popup-closed-by-user") {
        setServerError(error?.message || "ดำเนินการด้วย Apple ไม่สำเร็จ")
      }
    } finally {
      setAppleLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>

      {serverError && (
        <div className="flex animate-fade-in items-start gap-3 rounded-xl border border-[rgba(248,113,113,0.25)] bg-[var(--red-d)] px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-[var(--red)]" />
          <p className="text-[13px] text-[var(--red)]">{serverError}</p>
        </div>
      )}

      {success && (
        <div className="flex animate-fade-in items-center gap-3 rounded-xl border border-[rgba(52,211,153,.25)] bg-[var(--green-d)] px-4 py-3">
          <span className="text-[var(--green)]">✓</span>
          <p className="text-[13px] text-[var(--green)]">{copy.success}</p>
        </div>
      )}

      <Input
        label={copy.name}
        type="text"
        placeholder={copy.namePlaceholder}
        autoComplete="name"
        icon={<User size={16} />}
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label={copy.email}
        type="email"
        placeholder={copy.emailPlaceholder}
        autoComplete="email"
        icon={<Mail size={16} />}
        error={errors.email?.message}
        readOnly={!!prefilledEmail}
        style={prefilledEmail ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
        {...register("email")}
      />

      <div>
        <Input
          label={copy.password}
          type="password"
          placeholder={copy.newPasswordPlaceholder}
          autoComplete="new-password"
          icon={<Lock size={16} />}
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrength password={passwordValue} />
      </div>

      <Input
        label={copy.confirmPassword}
        type="password"
        placeholder={copy.confirmPlaceholder}
        autoComplete="new-password"
        icon={<Lock size={16} />}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <p className="text-[11px] text-[var(--text4)]">
        {copy.isolatedData}
      </p>

      <Button
        type="submit"
        size="lg"
        loading={isSubmitting || success}
        className="w-full"
        icon={!isSubmitting && !success ? <ArrowRight size={17} /> : undefined}
      >
        {success ? copy.processing : copy.createAccount}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--s1)] px-3 text-[11px] text-[var(--text4)]">{copy.orSignup}</span>
        </div>
      </div>

      <button
        type="button"
        className="auth-social-btn"
        onClick={handleGoogleRegister}
        disabled={googleLoading || appleLoading || isSubmitting || success}
      >
        {googleLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.292C4.672 5.163 6.656 3.58 9 3.58z" />
          </svg>
        )}
        {googleLoading ? copy.processing : copy.google}
      </button>

      <button
        type="button"
        className="auth-social-btn"
        onClick={handleAppleRegister}
        disabled={appleLoading || googleLoading || isSubmitting || success}
      >
        {appleLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <AppleIcon />}
        {appleLoading ? copy.processing : copy.apple}
      </button>
    </form>
  )
}
