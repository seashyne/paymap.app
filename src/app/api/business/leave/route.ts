// v1.4: Leave requests scoped to org membership
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
// v14: Prisma stub client (no DB at generate time) — define enum locally and cast
const LeaveType = { annual: "annual", sick: "sick", personal: "personal", maternity: "maternity", paternity: "paternity", unpaid: "unpaid" } as const
type LeaveType = (typeof LeaveType)[keyof typeof LeaveType]
import { ok, handleError, forbidden, badRequest } from "@/lib/api-response";
import { requireModeUser, requireOrgAccess, canWrite } from "@/lib/authz";
import { z } from "zod";

const leaveSchema = z.object({
  organizationId: z.string(),
  employeeId: z.string(),
  leaveType: z.nativeEnum(LeaveType).default(LeaveType.annual),
  startDate: z.string().transform((d) => new Date(d)),
  endDate: z.string().transform((d) => new Date(d)),
  days: z.number().positive(),
  reason: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await requireModeUser("business");
    if ("error" in auth) return auth.error;

    const orgId = new URL(req.url).searchParams.get("organizationId");
    if (!orgId) return ok([]);

    const access = await requireOrgAccess(auth.user.id, orgId);
    if (!access) return forbidden();

    const leaves = await prisma.leaveRequest.findMany({
      where: { organizationId: orgId },
      include: {
        employee: {
          select: { name: true, position: true, department: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return ok(leaves);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("business");
    if ("error" in auth) return auth.error;

    const body = await req.json();
    const parsed = leaveSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
    }

    const access = await requireOrgAccess(auth.user.id, parsed.data.organizationId);
    if (!access) return forbidden();
    if (!canWrite(access.role)) return forbidden();

    const leave = await prisma.leaveRequest.create({
      data: {
        ...parsed.data,
        status: "pending",
      } as any,
    });

    return ok(leave);
  } catch (e) {
    return handleError(e);
  }
}
