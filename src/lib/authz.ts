import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { forbidden, unauthorized } from "@/lib/api-response";
import { getCurrentSession } from "@/lib/session";
import { resolvePersonalPlan, type PlanKey } from "@/lib/stripe";

export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session?.sub) return null;
  return prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true, name: true, email: true, role: true, plan: true, accountMode: true,
      image: true, emailVerified: true, provider: true,
      country: true, currency: true, locale: true, timezone: true,
      tosAcceptedAt: true, tosVersion: true, privacyAcceptedAt: true, privacyVersion: true,
      stripeCustomerId: true,
      uiPreferences: true,
      productSubscriptions: {
        select: { product: true, planTier: true, status: true, currentPeriodEnd: true },
      },
    },
  });
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>

function getModeHome(mode: "personal" | "business" | "merchant") {
  switch (mode) {
    case "business":
      return "/business";
    case "merchant":
      return "/merchant";
    case "personal":
    default:
      return "/dashboard";
  }
}

export function hasProductAccess(user: CurrentUser, product: "personal" | "business" | "merchant"): boolean {
  // Free tiers exist for every workspace mode.
  // Route-level access should be enforced by mode lock first,
  // while paid limits are enforced separately per feature.
  if (user.role === "admin") return true
  if (user.accountMode !== product) return false
  return true
}

export function hasPro(user: Pick<CurrentUser, "plan" | "productSubscriptions">): boolean {
  if (user.plan === "pro" || user.plan === "family") return true;
  return user.productSubscriptions.some(s => s.status === "active" && ["pro", "family", "starter", "growth", "scale", "sme", "enterprise"].includes(s.planTier));
}

export function hasAIAdvisor(user: Pick<CurrentUser, "plan" | "productSubscriptions">): boolean {
  return hasPro(user) || user.productSubscriptions.some(s => s.planTier === "ai_advisor" && s.status === "active");
}

export function getProductPlan(user: CurrentUser, product: "business" | "merchant"): string {
  const sub = user.productSubscriptions.find(s => s.product === product && s.status === "active");
  return sub?.planTier ?? "free";
}

export function getPersonalPlan(user: Pick<CurrentUser, "plan" | "productSubscriptions">): PlanKey {
  const sub = user.productSubscriptions.find((s) => s.product === "personal" && s.status === "active")
  return resolvePersonalPlan(sub?.planTier ?? user.plan)
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRolePage(role: "admin") {
  const user = await requireUser();
  if (user.role !== role) redirect("/dashboard");
  return user;
}

export async function requireModePage(mode: "personal" | "business" | "merchant") {
  const user = await requireUser()
  if (user.role === "admin") return user
  if (user.accountMode !== mode) redirect(getModeHome(user.accountMode ?? "personal"))
  return user
}

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) return { error: unauthorized() } as const;
  return { user } as const;
}

export async function requireApiRole(role: "admin") {
  const user = await getCurrentUser();
  if (!user) return { error: unauthorized() } as const;
  if (user.role !== role) return { error: forbidden() } as const;
  return { user } as const;
}

export async function getOrgMembership(userId: string, orgId: string) {
  return prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId } },
  });
}

export async function requireOrgAccess(userId: string, orgId: string) {
  const org = await prisma.organization.findFirst({
    where: { id: orgId },
    select: { id: true, ownerId: true },
  });
  if (!org) return null;
  if (org.ownerId === userId) return { role: "owner" as const, org };
  const member = await getOrgMembership(userId, orgId);
  if (!member) return null;
  return { role: member.role, org };
}

export function canWrite(role: string) {
  return ["owner", "admin", "manager", "accountant"].includes(role);
}

// v3.1: Mode-lock enforcement helpers
// Use these in API routes that serve a specific mode to ensure the caller's account matches

export async function requireModeUser(mode: "personal" | "business" | "merchant") {
  const user = await getCurrentUser()
  if (!user) return { error: unauthorized() } as const
  if (user.role === "admin") return { user } as const
  if (user.accountMode !== mode) {
    return { error: new Response(
      JSON.stringify({ error: `บัญชีนี้ถูกล็อกเป็นโหมด ${user.accountMode} — ไม่สามารถเข้าถึงฟีเจอร์ ${mode} ได้` }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    )} as const
  }
  return { user } as const
}


export async function getUserUiPreferences() {
  const user = await getCurrentUser();
  return user?.uiPreferences ?? null;
}
