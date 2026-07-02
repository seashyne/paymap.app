import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken, sendPasswordResetEmail, checkRateLimit } from "@/lib/auth-helpers";
import { forgotSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const rl = await checkRateLimit(`forgot:${ip}`, 3, 60 * 60 * 1000);

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "ลองใหม่ได้ใน 1 ชั่วโมง" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
      },
    });

    if (user && user.provider === "credentials") {
      const token = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail(user.email, user.name, token);
    }

    return NextResponse.json({
      message: "ถ้า Email นี้มีอยู่ในระบบ เราจะส่งลิงก์ตั้ง Password ใหม่ให้",
    });
  } catch (err) {
    console.error("[Forgot Password] Error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}