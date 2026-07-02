import { Settings2 } from "lucide-react"
import Link from "next/link"

export default function PreferenceDisabledBlock({
  title = "ส่วนนี้ถูกปิดตามการตั้งค่า",
  description = "คุณปิด Charts ไว้ใน Appearance settings จึงซ่อนกราฟในหน้านี้ แต่ข้อมูลสรุปและตารางยังใช้งานได้ตามปกติ",
  compact = false,
}: {
  title?: string
  description?: string
  compact?: boolean
}) {
  return (
    <div className={`empty-state ${compact ? "min-h-[160px]" : "min-h-[220px]"}`}>
      <Settings2 size={compact ? 22 : 28} className="mb-3 text-[var(--text-3)]" />
      <div className="text-base font-bold">{title}</div>
      <div className="mt-2 max-w-xl text-center text-sm leading-6 text-[var(--text-3)]">{description}</div>
      <Link href="/settings?tab=appearance" className="mt-4 inline-flex items-center rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-2)]">
        เปิด Appearance settings
      </Link>
    </div>
  )
}
