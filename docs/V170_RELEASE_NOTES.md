# payMap v1.7 — Architecture Fix + Full Notification Wiring

## Bug Fixes v1.7

### 1. AppFrame Server/Client Split (Critical Fix)
**ปัญหา v1.6**: ThemeToggle, NotificationBell, QuickAdd ถูก import ตรงเข้า AppFrame (Server Component) → crash

**แก้**: สร้าง `AppShell.tsx` ("use client") เป็นตัวกลาง
- `HeaderActions` — ThemeToggle + NotificationBell (ใน sidebar + header)
- `FloatingActions` — QuickAdd (floating ขวาล่าง)
- AppFrame import จาก AppShell เท่านั้น — ไม่มี client code ใน server component

### 2. Notification Trigger Points ครบ
- **Transaction POST** — ถ้า expense ทำให้ budget category ≥ 80% → push ทันที
- **Payroll run** — push "Payroll เสร็จสิ้น" พร้อม email
- **Leave approve/reject** — push แจ้ง status ใหม่
- **Budget alert** — logic ถูกต้อง (อยู่ใน transaction route ไม่ใช่ budget route)

### 3. Layout.tsx Theme Script
- `<script>` อยู่ใน `<head>` แบบถูกต้อง
- ป้องกัน FOUC ก่อน React hydrate
- Class `dark`/`light` set บน `<html>` ทันที

## ไฟล์ที่เปลี่ยน
- `src/components/layout/AppShell.tsx` — NEW
- `src/components/layout/AppFrame.tsx` — rewritten (server only)
- `src/app/layout.tsx` — fixed theme script placement
- `src/app/api/transactions/route.ts` — budget alert notification
- `src/app/api/business/payroll/route.ts` — payroll push notification
- `src/app/api/business/leave/[id]/route.ts` — leave status notification

## Quick Start (ยังเหมือนเดิม)
```bash
docker compose up -d
cp .env.local .env   # แก้ DATABASE_URL
npm install
npx prisma db push
npm run db:seed
npm run dev
# → http://localhost:3000
# demo@paymap.th / Demo1234
```
