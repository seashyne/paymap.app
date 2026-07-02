// src/app/api/auth/reset-password/route.ts
// ─── Reset Password API ────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validateToken, consumeToken, createAuditLog } from "@/lib/auth-helpers";
import { z } from "zod";

const resetSchema = z.object({
  token:    z.string().min(1),
  password: z.string()
    .min(8, "Password ต้องมีอย่างน้อย 8 ตัวอักษร")
    .regex(/[A-Z]/, "ต้องมีตัวพิมพ์ใหญ่")
    .regex(/[0-9]/, "ต้องมีตัวเลข"),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // 1. Validate reset token
    const result = await validateToken(token, "password_reset");
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // 2. Hash password ใหม่
    const passwordHash = await hashPassword(password);

    // 3. อัปเดต password ใน DB
    await prisma.user.update({
      where: { id: result.user.id },
      data:  { passwordHash },
    });

    // 4. Mark token ว่าใช้แล้ว
    await consumeToken(result.record.id);

    // 5. Audit log
    await createAuditLog(result.user.id, "password_reset");

    return NextResponse.json({ message: "ตั้ง Password ใหม่สำเร็จ" });

  } catch (err) {
    console.error("[Reset Password] Error:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
