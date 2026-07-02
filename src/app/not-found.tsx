import Link from "next/link"
import { Compass, Home, LifeBuoy } from "lucide-react"

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-20 text-[var(--text)]">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--primary)]">
          <Compass size={24} />
        </div>
        <h1 className="mt-5 text-3xl font-black">ไม่พบหน้าที่ต้องการ</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">ลิงก์อาจหมดอายุ ถูกย้าย หรือพิมพ์ URL ไม่ถูกต้อง</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white"><Home size={15} /> กลับหน้าแรก</Link>
          <Link href="/pricing" className="rounded-2xl border border-[var(--border)] px-5 py-3 text-sm font-bold">Pricing</Link>
          <Link href="/help" className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-5 py-3 text-sm font-bold"><LifeBuoy size={15} /> Help Center</Link>
        </div>
      </div>
    </main>
  )
}
