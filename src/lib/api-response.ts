// src/lib/api-response.ts
// ─────────────────────────────────────────────────────────────────────────────
// Standardized API Response helpers
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { ZodError } from "zod";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  message?: string;
  data?: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

// ── Success Responses ─────────────────────────────────────────────────────────

export function ok<T>(data?: T, message?: string, status = 200) {
  return NextResponse.json<ApiSuccess<T>>(
    { success: true, message, data },
    { status }
  );
}

export function created<T>(data?: T, message = "สร้างสำเร็จ") {
  return ok(data, message, 201);
}

// ── Error Responses ───────────────────────────────────────────────────────────

export function err(
  error: string,
  status = 400,
  code?: string,
  details?: Record<string, string[]>
) {
  return NextResponse.json<ApiError>(
    { success: false, error, code, details },
    { status }
  );
}

export const badRequest   = (msg: string, details?: Record<string, string[]>) => err(msg, 400, "BAD_REQUEST", details);
export const unauthorized = (msg = "กรุณาเข้าสู่ระบบก่อน")                    => err(msg, 401, "UNAUTHORIZED");
export const forbidden    = (msg = "ไม่มีสิทธิ์เข้าถึง")                       => err(msg, 403, "FORBIDDEN");
export const notFound     = (msg = "ไม่พบข้อมูล")                              => err(msg, 404, "NOT_FOUND");
export const conflict     = (msg: string)                                       => err(msg, 409, "CONFLICT");
export const tooMany      = (msg = "ลองใหม่ภายหลัง")                           => err(msg, 429, "TOO_MANY_REQUESTS");
export const serverError  = (msg = "เกิดข้อผิดพลาดภายใน กรุณาลองใหม่")        => err(msg, 500, "INTERNAL_ERROR");

// ── Zod Error Handler ─────────────────────────────────────────────────────────

export function zodError(error: ZodError) {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "root";
    if (!details[key]) details[key] = [];
    details[key].push(issue.message);
  }
  const firstMessage = error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
  return badRequest(firstMessage, details);
}

// ── Generic Error Handler ─────────────────────────────────────────────────────

export function handleError(error: unknown): NextResponse {
  console.error("[API Error]:", error);

  if (error instanceof ZodError) return zodError(error);

  if (error instanceof Error) {
    // Prisma unique constraint
    if ((error as any).code === "P2002") {
      return conflict("ข้อมูลนี้มีอยู่แล้วในระบบ");
    }
    // Prisma not found
    if ((error as any).code === "P2025") {
      return notFound();
    }
  }

  return serverError();
}
