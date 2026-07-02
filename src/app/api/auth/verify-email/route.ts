// src/app/api/auth/verify-email/route.ts
// ─── Email Verification API ────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateToken, consumeToken } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing-token", req.url));
  }

  try {
    // 1. Validate token
    const result = await validateToken(token, "email_verification");
    if ("error" in result) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(result.error ?? "Unknown error")}`, req.url)
      );
    }

    // 2. อัปเดต emailVerified ใน DB
    await prisma.user.update({
      where: { id: result.user.id },
      data:  { emailVerified: new Date() },
    });

    // 3. Mark token ว่าใช้แล้ว
    await consumeToken(result.record.id);

    // 4. Redirect ไปหน้า login พร้อม success message
    return NextResponse.redirect(
      new URL("/login?verified=1", req.url)
    );

  } catch (err) {
    console.error("[Verify Email] Error:", err);
    return NextResponse.redirect(new URL("/login?error=verify-failed", req.url));
  }
}
