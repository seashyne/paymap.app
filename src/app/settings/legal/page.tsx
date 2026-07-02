import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/authz"
import AppFrame, { buildPrimaryNav } from "@/components/layout/AppFrame"
import { APP_VERSION, DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { PRIVACY_VERSION, TOS_EFFECTIVE, TOS_VERSION } from "@/lib/tos-content"
import { FileText, History, Lock, ShieldCheck } from "lucide-react"

export const metadata = { title: "Legal Center — PayMap" }

export default async function LegalCenterPage() {
  const user = await requireUser()
  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      plan: true,
      accountMode: true,
      tosAcceptedAt: true,
      tosVersion: true,
      privacyAcceptedAt: true,
      privacyVersion: true,
      auditLogs: {
        where: { action: { in: ["consent_accepted", "login", "logout", "workspace_activate"] } },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { action: true, createdAt: true, ip: true, userAgent: true, metadata: true },
      },
    },
  })
  if (!data) return null

  const nav = buildPrimaryNav("settings")
  const consentRequired = data.tosVersion !== TOS_VERSION || data.privacyVersion !== PRIVACY_VERSION || !data.tosAcceptedAt || !data.privacyAcceptedAt

  return (
    <AppFrame
      brand="payMap"
      icon="🛡️"
      version={`${DASHBOARD_VERSION_LABEL} · Legal Center`}
      title="Legal Center"
      subtitle="Consent governance, public policies, version tracking และ audit trail สำหรับ SaaS production"
      accent="#8b5cf6"
      planLabel={data.plan}
      accountMode={(data.accountMode ?? "personal") as "personal" | "business" | "merchant"}
      nav={nav}
    >
      <div className="space-y-6">
        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,246,.25)] bg-[rgba(139,92,246,.10)] px-3 py-1 text-xs font-bold text-[#a78bfa]">
                <ShieldCheck size={13} /> PayMap v{APP_VERSION}
              </div>
              <h1 className="mt-3 text-3xl font-black">Consent System ระดับ SaaS จริง</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-2)]">
                หน้านี้ใช้เป็นศูนย์ควบคุม policy ของผู้ใช้ใน v5.3 โดยรวม public legal pages, version status,
                audit trail และเส้นทางเข้าถึง Terms/Privacy ล่าสุดให้ตรวจสอบได้จากจุดเดียว
              </p>
            </div>
            <div className={`rounded-2xl px-4 py-3 text-sm font-bold ${consentRequired ? "bg-[rgba(245,158,11,.10)] text-[var(--amber)]" : "bg-[rgba(34,197,94,.10)] text-[var(--green)]"}`}>
              {consentRequired ? "Consent update required" : "Consent compliant"}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><FileText size={15} /> Terms of Service</div>
            <div className="mt-3 text-2xl font-black">v{TOS_VERSION}</div>
            <div className="mt-1 text-sm text-[var(--text-2)]">Accepted: {data.tosAcceptedAt ? new Date(data.tosAcceptedAt).toLocaleString("th-TH") : "ยังไม่ยอมรับ"}</div>
            <div className="mt-4"><Link href="/terms" className="text-sm font-bold text-[var(--primary)]">เปิดหน้า Terms →</Link></div>
          </div>
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><Lock size={15} /> Privacy Policy</div>
            <div className="mt-3 text-2xl font-black">v{PRIVACY_VERSION}</div>
            <div className="mt-1 text-sm text-[var(--text-2)]">Accepted: {data.privacyAcceptedAt ? new Date(data.privacyAcceptedAt).toLocaleString("th-TH") : "ยังไม่ยอมรับ"}</div>
            <div className="mt-4"><Link href="/privacy" className="text-sm font-bold text-[var(--primary)]">เปิดหน้า Privacy →</Link></div>
          </div>
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="text-sm font-semibold">Policy operations</div>
            <div className="mt-3 text-2xl font-black">Audit-enabled</div>
            <div className="mt-1 text-sm text-[var(--text-2)]">Effective date {TOS_EFFECTIVE} · modal enforcement via Providers</div>
            <div className="mt-4 text-xs text-[var(--text-3)]">Track acceptance and operational events in audit_logs</div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-2 text-lg font-black"><History size={18} /> Recent audit trail</div>
          <div className="mt-4 space-y-3">
            {data.auditLogs.length ? data.auditLogs.map((log, idx) => (
              <div key={idx} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
                  <div className="font-semibold">{log.action}</div>
                  <div className="text-xs text-[var(--text-3)]">{new Date(log.createdAt).toLocaleString("th-TH")}</div>
                </div>
                <div className="mt-2 text-xs leading-6 text-[var(--text-2)]">
                  IP: {log.ip ?? "unknown"} · UA: {log.userAgent ? String(log.userAgent).slice(0, 90) : "—"}
                </div>
              </div>
            )) : <div className="text-sm text-[var(--text-3)]">ยังไม่มี audit log สำหรับบัญชีนี้</div>}
          </div>
        </section>
      </div>
    </AppFrame>
  )
}
