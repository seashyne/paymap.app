import Link from "next/link"
import { BadgeCheck, FileText, ShieldCheck } from "lucide-react"

export default function ConsentStatusPanel({
  tosAcceptedAt,
  privacyAcceptedAt,
  tosVersion,
  privacyVersion,
  required,
}: {
  tosAcceptedAt?: string | null
  privacyAcceptedAt?: string | null
  tosVersion?: string | null
  privacyVersion?: string | null
  required: boolean
}) {
  return (
    <section className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(34,197,94,.22)] bg-[rgba(34,197,94,.08)] px-3 py-1 text-xs font-bold text-[var(--green)]">
            <ShieldCheck size={13} /> SaaS Consent System
          </div>
          <h3 className="mt-3 text-xl font-black">Legal & consent status</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-2)]">
            ระบบ consent ถูกยกระดับเป็นเวอร์ชัน SaaS จริงใน v5.3 โดยมีหน้า policy สาธารณะ, modal บังคับยอมรับ,
            audit trail และ control center สำหรับตรวจสอบสถานะการยอมรับล่าสุดของบัญชีนี้
          </p>
        </div>
        <Link href="/settings/legal" className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-bold hover:bg-[var(--surface-3)]">
          เปิด Legal Center
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><BadgeCheck size={15} /> Terms of Service</div>
          <div className="mt-2 text-sm text-[var(--text-2)]">{tosAcceptedAt ? `Accepted · ${new Date(tosAcceptedAt).toLocaleString("th-TH")}` : "ยังไม่ยอมรับ"}</div>
          <div className="mt-1 text-xs text-[var(--text-3)]">Version {tosVersion ?? "—"}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><FileText size={15} /> Privacy Policy</div>
          <div className="mt-2 text-sm text-[var(--text-2)]">{privacyAcceptedAt ? `Accepted · ${new Date(privacyAcceptedAt).toLocaleString("th-TH")}` : "ยังไม่ยอมรับ"}</div>
          <div className="mt-1 text-xs text-[var(--text-3)]">Version {privacyVersion ?? "—"}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="text-sm font-semibold">Enforcement</div>
          <div className={`mt-2 text-sm ${required ? "text-[var(--amber)]" : "text-[var(--green)]"}`}>
            {required ? "ต้องยอมรับ policy ล่าสุดก่อนใช้งานต่อ" : "ผ่านการตรวจสอบแล้ว"}
          </div>
          <div className="mt-1 text-xs text-[var(--text-3)]">Route guard + modal + audit log</div>
        </div>
      </div>
    </section>
  )
}
