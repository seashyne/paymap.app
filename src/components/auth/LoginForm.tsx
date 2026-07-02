"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles } from "lucide-react"
import { loginSchema, type LoginInput } from "@/lib/validations"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import type { SiteLang } from "@/lib/i18n/site"

const FIREBASE_CONFIGURED = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== ""
)

type LoginWorkspaceMode = "personal" | "business" | "merchant"

async function loginDirect(email: string, password: string, mode: LoginWorkspaceMode, nextPath?: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, mode, next: nextPath }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || "Login failed")
  }
  return json
}

async function finalizeFirebaseSession(idToken: string, mode: LoginWorkspaceMode, nextPath?: string) {
  const res = await fetch("/api/auth/firebase-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, mode, next: nextPath }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "Login failed")
  return json
}

async function loginGoogle(mode: LoginWorkspaceMode, nextPath?: string) {
  const { signInWithPopup } = await import("firebase/auth")
  const { firebaseAuth, googleProvider } = await import("@/lib/firebase-client")
  const credential = await signInWithPopup(firebaseAuth, googleProvider)
  const idToken = await credential.user.getIdToken(true)
  return finalizeFirebaseSession(idToken, mode, nextPath)
}

async function loginApple(mode: LoginWorkspaceMode, nextPath?: string) {
  const { signInWithPopup } = await import("firebase/auth")
  const { firebaseAuth, appleProvider } = await import("@/lib/firebase-client")
  const credential = await signInWithPopup(firebaseAuth, appleProvider)
  const idToken = await credential.user.getIdToken(true)
  return finalizeFirebaseSession(idToken, mode, nextPath)
}

function AppleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.71c.02 2.15 1.89 2.87 1.91 2.88-.02.05-.3 1.04-.98 2.05-.59.87-1.2 1.73-2.16 1.75-.95.02-1.26-.56-2.35-.56-1.09 0-1.44.54-2.33.58-.92.03-1.63-.93-2.22-1.8-1.2-1.74-2.12-4.92-.89-7.06.61-1.06 1.7-1.73 2.88-1.75.9-.02 1.75.61 2.35.61.6 0 1.72-.76 2.89-.65.49.02 1.86.2 2.74 1.48-.07.04-1.64.96-1.62 2.47Zm-2.23-5.56c.49-.59.82-1.4.73-2.21-.71.03-1.56.47-2.07 1.06-.46.53-.86 1.35-.75 2.14.79.06 1.61-.4 2.09-.99Z" />
    </svg>
  )
}

const COPY = {
  en: {
    email: "Email",
    password: "Password",
    emailPlaceholder: "name@company.com",
    passwordPlaceholder: "Enter your password",
    workspaceHint: "Sign in to open your private money dashboard. Your financial data stays on your device by default.",
    signIn: "Log in",
    or: "Or",
    google: "Continue with Google",
    apple: "Continue with Apple",
    success: "Logged in successfully. Taking you to your dashboard.",
    processing: "Connecting...",
    wrongCredentials: "Your email or password is incorrect.",
    tooMany: "Too many attempts. Please try again later.",
    loginFailed: "Unable to sign in. Please try again.",
    googleUnavailable: "Google sign-in is not available right now. Please use email and password.",
    appleUnavailable: "Apple sign-in is not available right now. Please use email and password.",
    googleFailed: "Google sign-in failed.",
    appleFailed: "Apple sign-in failed.",
  },
  th: {
    email: "อีเมล",
    password: "รหัสผ่าน",
    emailPlaceholder: "name@company.com",
    passwordPlaceholder: "กรอกรหัสผ่านของคุณ",
    workspaceHint: "เข้าสู่ระบบเพื่อเปิดแดชบอร์ดการเงินส่วนตัว ข้อมูลการเงินอยู่ในเครื่องเป็นค่าเริ่มต้น",
    signIn: "เข้าสู่ระบบ",
    or: "หรือ",
    google: "เข้าสู่ระบบด้วย Google",
    apple: "เข้าสู่ระบบด้วย Apple",
    success: "เข้าสู่ระบบสำเร็จ กำลังพาคุณไปยังหน้าหลัก",
    processing: "กำลังเชื่อมต่อ...",
    wrongCredentials: "Email หรือ Password ไม่ถูกต้อง",
    tooMany: "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง",
    loginFailed: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่",
    googleUnavailable: "ยังไม่พร้อมใช้งานการเข้าสู่ระบบด้วย Google ในตอนนี้ กรุณาใช้อีเมลและรหัสผ่านก่อน",
    appleUnavailable: "ยังไม่พร้อมใช้งานการเข้าสู่ระบบด้วย Apple ในตอนนี้ กรุณาใช้อีเมลและรหัสผ่านก่อน",
    googleFailed: "เข้าสู่ระบบด้วย Google ไม่สำเร็จ",
    appleFailed: "เข้าสู่ระบบด้วย Apple ไม่สำเร็จ",
  },
  lo: {
    email: "ອີເມວ",
    password: "ລະຫັດຜ່ານ",
    emailPlaceholder: "name@company.com",
    passwordPlaceholder: "ກອກລະຫັດຜ່ານຂອງທ່ານ",
    workspaceHint: "ເຂົ້າລະບົບເພື່ອເປີດ dashboard ການເງິນສ່ວນຕົວ ຂໍ້ມູນຢູ່ໃນອຸປະກອນເປັນຄ່າເລີ່ມຕົ້ນ.",
    signIn: "ເຂົ້າລະບົບ",
    or: "ຫຼື",
    google: "ເຂົ້າລະບົບດ້ວຍ Google",
    apple: "ເຂົ້າລະບົບດ້ວຍ Apple",
    success: "ເຂົ້າລະບົບສໍາເລັດ ກໍາລັງພາທ່ານໄປຫາໜ້າຫຼັກ",
    processing: "ກໍາລັງເຊື່ອມຕໍ່...",
    wrongCredentials: "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ",
    tooMany: "ພະຍາຍາມເຂົ້າລະບົບຫຼາຍເກີນໄປ ກະລຸນາລອງໃໝ່ພາຍຫຼັງ",
    loginFailed: "ບໍ່ສາມາດເຂົ້າລະບົບໄດ້ ກະລຸນາລອງໃໝ່",
    googleUnavailable: "Google ຍັງບໍ່ພ້ອມໃຊ້ງານໃນຂະນະນີ້ ກະລຸນາໃຊ້ອີເມວ ແລະ ລະຫັດຜ່ານກ່ອນ",
    appleUnavailable: "Apple ຍັງບໍ່ພ້ອມໃຊ້ງານໃນຂະນະນີ້ ກະລຸນາໃຊ້ອີເມວ ແລະ ລະຫັດຜ່ານກ່ອນ",
    googleFailed: "ການເຂົ້າລະບົບດ້ວຍ Google ບໍ່ສໍາເລັດ",
    appleFailed: "ການເຂົ້າລະບົບດ້ວຍ Apple ບໍ່ສໍາເລັດ",
  },
  zh: {
    email: "邮箱",
    password: "密码",
    emailPlaceholder: "name@company.com",
    passwordPlaceholder: "请输入密码",
    workspaceHint: "请先登录，然后再选择要进入的工作区。",
    signIn: "登录",
    or: "或",
    google: "使用 Google 登录",
    apple: "使用 Apple 登录",
    success: "登录成功，正在跳转至仪表盘。",
    processing: "连接中...",
    wrongCredentials: "邮箱或密码不正确。",
    tooMany: "尝试次数过多，请稍后再试。",
    loginFailed: "登录失败，请重试。",
    googleUnavailable: "Google 登录暂时不可用，请使用邮箱和密码。",
    appleUnavailable: "Apple 登录暂时不可用，请使用邮箱和密码。",
    googleFailed: "Google 登录失败。",
    appleFailed: "Apple 登录失败。",
  },
  ja: {
    email: "メールアドレス",
    password: "パスワード",
    emailPlaceholder: "name@company.com",
    passwordPlaceholder: "パスワードを入力してください",
    workspaceHint: "先にログインして、その後で開くワークスペースを選択します。",
    signIn: "ログイン",
    or: "または",
    google: "Google でログイン",
    apple: "Apple でログイン",
    success: "ログインしました。ダッシュボードへ移動します。",
    processing: "接続中...",
    wrongCredentials: "メールアドレスまたはパスワードが正しくありません。",
    tooMany: "試行回数が多すぎます。後でもう一度お試しください。",
    loginFailed: "ログインできませんでした。もう一度お試しください。",
    googleUnavailable: "Google ログインは現在利用できません。メールとパスワードをご使用ください。",
    appleUnavailable: "Apple ログインは現在利用できません。メールとパスワードをご使用ください。",
    googleFailed: "Google ログインに失敗しました。",
    appleFailed: "Apple ログインに失敗しました。",
  },
  ko: {
    email: "이메일",
    password: "비밀번호",
    emailPlaceholder: "name@company.com",
    passwordPlaceholder: "비밀번호를 입력하세요",
    workspaceHint: "먼저 로그인한 뒤, 들어갈 워크스페이스를 선택하세요.",
    signIn: "로그인",
    or: "또는",
    google: "Google로 로그인",
    apple: "Apple로 로그인",
    success: "로그인 성공. 대시보드로 이동합니다.",
    processing: "연결 중...",
    wrongCredentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
    tooMany: "시도 횟수가 너무 많습니다. 나중에 다시 시도해 주세요.",
    loginFailed: "로그인할 수 없습니다. 다시 시도해 주세요.",
    googleUnavailable: "Google 로그인을 현재 사용할 수 없습니다. 이메일과 비밀번호를 사용해 주세요.",
    appleUnavailable: "Apple 로그인을 현재 사용할 수 없습니다. 이메일과 비밀번호를 사용해 주세요.",
    googleFailed: "Google 로그인에 실패했습니다.",
    appleFailed: "Apple 로그인에 실패했습니다.",
  },
  vi: {
    email: "Email",
    password: "Mật khẩu",
    emailPlaceholder: "name@company.com",
    passwordPlaceholder: "Nhập mật khẩu của bạn",
    workspaceHint: "Hãy đăng nhập trước, rồi chọn không gian làm việc bạn muốn mở.",
    signIn: "Đăng nhập",
    or: "Hoặc",
    google: "Tiếp tục với Google",
    apple: "Tiếp tục với Apple",
    success: "Đăng nhập thành công. Đang chuyển đến bảng điều khiển.",
    processing: "Đang kết nối...",
    wrongCredentials: "Email hoặc mật khẩu không chính xác.",
    tooMany: "Quá nhiều lần thử. Vui lòng thử lại sau.",
    loginFailed: "Không thể đăng nhập. Vui lòng thử lại.",
    googleUnavailable: "Đăng nhập Google hiện không khả dụng. Vui lòng dùng email và mật khẩu.",
    appleUnavailable: "Đăng nhập Apple hiện không khả dụng. Vui lòng dùng email và mật khẩu.",
    googleFailed: "Đăng nhập Google thất bại.",
    appleFailed: "Đăng nhập Apple thất bại.",
  },
  es: {
    email: "Correo electrónico",
    password: "Contraseña",
    emailPlaceholder: "nombre@empresa.com",
    passwordPlaceholder: "Ingresa tu contraseña",
    workspaceHint: "Primero inicia sesión y luego elige el espacio de trabajo que quieres abrir.",
    signIn: "Iniciar sesión",
    or: "O",
    google: "Continuar con Google",
    apple: "Continuar con Apple",
    success: "Sesión iniciada correctamente. Redirigiendo al panel.",
    processing: "Conectando...",
    wrongCredentials: "Tu correo o contraseña es incorrecto.",
    tooMany: "Demasiados intentos. Por favor, inténtalo más tarde.",
    loginFailed: "No se pudo iniciar sesión. Por favor, inténtalo de nuevo.",
    googleUnavailable: "El inicio de sesión con Google no está disponible. Por favor, usa correo y contraseña.",
    appleUnavailable: "El inicio de sesión con Apple no está disponible. Por favor, usa correo y contraseña.",
    googleFailed: "Error al iniciar sesión con Google.",
    appleFailed: "Error al iniciar sesión con Apple.",
  },
  fr: {
    email: "E-mail",
    password: "Mot de passe",
    emailPlaceholder: "nom@entreprise.com",
    passwordPlaceholder: "Entrez votre mot de passe",
    workspaceHint: "Connectez-vous d'abord, puis choisissez l'espace de travail à ouvrir.",
    signIn: "Se connecter",
    or: "Ou",
    google: "Continuer avec Google",
    apple: "Continuer avec Apple",
    success: "Connexion réussie. Redirection vers le tableau de bord.",
    processing: "Connexion en cours...",
    wrongCredentials: "Votre e-mail ou mot de passe est incorrect.",
    tooMany: "Trop de tentatives. Veuillez réessayer plus tard.",
    loginFailed: "Impossible de se connecter. Veuillez réessayer.",
    googleUnavailable: "La connexion Google n'est pas disponible. Veuillez utiliser e-mail et mot de passe.",
    appleUnavailable: "La connexion Apple n'est pas disponible. Veuillez utiliser e-mail et mot de passe.",
    googleFailed: "Échec de la connexion Google.",
    appleFailed: "Échec de la connexion Apple.",
  },
  de: {
    email: "E-Mail",
    password: "Passwort",
    emailPlaceholder: "name@unternehmen.com",
    passwordPlaceholder: "Passwort eingeben",
    workspaceHint: "Melden Sie sich zuerst an und wählen Sie dann den gewünschten Arbeitsbereich.",
    signIn: "Anmelden",
    or: "Oder",
    google: "Mit Google fortfahren",
    apple: "Mit Apple fortfahren",
    success: "Erfolgreich angemeldet. Weiterleitung zum Dashboard.",
    processing: "Verbindung wird hergestellt...",
    wrongCredentials: "Ihre E-Mail oder Ihr Passwort ist falsch.",
    tooMany: "Zu viele Versuche. Bitte versuchen Sie es später erneut.",
    loginFailed: "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    googleUnavailable: "Google-Anmeldung ist derzeit nicht verfügbar. Bitte verwenden Sie E-Mail und Passwort.",
    appleUnavailable: "Apple-Anmeldung ist derzeit nicht verfügbar. Bitte verwenden Sie E-Mail und Passwort.",
    googleFailed: "Google-Anmeldung fehlgeschlagen.",
    appleFailed: "Apple-Anmeldung fehlgeschlagen.",
  },
} as const

export default function LoginForm({
  defaultEmail = "",
  defaultPassword = "",
  selectedMode = "personal",
  nextPath,
  lang = "en",
}: {
  defaultEmail?: string
  defaultPassword?: string
  selectedMode?: LoginWorkspaceMode
  nextPath?: string
  lang?: SiteLang
}) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const copy = (COPY as unknown as Record<string, typeof COPY.en>)[lang] ?? COPY.en

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail, password: defaultPassword, remember: false },
  })

  useEffect(() => {
    reset({ email: defaultEmail, password: defaultPassword, remember: false })
  }, [defaultEmail, defaultPassword, reset])

  const onSubmit = async (data: LoginInput) => {
    setServerError(null)
    try {
      const json = await loginDirect(data.email.trim(), data.password, selectedMode, nextPath)
      setSuccess(true)
      router.replace(json.redirectTo || "/workspace/select")
      router.refresh()
    } catch (error: any) {
      const message = String(error?.message || "")
      const code = error?.code || ""
      if (
        code.includes("auth/invalid-credential") ||
        code.includes("auth/wrong-password") ||
        code.includes("auth/user-not-found") ||
        message.includes("Password ไม่ถูกต้อง") ||
        message.includes("Email หรือ Password ไม่ถูกต้อง")
      ) {
        setServerError(copy.wrongCredentials)
      } else if (code.includes("auth/too-many-requests") || message.includes("พยายามเข้าสู่ระบบบ่อยเกินไป")) {
        setServerError(copy.tooMany)
      } else {
        setServerError(message || copy.loginFailed)
      }
    }
  }

  const handleGoogle = async () => {
    if (!FIREBASE_CONFIGURED) {
      setServerError(copy.googleUnavailable)
      return
    }
    setGoogleLoading(true)
    setServerError(null)
    try {
      const json = await loginGoogle(selectedMode, nextPath)
      setSuccess(true)
      router.replace(json.redirectTo || "/workspace/select")
      router.refresh()
    } catch (error: any) {
      const code = error?.code || ""
      if (code !== "auth/popup-closed-by-user") {
        setServerError(error?.message || copy.googleFailed)
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleApple = async () => {
    if (!FIREBASE_CONFIGURED) {
      setServerError(copy.appleUnavailable)
      return
    }
    setAppleLoading(true)
    setServerError(null)
    try {
      const json = await loginApple(selectedMode, nextPath)
      setSuccess(true)
      router.replace(json.redirectTo || "/workspace/select")
      router.refresh()
    } catch (error: any) {
      const code = error?.code || ""
      if (code !== "auth/popup-closed-by-user") {
        setServerError(error?.message || copy.appleFailed)
      }
    } finally {
      setAppleLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {serverError && (
        <div className="rounded-2xl border p-3" style={{ background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.2)" }}>
          <div className="flex items-start gap-2 text-sm" style={{ color: "#f87171" }}>
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-2xl px-4 py-3 text-center text-sm font-semibold" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
          {copy.success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label={copy.email}
              type="email"
              icon={<Mail size={16} />}
              placeholder={copy.emailPlaceholder}
              error={errors.email?.message}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              {...register("email")}
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label={copy.password}
              type="password"
              icon={<Lock size={16} />}
              placeholder={copy.passwordPlaceholder}
              error={errors.password?.message}
              autoComplete="current-password"
              {...register("password")}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-2)_78%,transparent)] px-4 py-3 text-xs text-[var(--text-3)]">
          <div className="inline-flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--primary)]" />
            <span>{copy.workspaceHint}</span>
          </div>
          <span className="hidden font-semibold uppercase text-[var(--text-2)] sm:inline">{selectedMode === "merchant" ? "Shop" : selectedMode === "business" ? "Cloud" : "Local Only"}</span>
        </div>

        <Button type="submit" size="lg" loading={isSubmitting} disabled={isSubmitting || success} className="w-full" icon={<ArrowRight size={16} />} iconPosition="right">
          {copy.signIn}
        </Button>
      </form>

      <div className="relative flex items-center gap-3 pt-1 text-xs text-[var(--text-3)]">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span>{copy.or}</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <button onClick={handleGoogle} disabled={googleLoading || appleLoading || isSubmitting} className="auth-social-btn">
        {googleLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.2 1.66l3.15-3.15C17.45 1.59 14.97.5 12 .5 7.7.5 3.99 2.97 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {googleLoading ? copy.processing : copy.google}
      </button>

      <button onClick={handleApple} disabled={appleLoading || googleLoading || isSubmitting} className="auth-social-btn">
        {appleLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <AppleIcon />}
        {appleLoading ? copy.processing : copy.apple}
      </button>
    </div>
  )
}
