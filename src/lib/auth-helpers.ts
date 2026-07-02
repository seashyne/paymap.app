import bcrypt from "bcryptjs"
import crypto from "crypto"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { checkRateLimit as checkDistributedRateLimit } from "@/lib/rate-limit"

export async function hashPassword(p: string) {
  return bcrypt.hash(p, 12)
}

export async function verifyPassword(p: string, h: string) {
  return bcrypt.compare(p, h)
}

export function checkPasswordStrength(password: string) {
  const errors: string[] = []
  if (password.length < 8) errors.push("อย่างน้อย 8 ตัวอักษร")
  if (!/[A-Z]/.test(password)) errors.push("ตัวพิมพ์ใหญ่ (A–Z)")
  if (!/[0-9]/.test(password)) errors.push("ตัวเลข (0–9)")
  return { valid: errors.length === 0, errors }
}

export function generateSecureToken() {
  return crypto.randomBytes(32).toString("hex")
}

export async function createEmailVerificationToken(userId: string) {
  await prisma.token.deleteMany({
    where: { userId, type: "email_verification", usedAt: null },
  })

  const token = generateSecureToken()

  await prisma.token.create({
    data: {
      userId,
      token,
      type: "email_verification",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  return token
}

export async function createPasswordResetToken(userId: string) {
  await prisma.token.deleteMany({
    where: { userId, type: "password_reset", usedAt: null },
  })

  const token = generateSecureToken()

  await prisma.token.create({
    data: {
      userId,
      token,
      type: "password_reset",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  })

  return token
}

export async function validateToken(
  token: string,
  type: "email_verification" | "password_reset"
) {
  const record = await prisma.token.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!record) return { error: "Token ไม่ถูกต้อง" }
  if (record.type !== type) return { error: "Token ประเภทไม่ถูกต้อง" }
  if (record.usedAt) return { error: "Token ถูกใช้ไปแล้ว" }
  if (record.expiresAt < new Date()) return { error: "Token หมดอายุแล้ว" }

  return { record, user: record.user }
}

export async function consumeToken(tokenId: string) {
  await prisma.token.update({
    where: { id: tokenId },
    data: { usedAt: new Date() },
  })
}

export async function createAuditLog(
  userId: string,
  action: string,
  req?: Request,
  metadata?: Record<string, unknown> | string | number | boolean | null
) {
  try {
    const ip = req?.headers.get("x-forwarded-for") ?? null
    const userAgent = req?.headers.get("user-agent") ?? null

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ip,
        userAgent,
        metadata: (metadata ?? undefined) as any,
      },
    })
  } catch (e) {
    console.error("[AuditLog]", e)
  }
}

// ── Real email via Resend (falls back to console.log in dev) ─────────────────
async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log("📧 [EMAIL DEV]", { to, subject })
    return
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "payMap <noreply@paymap.app>",
      to,
      subject,
      html,
    }),
  })

  if (!res.ok) throw new Error(await res.text())
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const url = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`

  await sendEmail(
    email,
    "ยืนยัน Email ของคุณ — payMap",
    `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
      <h2 style="color:#f5a623">payMap</h2>
      <p>สวัสดี ${name},</p>
      <p>กรุณากดปุ่มด้านล่างเพื่อยืนยัน Email</p>
      <a href="${url}" style="display:inline-block;background:#f5a623;color:#000;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0">ยืนยัน Email</a>
      <p style="color:#888;font-size:12px">ลิงก์หมดอายุใน 24 ชั่วโมง</p>
    </div>`
  )
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const url = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  await sendEmail(
    email,
    "รีเซ็ต Password — payMap",
    `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
      <h2 style="color:#f5a623">payMap</h2>
      <p>สวัสดี ${name},</p>
      <a href="${url}" style="display:inline-block;background:#f5a623;color:#000;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0">รีเซ็ต Password</a>
      <p style="color:#888;font-size:12px">ลิงก์หมดอายุใน 1 ชั่วโมง</p>
    </div>`
  )
}

export async function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
) {
  return checkDistributedRateLimit(key, maxAttempts, windowMs)
}