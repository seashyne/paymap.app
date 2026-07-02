// v1.4: Business reports (payroll-first safe version)

export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModeUser, requireOrgAccess } from "@/lib/authz";
import { ok, handleError, forbidden } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireModeUser("business");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) return ok({});

    const access = await requireOrgAccess(auth.user.id, orgId);
    if (!access) return forbidden();

    const now = new Date();
    const year = Number(searchParams.get("year") ?? now.getFullYear());

    const payroll = await prisma.payrollRun.aggregate({
      where: {
        organizationId: orgId,
        year,
      },
      _sum: {
        totalGross: true,
        totalNet: true,
        totalWht: true,
        totalSso: true,
      },
      _count: {
        id: true,
      },
    });

    const monthlyPayroll = await prisma.payrollRun.groupBy({
      by: ["month"],
      where: {
        organizationId: orgId,
        year,
      },
      _sum: {
        totalGross: true,
        totalNet: true,
        totalWht: true,
        totalSso: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        month: "asc",
      },
    });

    return ok({
      year,
      sales: {
        total: 0,
        count: 0,
      },
      expenses: {
        total: 0,
        count: 0,
      },
      payroll: {
        totalGross: Number(payroll._sum.totalGross ?? 0),
        totalNet: Number(payroll._sum.totalNet ?? 0),
        totalWht: Number(payroll._sum.totalWht ?? 0),
        totalSso: Number(payroll._sum.totalSso ?? 0),
        runs: payroll._count.id,
      },
      monthly: {
        sales: [],
        expenses: [],
        payroll: monthlyPayroll.map((m) => ({
          month: m.month,
          totalGross: Number(m._sum.totalGross ?? 0),
          totalNet: Number(m._sum.totalNet ?? 0),
          totalWht: Number(m._sum.totalWht ?? 0),
          totalSso: Number(m._sum.totalSso ?? 0),
          runs: m._count.id,
        })),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
