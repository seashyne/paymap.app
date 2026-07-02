import { NextRequest, NextResponse } from "next/server"
import { normalizeLang } from "@/lib/i18n/site"

export async function GET(req: NextRequest) {
  const lang = normalizeLang(req.nextUrl.searchParams.get("lang")) || "en"
  const returnTo = req.nextUrl.searchParams.get("returnTo") || "/"
  const safeReturnTo = returnTo.startsWith("/") ? returnTo : "/"
  const res = NextResponse.redirect(new URL(safeReturnTo, req.url))
  res.cookies.set("paymap-lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })
  return res
}
