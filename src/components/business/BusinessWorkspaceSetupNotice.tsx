export default function BusinessWorkspaceSetupNotice({
  title = "Business workspace ยังไม่พร้อมใช้งาน",
  body = "หน้าจอนี้ต้องมี organization ก่อน จึงจะเริ่มทำงานจริงกับลูกค้า เอกสาร และ inventory ได้",
}: {
  title?: string
  body?: string
}) {
  return (
    <section className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="text-lg font-black">{title}</div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-2)]">{body}</p>
      <div className="mt-4 rounded-2xl bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-3)]">
        ไปสร้าง workspace/organization ก่อนที่หน้า onboarding หรือหน้าภาพรวมธุรกิจ แล้วค่อยกลับมาใช้งานโมดูลนี้
      </div>
    </section>
  )
}
