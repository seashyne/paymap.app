import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    error: "โปรเจกต์นี้ย้ายไปใช้ Firebase Auth แล้ว",
  }, { status: 410 });
}

export const POST = GET;
