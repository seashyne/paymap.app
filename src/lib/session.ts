import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "paymap_session";
const ONE_DAY = 60 * 60 * 24;
export const SESSION_MAX_AGE_DAYS = 30;
export const SESSION_RENEW_THRESHOLD_DAYS = 7;

export type AccountMode = "personal" | "business" | "merchant";

export function normalizeAccountMode(mode?: string | null): AccountMode {
  return mode === "business" || mode === "merchant" ? mode : "personal";
}

function getSessionSecret() {
  const raw = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
  if (process.env.NODE_ENV === "production" && !raw) {
    throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is required in production");
  }
  return new TextEncoder().encode(raw || "dev-secret-change-me");
}

export type AppSession = {
  sub: string;
  email: string;
  name: string;
  role: "user" | "admin";
  plan: "free" | "pro" | "family";
  subscriptions?: string[];
  emailVerified: boolean;
  picture?: string | null;
  provider?: string;
  country?: string;
  currency?: string;
  locale?: string;
  timezone?: string;
  accountMode: AccountMode;
  /** @deprecated v3.1: use accountMode instead — kept for backward-compat with existing JWTs */
  workspaceMode?: AccountMode;
  isDemo?: boolean;
  activeOrgId?: string;
  exp?: number;
};

export async function signSession(payload: AppSession, maxAgeDays = SESSION_MAX_AGE_DAYS) {
  const accountMode = normalizeAccountMode(payload.accountMode || payload.workspaceMode);
  return new SignJWT({ ...payload, accountMode, workspaceMode: accountMode } as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeDays}d`)
    .sign(getSessionSecret());
}

export async function verifySession(token?: string | null): Promise<AppSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const accountMode = normalizeAccountMode((payload as any).accountMode || (payload as any).workspaceMode);
    return {
      sub:           String(payload.sub),
      email:         String(payload.email || ""),
      name:          String(payload.name || ""),
      role:          (payload.role as AppSession["role"]) || "user",
      plan:          (payload.plan as AppSession["plan"]) || "free",
      subscriptions: Array.isArray(payload.subscriptions) ? (payload.subscriptions as string[]) : [],
      emailVerified: Boolean(payload.emailVerified),
      picture:       payload.picture ? String(payload.picture) : null,
      provider:      payload.provider ? String(payload.provider) : undefined,
      country:       payload.country  ? String(payload.country)  : "TH",
      currency:      payload.currency ? String(payload.currency) : "THB",
      locale:        payload.locale   ? String(payload.locale)   : "th-TH",
      timezone:      payload.timezone ? String(payload.timezone) : "Asia/Bangkok",
      accountMode,
      workspaceMode: accountMode,
      isDemo:        Boolean(payload.isDemo),
      activeOrgId:   payload.activeOrgId ? String(payload.activeOrgId) : undefined,
      exp:           typeof payload.exp === "number" ? payload.exp : undefined,
    };
  } catch {
    return null;
  }
}

export function shouldRenewSession(session: AppSession): boolean {
  if (!session.exp) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  const secsLeft = session.exp - nowSec;
  return secsLeft < SESSION_RENEW_THRESHOLD_DAYS * ONE_DAY;
}

export async function getCurrentSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export function getSessionCookieName() { return SESSION_COOKIE; }

export function getSessionCookieOptions(maxAgeDays = SESSION_MAX_AGE_DAYS) {
  const isProduction = process.env.NODE_ENV === "production"
  return {
    name: SESSION_COOKIE,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      // secure:true requires HTTPS — on localhost this would silently drop the cookie
      secure: isProduction,
      path: "/",
      maxAge: maxAgeDays * ONE_DAY,
    },
  };
}

// Debug helper — returns cookie state for /api/auth/debug endpoint
export async function getSessionDebugInfo() {
  try {
    const { cookies } = await import("next/headers")
    const cookieStore = cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return { hasCookie: false, valid: false }
    const session = await verifySession(token)
    if (!session) return { hasCookie: true, valid: false, reason: "JWT verify failed" }
    const now = Math.floor(Date.now() / 1000)
    return {
      hasCookie: true,
      valid: true,
      accountMode: session.accountMode,
      email: session.email,
      expiresAt: session.exp ? new Date(session.exp * 1000).toISOString() : null,
      expiresInDays: session.exp ? Math.round((session.exp - now) / 86400) : null,
    }
  } catch {
    return { hasCookie: false, valid: false, reason: "exception" }
  }
}
