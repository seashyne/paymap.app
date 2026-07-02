# payMap v1.9.0 Release Notes

## Schema Fixes
- **Soft Delete** — Transaction, Employee, Invoice, Organization, MerchantProduct, SalesOrder ทุกตัวมี `deletedAt` แล้ว — ลบข้อมูลแบบ soft เท่านั้น ไม่มีการลบถาวร
- **New Enums** — `InventoryMovement`, `InventoryRef`, `PaymentMethod`, `RecurringInterval` แทน String fields ป้องกัน typo และ invalid values
- **Decimal Precision** — LeaveBalance/LeaveRequest `Decimal(6,2)`, otHours `Decimal(8,2)` รองรับทศนิยม 2 ตำแหน่งถูกต้อง
- **Notification TTL** — field `expiresAt` + cleanup index ป้องกัน rows สะสมไม่มีที่สิ้นสุด
- **Session/Token Cleanup Index** — `@@index([expires])` และ `@@index([expiresAt])` ทำให้ cleanup query เร็วขึ้น

## Security
- **Search DoS Guard** — `/api/search?q=` จำกัด 100 ตัวอักษร ป้องกัน long-query full scan
- **Business Audit Log** — payroll run และ employee delete บันทึก AuditLog แล้ว
- **Notification Cleanup API** — `POST /api/notifications/cleanup` + cron secret สำหรับ production

## New: Apple Sign In
- `appleProvider` ใน `firebase-client.ts` (OAuthProvider "apple.com")
- `loginApple()` function ใน `LoginForm.tsx`
- `handleApple` handler พร้อม popup-closed graceful handling
- firebase-session route ตรวจสอบ `apple.com` provider ถูกต้อง
- ต้องตั้งค่าใน Firebase Console: Authentication → Sign-in method → Apple

## New: Landing Page (YNAB-inspired)
- Split-screen hero: copy ซ้าย + dashboard mockup ขวา
- Social proof pill + stat trio
- 3 workspace cards พร้อม demo link
- Testimonials section
- CTA section พร้อม decorative elements
- Footer ที่สะอาด
- ใช้สี CSS variables เดิมทั้งหมด (dark/light/executive themes)

## Neon Database Assessment
ดูรายละเอียดใน `docs/NEON_ASSESSMENT.md`

## Quick Start
```bash
npx prisma db push     # apply schema changes
psql $DATABASE_URL -f prisma/migration_v19.sql  # production
npm run db:seed
npm run dev
```

## Firebase Apple Setup
1. Firebase Console → Authentication → Sign-in method → Add provider → Apple
2. ใส่ Apple Service ID และ OAuth redirect domain
3. Apple Developer → Certificates → Sign in with Apple → กำหนด domain
4. ไม่ต้องเพิ่ม env variable เพิ่ม — ใช้ Firebase config เดิม
