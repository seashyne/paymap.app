export const dynamic = "force-dynamic"
// v2.0: PromptPay QR payload generator — requires auth
import { NextRequest, NextResponse } from "next/server";
import { buildPromptPayPayload, buildPromptPayQrUrl, normalizeTarget } from "@/lib/promptpay";
import { requireModeUser } from "@/lib/authz";

export async function GET(req: NextRequest) {
  const auth = await requireModeUser("personal");
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const id     = searchParams.get("id")?.trim();
  const amount = searchParams.get("amount") ? Number(searchParams.get("amount")) : undefined;

  if (!id) {
    return NextResponse.json({ error: "กรุณาระบุ id (เบอร์โทร / เลขบัตร / e-Wallet)" }, { status: 400 });
  }
  if (amount !== undefined && (isNaN(amount) || amount < 0 || amount > 9_999_999)) {
    return NextResponse.json({ error: "จำนวนเงินไม่ถูกต้อง (0 – 9,999,999 บาท)" }, { status: 400 });
  }

  try {
    const payload = buildPromptPayPayload(id, amount);
    const { type } = normalizeTarget(id);
    return NextResponse.json({
      payload,
      type,
      target: id,
      amount: amount ?? null,
      qrUrl: buildPromptPayQrUrl(payload),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "สร้าง QR ไม่สำเร็จ" }, { status: 400 });
  }
}
