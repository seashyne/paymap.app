export type RuntimeServiceKey =
  | "database"
  | "auth"
  | "firebase"
  | "stripe"
  | "email"
  | "storage"
  | "ai"
  | "redis"

export type RuntimeServiceStatus = {
  key: RuntimeServiceKey
  label: string
  configured: boolean
  severity: "required" | "optional"
  note: string
}

export function getRuntimeServicesStatus(): RuntimeServiceStatus[] {
  const hasDatabase = Boolean(process.env.DATABASE_URL)
  const hasAuthSecret = Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)
  const hasFirebase = Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )
  const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET)
  const hasEmail = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
  const hasStorage = Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      (process.env.R2_BUCKET_NAME || process.env.R2_BUCKET)
  )
  const hasAi = Boolean(process.env.ANTHROPIC_API_KEY)
  const hasRedis = Boolean(process.env.REDIS_URL)

  return [
    {
      key: "database",
      label: "Database / Prisma",
      configured: hasDatabase,
      severity: "required",
      note: "จำเป็นสำหรับข้อมูลผู้ใช้ ธุรกรรม รายงาน และ workspace ทั้งระบบ",
    },
    {
      key: "auth",
      label: "Session / Auth Secret",
      configured: hasAuthSecret,
      severity: "required",
      note: "ถ้าไม่มี secret ระบบ session และการล็อกอิน production จะไม่ปลอดภัย",
    },
    {
      key: "firebase",
      label: "Firebase Login",
      configured: hasFirebase,
      severity: "optional",
      note: "จำเป็นเฉพาะกรณีใช้ Google/Firebase sign-in และ firebase session route",
    },
    {
      key: "stripe",
      label: "Stripe Billing",
      configured: hasStripe,
      severity: "optional",
      note: "จำเป็นสำหรับ checkout, portal, webhook และ subscription sync",
    },
    {
      key: "email",
      label: "Email / Resend",
      configured: hasEmail,
      severity: "optional",
      note: "จำเป็นสำหรับ verify email, forgot password และ billing notice",
    },
    {
      key: "storage",
      label: "Cloudflare R2 Upload",
      configured: hasStorage,
      severity: "optional",
      note: "จำเป็นสำหรับอัปโหลดรูปสินค้า รูปโปรไฟล์ และ asset บางส่วน",
    },
    {
      key: "ai",
      label: "AI Advisor",
      configured: hasAi,
      severity: "optional",
      note: "จำเป็นสำหรับ AI advisor / assistant routes เท่านั้น",
    },
    {
      key: "redis",
      label: "Redis / Rate limit",
      configured: hasRedis,
      severity: "optional",
      note: "ช่วยให้ rate limit, cache และ cron บางส่วนเสถียรกว่า fallback memory",
    },
  ]
}

export function getRuntimeSummary(services: RuntimeServiceStatus[]) {
  const requiredMissing = services.filter((service) => service.severity === "required" && !service.configured)
  const optionalMissing = services.filter((service) => service.severity === "optional" && !service.configured)

  return {
    requiredMissing,
    optionalMissing,
    productionReadyCore: requiredMissing.length === 0,
  }
}
