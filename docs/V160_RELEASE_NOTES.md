# payMap v1.6 — All High-Impact Fixes

## 1. Auto-Login หลัง Register
- `POST /api/auth/register` สร้าง session cookie ทันทีหลังสมัคร
- `RegisterForm` redirect ไป `/dashboard` โดยตรง — ไม่ต้อง login ซ้ำ

## 2. Bug Fix: employees/[id] — Org Membership
- `PATCH/DELETE /api/business/employees/[id]` เปลี่ยนจากเช็ค `ownerId` → `requireOrgAccess()`
- ทีมสมาชิกที่มีสิทธิ์ canWrite แก้ไขพนักงานได้แล้ว

## 3. In-App Notification Bell
- `GET/PATCH /api/notifications` — list + mark as read
- `NotificationBell` component ใน AppFrame header ทุกหน้า
- Poll ทุก 30 วินาที — unread badge แสดงอัตโนมัติ
- Budget alert trigger: ≥ 80% ใช้งาน → push notification ทันที
- Type icons แยกตาม: budget_alert, subscription_due, approval_required, monthly_report, recurring_detected
- `src/lib/notify.ts` — helper `pushNotification()` ใช้งานจาก API ใดก็ได้

## 4. Dark / Light Mode Toggle
- `ThemeToggle` component: Dark / Light / System (3 modes)
- ใน AppFrame header (compact button — cycles modes)
- ใน Settings page (full 3-button selector)
- เพิ่ม CSS variables สำหรับ Light mode ใน `globals.css`
- Inline `<script>` ใน `layout.tsx` ป้องกัน flash ตอน load

## 5. Quick-Add Floating Button
- ปุ่ม `+` ลอยขวาล่างทุกหน้า — กด `N` ก็เปิดได้
- เลือก expense/income, จำนวน, หมวดหมู่ (lazy load), หมายเหตุ, วันที่
- บันทึกแล้วส่ง event `paymap:tx-added` ให้ dashboard refresh
- `Escape` ปิด, `Enter` ใน amount field บันทึกทันที

## 6. Export CSV/JSON จริง
- `GET /api/export?type=transactions|employees|payroll|sales`
- รองรับ `format=csv` (default) + `format=json`
- รองรับ `from` / `to` date filter
- `ExportButton` component — dropdown เลือก format
- CSV มี UTF-8 BOM — เปิดใน Excel ถูกต้อง ภาษาไทยไม่บิด

## ไฟล์ใหม่
- `src/app/api/auth/register/route.ts` (updated)
- `src/app/api/business/employees/[id]/route.ts` (fixed)
- `src/app/api/notifications/route.ts` (new)
- `src/app/api/export/route.ts` (rewritten — real data)
- `src/lib/notify.ts` (new)
- `src/components/ui/NotificationBell.tsx` (new)
- `src/components/ui/ThemeToggle.tsx` (new)
- `src/components/ui/QuickAdd.tsx` (new)
- `src/components/ui/ExportButton.tsx` (new)
