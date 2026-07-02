# PayMap v1.4 — Full Feature Completion

## สิ่งที่เพิ่มในรอบนี้

### 1. Business Workspace Data Sharing (แก้ Feature Gap)
- ทุก API ของ Business (employees, payroll, leave) เปลี่ยนจาก `ownerId` → ตรวจ org membership จริง
- สมาชิกทุกระดับเห็นข้อมูลร่วมกัน: owner, admin, manager, accountant, member, viewer
- Role-based write: accountant+ เท่านั้น run payroll ได้, manager+ อนุมัติลาได้
- ใช้ `requireOrgAccess()` และ `canWrite()` helpers ทุก route

### 2. Enterprise Workspace — Functional (แก้ Feature Gap)
- `/enterprise` ไม่ redirect ไป business อีกต่อไป — มี dashboard จริง
- Multi-org executive view: เห็นทุก organization ที่ตัวเองเป็นสมาชิก
- KPI cards: พนักงาน, ใบลารอ, Approval รอ, จำนวนทีม
- Payroll summary + trend chart 6 เดือน
- สร้าง organization ใหม่ได้จาก enterprise page
- `/api/enterprise/organizations` — ข้อมูลจริงจาก DB
- `/api/enterprise/reports` — aggregate payroll, leave, teams

### 3. Email Notifications จริง (ครบทุกจุด)
**`src/lib/email.ts`** — unified email service (Resend production / console.log dev)
- Auth: ยืนยัน email, รีเซ็ต password
- Workspace invite: เพิ่มสมาชิก business workspace
- Family invite: เพิ่มสมาชิกครอบครัว
- Budget alert: แจ้งเตือนเมื่อ budget ใกล้เต็ม
- Subscription renewal: แจ้ง 7 วันก่อนต่ออายุ
- Monthly report: สรุปการเงินประจำเดือน
- Payroll completed: แจ้ง owner เมื่อ payroll เสร็จ
- Vercel cron: `/api/notifications/renewal` รัน 09:00 ทุกวัน

### 4. Family Workspace — ใหม่ทั้งหมด
**Schema ใหม่**: Family, FamilyMember (role: owner/spouse/adult/child), FamilyBudget
**APIs**:
- `GET/POST /api/family` — list/create family
- `POST/DELETE /api/family/members` — เพิ่ม/ลบสมาชิก
- `GET /api/family/summary` — aggregate รายรับ-จ่ายทุกคนในบ้านเดือนนี้
**UI**: FamilyPanel ใน tab "Family" ของ Personal dashboard
- สร้างหลาย family ได้
- เห็นสรุปการเงินของทุกคนในบ้านพร้อมกัน
- Spend bar รายคน
- เพิ่มสมาชิกด้วย email + เลือก role
- เมื่อเพิ่มสมาชิก ส่ง email แจ้งอัตโนมัติ

## ไฟล์ที่เปลี่ยน/เพิ่ม
- `src/lib/authz.ts` — requireOrgAccess, canWrite helpers
- `src/lib/email.ts` — NEW unified email service
- `src/app/api/business/employees/route.ts` — org membership scope
- `src/app/api/business/payroll/route.ts` — org membership scope + email
- `src/app/api/business/leave/route.ts` — org membership scope
- `src/app/api/business/leave/[id]/route.ts` — role-based approve/reject
- `src/app/api/enterprise/organizations/route.ts` — real DB data
- `src/app/api/enterprise/reports/route.ts` — NEW aggregate report
- `src/app/api/family/route.ts` — NEW
- `src/app/api/family/members/route.ts` — NEW + invite email
- `src/app/api/family/summary/route.ts` — NEW aggregate
- `src/app/api/notifications/renewal/route.ts` — NEW cron endpoint
- `src/app/api/workspace/members/route.ts` — invite email wired
- `src/app/enterprise/page.tsx` — real Enterprise page
- `src/app/dashboard/page.tsx` — Family tab added
- `src/components/enterprise/EnterpriseDashboard.tsx` — NEW
- `src/components/family/FamilyPanel.tsx` — NEW
- `prisma/schema.prisma` — Family, FamilyMember, FamilyBudget models
- `prisma/migration_family.sql` — migration script
- `vercel.json` — cron schedule added

## Setup หลัง unzip
```bash
# Run family migration
psql $DATABASE_URL < prisma/migration_family.sql
# หรือ
npx prisma db push

# Set env vars ใหม่
RESEND_API_KEY=re_xxxxx
CRON_SECRET=your-random-secret
```
