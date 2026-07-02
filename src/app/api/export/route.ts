export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPersonalPlan, requireApiUser, requireOrgAccess } from "@/lib/authz";
import { PLAN_LIMITS } from "@/lib/stripe";

function sanitizeCsvCell(value: string | number | null | undefined) {
  const raw = String(value ?? "");
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return safe.includes(",") || safe.includes('"') || safe.includes("\n")
    ? `"${safe.replace(/"/g, '""')}"`
    : safe;
}

function csvRow(values: (string | number | null | undefined)[]) {
  return values.map(sanitizeCsvCell).join(",");
}

function buildCsv(headers: string[], rows: (string | number | null | undefined)[][]) {
  return [csvRow(headers), ...rows.map(csvRow)].join("\n");
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiUser();
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "transactions";
    const format = searchParams.get("format") ?? "csv";
    const orgId = searchParams.get("orgId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (type === "transactions") {
      const plan = getPersonalPlan(auth.user);
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const exportCount = await prisma.auditLog.count({
        where: {
          userId: auth.user.id,
          action: "export_transactions",
          createdAt: { gte: monthStart },
        },
      });

      const limit = PLAN_LIMITS[plan].exportPerMonth;
      if (exportCount >= limit) {
        return NextResponse.json(
          { error: `แพลน ${plan} export ได้ ${limit} ครั้งต่อเดือน` },
          { status: 429 }
        );
      }
    }

    const dateFilter =
      from || to
        ? {
            happenedAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
            },
          }
        : {};

    let csv = "";
    let json: any[] = [];
    const filename = `paymap-${type}-${new Date().toISOString().split("T")[0]}`;

    if (type === "transactions") {
      const txs = await prisma.transaction.findMany({
        where: { userId: auth.user.id, deletedAt: null, ...dateFilter },  // v1.9
        include: { category: { select: { name: true } } },
        orderBy: { happenedAt: "desc" },
        take: 5000,
      });

      const headers = ["วันที่", "ประเภท", "หมวดหมู่", "จำนวนเงิน", "สกุลเงิน", "หมายเหตุ"];
      const rows = txs.map((t) => [
        new Date(t.happenedAt).toLocaleDateString("th-TH"),
        t.type === "income" ? "รายรับ" : "รายจ่าย",
        t.category?.name ?? "",
        Number(t.amount),
        t.currency,
        t.note ?? "",
      ]);

      csv = buildCsv(headers, rows);
      json = txs.map((t) => ({
        date: t.happenedAt,
        type: t.type,
        category: t.category?.name ?? null,
        amount: Number(t.amount),
        currency: t.currency,
        note: t.note ?? null,
      }));

      await prisma.auditLog.create({
        data: {
          userId: auth.user.id,
          action: "export_transactions",
          metadata: { format, count: txs.length },
        },
      });
    } else if (type === "employees" && orgId) {
      const access = await requireOrgAccess(auth.user.id, orgId);
      if (!access) {
        return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
      }

      const employees = await prisma.employee.findMany({
        where: { organizationId: orgId, deletedAt: null },
        orderBy: [{ status: "asc" }, { name: "asc" }],
      });

      const headers = [
        "รหัสพนักงาน",
        "ชื่อ",
        "ตำแหน่ง",
        "แผนก",
        "ประเภท",
        "สถานะ",
        "วันเริ่มงาน",
        "เงินเดือน",
        "อีเมล",
        "โทรศัพท์",
      ];

      const rows = employees.map((e) => [
        e.employeeCode ?? "",
        e.name,
        e.position ?? "",
        e.department ?? "",
        e.employmentType,
        e.status,
        new Date(e.startDate).toLocaleDateString("th-TH"),
        Number(e.baseSalary),
        e.email ?? "",
        e.phone ?? "",
      ]);

      csv = buildCsv(headers, rows);
      json = employees.map((e) => ({
        ...e,
        baseSalary: Number(e.baseSalary),
      }));
    } else {
      return NextResponse.json({ error: "ไม่รองรับ type นี้" }, { status: 400 });
    }

    if (format === "json") {
      return NextResponse.json({ type, items: json });
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=${filename}.csv`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Export failed" },
      { status: 500 }
    );
  }
}