import type { NextRequest } from "next/server"
import { prisma } from "@/server/db/prisma"
import { verifyPassword, hashPassword, createAuditLog, checkRateLimit, createEmailVerificationToken } from "@/lib/auth-helpers"
import { ensureDefaultCategories } from "@/lib/bootstrap"
import { sendVerificationEmail } from "@/lib/email"
import { signSession } from "@/server/auth/session"
import { buildWorkspaceSelectPath, inferWorkspaceModeFromPath, resolvePostAuthPath, sanitizeInternalRedirectPath, workspacePath, type WorkspaceMode } from "@/lib/workspace"
import { getModeAwareDefaultPageHref, mergeUiPreferences } from "@/lib/ui-preferences"
import { firebaseAdminAuth, isFirebaseAdminAvailable } from "@/lib/firebase-admin"
import { loginSchema, registerSchema, firebaseSessionSchema, switchWorkspaceSchema } from "@/features/auth/schemas/auth-schemas"
import type { AppSession } from "@/lib/session"
import type { AuthMode, AuthResult } from "@/features/auth/server/types"
import { eventBus } from "@/server/events/event-bus"
import { realtime } from "@/server/realtime/realtime-service"
import { auditLog } from "@/server/audit/audit-service"

function getClientIp(req?: NextRequest | Request) {
  return req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
}

function buildSessionPayload(user: any, overrides?: Partial<AppSession>): AppSession {
  const accountMode = (user.accountMode ?? overrides?.accountMode ?? overrides?.workspaceMode ?? "personal") as WorkspaceMode
  const subscriptions = Array.isArray(user.productSubscriptions)
    ? user.productSubscriptions.map((s: any) => `${s.product}:${s.planTier}`)
    : overrides?.subscriptions ?? []

  return {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role ?? "user",
    plan: user.plan ?? "free",
    subscriptions,
    emailVerified: !!(user.emailVerified || overrides?.emailVerified),
    picture: user.image ?? overrides?.picture ?? null,
    provider: user.provider ?? overrides?.provider ?? "credentials",
    country: user.country ?? overrides?.country ?? "TH",
    currency: user.currency ?? overrides?.currency ?? "THB",
    locale: user.locale ?? overrides?.locale ?? "th-TH",
    timezone: user.timezone ?? overrides?.timezone ?? "Asia/Bangkok",
    accountMode,
    workspaceMode: accountMode,
  }
}

type AuthAccountRecord = {
  id: string
  email: string
  name: string | null
  role: string | null
  plan: string | null
  accountMode: WorkspaceMode
  image: string | null
  provider: string | null
  country: string | null
  currency: string | null
  locale: string | null
  timezone: string | null
  emailVerified: Date | null
  uiPreferences?: unknown
  passwordHash?: string | null
  productSubscriptions: { product: string; planTier: string; status?: string | null }[]
}

async function findAccountsByEmail(email: string) {
  return prisma.user.findMany({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      accountMode: true,
      image: true,
      provider: true,
      country: true,
      currency: true,
      locale: true,
      timezone: true,
      emailVerified: true,
      passwordHash: true,
      uiPreferences: true,
      productSubscriptions: { where: { status: "active" }, select: { product: true, planTier: true, status: true } },
    },
    orderBy: [
      { accountMode: "asc" },
      { createdAt: "asc" },
    ],
  })
}

function pickDefaultAccount(accounts: AuthAccountRecord[]) {
  return (
    accounts.find((account) => account.accountMode === "business") ??
    accounts.find((account) => account.accountMode === "merchant") ??
    accounts.find((account) => account.accountMode === "personal") ??
    accounts[0] ??
    null
  )
}

function chooseTargetAccount(accounts: AuthAccountRecord[], nextPath?: string | null, preferredMode?: WorkspaceMode | null) {
  if (preferredMode) {
    const explicit = accounts.find((account) => account.accountMode === preferredMode)
    if (explicit) return explicit
  }

  const inferredMode = inferWorkspaceModeFromPath(nextPath)
  if (inferredMode) {
    const matched = accounts.find((account) => account.accountMode === inferredMode)
    if (matched) return matched
  }

  return pickDefaultAccount(accounts)
}

function resolveAccountRedirect(account: AuthAccountRecord, accounts: AuthAccountRecord[], nextPath?: string | null) {
  const safeNext = sanitizeInternalRedirectPath(nextPath, "")
  if (accounts.length > 1) {
    const inferredMode = inferWorkspaceModeFromPath(safeNext)
    if (safeNext && inferredMode && inferredMode === account.accountMode) {
      return resolvePostAuthPath(account.accountMode, safeNext)
    }
    return buildWorkspaceSelectPath(safeNext)
  }

  const mergedPrefs = mergeUiPreferences(account.uiPreferences)
  const fallbackPath = getModeAwareDefaultPageHref(mergedPrefs.defaultPage, account.accountMode)
  return safeNext ? resolvePostAuthPath(account.accountMode, safeNext) : fallbackPath
}

export async function loginWithPassword(input: unknown, req?: NextRequest): Promise<AuthResult<{jwt: string; redirectTo: string; user: Record<string, unknown>}>> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return { ok: false, status: 400, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" }

  const ip = getClientIp(req)
  const rl = await checkRateLimit(`login:${ip}`, 10, 60 * 1000)
  if (!rl.allowed) return { ok: false, status: 429, error: "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่", extra: { retryAfter: rl.resetAt } }

  const { email, password, mode, next } = parsed.data
  const normalizedEmail = email.toLowerCase().trim()
  const preferredMode = mode as AuthMode | undefined
  const accounts = await findAccountsByEmail(normalizedEmail)

  if (accounts.length === 0) {
    return { ok: false, status: 401, error: "Email หรือ Password ไม่ถูกต้อง" }
  }

  let authenticatedUser: AuthAccountRecord | null = null
  for (const account of accounts) {
    if (!account.passwordHash) continue
    const valid = await verifyPassword(password, account.passwordHash)
    if (valid) {
      authenticatedUser = account
      break
    }
  }

  if (!authenticatedUser) {
    await createAuditLog(accounts[0]?.id ?? "unknown", "login_failed", req).catch(() => {})
    return { ok: false, status: 401, error: "Email หรือ Password ไม่ถูกต้อง" }
  }

  const targetUser = chooseTargetAccount(accounts, next, preferredMode) ?? authenticatedUser

  await prisma.user.update({ where: { id: authenticatedUser.id }, data: { lastLoginAt: new Date(), loginCount: { increment: 1 } } }).catch(() => {})
  const jwt = await signSession(buildSessionPayload(targetUser))
  const redirectTo = resolveAccountRedirect(targetUser, accounts, next)
  await createAuditLog(authenticatedUser.id, "login", req).catch(() => {})
  eventBus.emit("auth.login", { userId: authenticatedUser.id, workspaceId: targetUser.accountMode, provider: "credentials" })
  realtime.publish(`workspace:${targetUser.accountMode}`, { type: "auth.login", userId: authenticatedUser.id, workspaceId: targetUser.accountMode })
  await auditLog({ actorId: authenticatedUser.id, workspaceId: targetUser.accountMode, action: "auth.login", metadata: { provider: "credentials" } })

  return {
    ok: true,
    data: {
      jwt,
      redirectTo,
      user: { id: targetUser.id, name: targetUser.name, email: targetUser.email, role: targetUser.role, plan: targetUser.plan, accountMode: targetUser.accountMode },
    },
  }
}

export async function registerWithPassword(input: unknown, req?: NextRequest): Promise<AuthResult<{jwt: string; redirectTo: string; message: string; userId: string; accountMode: AuthMode}>> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) return { ok: false, status: 400, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" }

  const ip = getClientIp(req)
  const rl = await checkRateLimit(`register:${ip}`, 3, 60 * 60 * 1000)
  if (!rl.allowed) return { ok: false, status: 429, error: "ลองสมัครใหม่อีกครั้งใน 1 ชั่วโมง" }

  const { name, email, password, mode, next } = parsed.data
  const explicitMode = mode as AuthMode | undefined
  const accountMode = (explicitMode ?? "personal") as AuthMode
  const normalizedEmail = email.toLowerCase().trim()
  const existing = await prisma.user.findFirst({ where: { email: normalizedEmail, accountMode }, select: { id: true, provider: true } })

  if (existing) {
    if (existing.provider === "google") return { ok: false, status: 409, error: "Email นี้เชื่อมกับ Google account กรุณา Login ด้วย Google" }
    if (existing.provider === "apple") return { ok: false, status: 409, error: "Email นี้เชื่อมกับ Apple account กรุณา Login ด้วย Apple" }
    return { ok: false, status: 409, error: `Email นี้มีบัญชีโหมด ${accountMode} อยู่แล้ว กรุณา Login` }
  }

  const passwordHash = await hashPassword(password)
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      provider: "credentials",
      plan: "free",
      role: "user",
      accountMode,
      productSubscriptions: { create: [{ product: accountMode as any, planTier: "free", status: "active" }] },
    },
    include: { productSubscriptions: { where: { status: "active" }, select: { product: true, planTier: true } } },
  })

  await ensureDefaultCategories(newUser.id)
  createEmailVerificationToken(newUser.id)
    .then((token) => sendVerificationEmail(normalizedEmail, name, token))
    .catch((err) => console.error("[register] email failed", err))

  const jwt = await signSession(buildSessionPayload(newUser))
  eventBus.emit("auth.register", { userId: newUser.id, workspaceId: accountMode, provider: "credentials" })
  realtime.publish(`workspace:${accountMode}`, { type: "auth.register", userId: newUser.id, workspaceId: accountMode })
  await auditLog({ actorId: newUser.id, workspaceId: accountMode, action: "auth.register", metadata: { provider: "credentials" } })
  return {
    ok: true,
    data: {
      jwt,
      message: "สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบ Email เพื่อยืนยันบัญชี",
      userId: newUser.id,
      redirectTo: next ? resolvePostAuthPath(accountMode, next) : "/onboarding",
      accountMode,
    },
  }
}

export async function createSessionFromFirebase(input: unknown, req?: NextRequest): Promise<AuthResult<{jwt: string; redirectTo: string; isNewUser: boolean; user: Record<string, unknown>}>> {
  const parsed = firebaseSessionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, status: 400, error: parsed.error.issues[0]?.message ?? "Missing Firebase ID token" }
  if (!isFirebaseAdminAvailable()) return { ok: false, status: 503, error: "Firebase not configured — use /api/auth/login instead" }

  const { idToken, mode, next, name: bodyName, image: bodyImage } = parsed.data
  const decoded = await firebaseAdminAuth.verifyIdToken(idToken, true)
  const email = decoded.email?.toLowerCase().trim()
  if (!email) return { ok: false, status: 400, error: "บัญชีนี้ไม่มีอีเมลที่ใช้งานได้" }

  const rawProvider = decoded.firebase?.sign_in_provider || "password"
  const provider = rawProvider === "google.com" ? "google" : rawProvider === "apple.com" ? "apple" : "credentials"
  const displayName = String(decoded.name || bodyName || email.split("@")[0]).trim()
  const image = (decoded.picture as string | undefined) || bodyImage || null

  let accounts = await findAccountsByEmail(email)
  const preferredMode = (mode as AuthMode | undefined) ?? null
  let user: AuthAccountRecord | null = chooseTargetAccount(accounts, next, preferredMode) ?? null
  let isNewUser = false

  if (!user) {
    const accountMode = (preferredMode ?? "personal") as AuthMode
    const created = await prisma.user.create({
      data: {
        email,
        name: displayName,
        image,
        provider,
        accountMode,
        emailVerified: decoded.email_verified ? new Date() : null,
        productSubscriptions: { create: [{ product: accountMode as any, planTier: "free", status: "active" }] },
      },
    })
    isNewUser = true
    accounts = await findAccountsByEmail(email)
    user = accounts.find((account) => account.id === created.id) ?? null
    if (user) await ensureDefaultCategories(user.id)
  }

  if (!user) return { ok: false, status: 500, error: "สร้างหรือโหลดข้อมูลผู้ใช้ไม่สำเร็จ" }

  const normalizedName = displayName || user.name || email.split("@")[0]
  const normalizedImage = image || user.image || null
  const shouldVerifyEmail = !!decoded.email_verified && !user.emailVerified
  const shouldSyncProfile = user.name !== normalizedName || user.image !== normalizedImage || user.provider !== provider || shouldVerifyEmail

  if (shouldSyncProfile) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name: normalizedName, image: normalizedImage, provider, ...(shouldVerifyEmail ? { emailVerified: new Date() } : {}) },
      include: { productSubscriptions: { where: { status: "active" }, select: { product: true, planTier: true, status: true } } },
    })
  }

  const activeAccounts = isNewUser ? accounts : await findAccountsByEmail(email)
  const targetUser = chooseTargetAccount(activeAccounts, next, preferredMode) ?? user
  const jwt = await signSession(buildSessionPayload(targetUser, { provider, emailVerified: !!(decoded.email_verified || user.emailVerified) }))
  const redirectTo = isNewUser
    ? "/onboarding"
    : resolveAccountRedirect(targetUser, activeAccounts, next)

  await createAuditLog(user.id, isNewUser ? "register" : "login", req, { provider, firebaseUid: decoded.uid, accountMode: targetUser.accountMode } as any).catch(() => {})
  eventBus.emit(isNewUser ? "auth.register" : "auth.login", { userId: user.id, workspaceId: targetUser.accountMode, provider })
  realtime.publish(`workspace:${targetUser.accountMode}`, { type: isNewUser ? "auth.register" : "auth.login", userId: user.id, workspaceId: targetUser.accountMode, provider })
  await auditLog({ actorId: user.id, workspaceId: targetUser.accountMode, action: isNewUser ? "auth.register" : "auth.login", metadata: { provider } })

  return {
    ok: true,
    data: {
      jwt,
      isNewUser,
      redirectTo,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        image: user.image,
        emailVerified: !!user.emailVerified,
        country: user.country,
        currency: user.currency,
        accountMode: targetUser.accountMode,
      },
    },
  }
}

export async function switchWorkspaceAccount(session: AppSession | null, input: unknown): Promise<AuthResult<{jwt: string; redirectTo: string; mode: AuthMode}>> {
  if (!session?.sub || !session.email) return { ok: false, status: 401, error: "Unauthorized" }
  const parsed = switchWorkspaceSchema.safeParse(input)
  if (!parsed.success) return { ok: false, status: 400, error: parsed.error.issues[0]?.message ?? "Invalid mode" }

  const { mode, redirect } = parsed.data
  const safeRedirectTo = sanitizeInternalRedirectPath(redirect, workspacePath(mode)) ?? workspacePath(mode)
  const targetUser = await prisma.user.findFirst({
    where: { email: session.email, accountMode: mode },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      accountMode: true,
      image: true,
      provider: true,
      country: true,
      currency: true,
      locale: true,
      timezone: true,
      emailVerified: true,
      productSubscriptions: { where: { status: "active" }, select: { product: true, planTier: true } },
    },
  })

  if (!targetUser) {
    const nextPath = sanitizeInternalRedirectPath(redirect, "")
    return {
      ok: false,
      status: 404,
      error: `ไม่พบบัญชีโหมด ${mode} สำหรับ email นี้`,
      extra: {
        hint: `สมัครบัญชีโหมด ${mode} ได้ที่ /register?mode=${mode}`,
        needsRegister: true,
        registerUrl: `/register?mode=${mode}${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`,
      },
    }
  }

  const jwt = await signSession(buildSessionPayload(targetUser, {
    emailVerified: session.emailVerified,
    picture: session.picture ?? targetUser.image,
    provider: session.provider ?? targetUser.provider,
    country: session.country ?? targetUser.country ?? "TH",
    currency: session.currency ?? targetUser.currency ?? "THB",
    locale: session.locale ?? targetUser.locale ?? "th-TH",
    timezone: session.timezone ?? targetUser.timezone ?? "Asia/Bangkok",
  }))

  eventBus.emit("workspace.switched", { userId: targetUser.id, workspaceId: mode, fromMode: session.accountMode, toMode: mode })
  realtime.publish(`workspace:${mode}`, { type: "workspace.switched", userId: targetUser.id, workspaceId: mode, fromMode: session.accountMode, toMode: mode })
  await auditLog({ actorId: targetUser.id, workspaceId: mode, action: "workspace.switch", metadata: { fromMode: session.accountMode, toMode: mode } })
  return { ok: true, data: { jwt, redirectTo: safeRedirectTo, mode } }
}
