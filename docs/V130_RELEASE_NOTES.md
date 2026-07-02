# PayMap v1.3 — Mode Isolation + Persistent Login + Team Workspace

## สิ่งที่เปลี่ยนในรอบนี้

### 1. Persistent Login (จำการล็อกอิน 30 วัน)
- Session ขยายจาก 7 วัน → **30 วัน**
- Sliding renewal: ถ้าเหลือ < 7 วัน จะต่ออายุอัตโนมัติเงียบๆ
- ผู้ใช้ไม่ต้อง login ใหม่ตราบที่ใช้งานอยู่ในช่วง 30 วัน
- Demo session คงที่ 24 ชั่วโมง (ไม่ต่ออายุ)

### 2. Mode Isolation — แยก Workspace ชัดเจน
- เพิ่ม `workspaceMode` ใน session JWT
- ผู้ใช้ที่ subscribe product เดียว: ถูก lock ไว้ที่ workspace นั้น
- Cross-workspace access จะถูก redirect กลับ workspace ที่ถูกต้อง
- ป้องกัน Personal user เข้า Business/Merchant และกลับกัน
- ทุก API route รองรับ mode check ใน middleware

### 3. Demo ไม่ต้องใส่ข้อมูลใดๆ
- `/demo/personal`, `/demo/business`, `/demo/merchant` → เข้าได้ทันที
- ไม่ต้องกรอก email / รหัสผ่าน / ลงทะเบียน
- `isDemo=true` ใน session → bypass subscription check ทุกจุด
- Demo session มี `workspaceMode` ตรงกับ mode ที่เลือก

### 4. Business Team Workspace (Multi-user, Multi-role)
- `WorkspacePanel` component ใน Business tab "Workspace"
- สร้าง Organization/Workspace ได้หลายอัน
- เชิญสมาชิกด้วย email (ต้องมีบัญชีในระบบ)
- บทบาท 6 ระดับ: owner, admin, manager, accountant, member, viewer
- เปลี่ยนบทบาท / นำสมาชิกออกได้
- API: `/api/workspace` และ `/api/workspace/members`

## ไฟล์ที่เปลี่ยนแปลง
- `src/lib/session.ts` — 30d session, shouldRenewSession, new fields
- `src/lib/demo.ts` — DEMO_SESSION_DAYS constant, descriptions
- `src/middleware.ts` — mode isolation, demo bypass, sliding renewal
- `src/app/demo/[mode]/route.ts` — isDemo + workspaceMode in JWT
- `src/app/api/auth/firebase-session/route.ts` — subscriptions + workspaceMode
- `src/app/api/workspace/route.ts` — NEW: list/create workspaces
- `src/app/api/workspace/members/route.ts` — NEW: CRUD members
- `src/components/workspace/WorkspacePanel.tsx` — NEW: Team UI
- `src/app/business/page.tsx` — Workspace tab + demo bypass

## หมายเหตุ
- schema.prisma ไม่ต้องแก้ — Organization + OrganizationMember + Team มีอยู่แล้ว
- รัน `npm run db:push` ถ้ายังไม่เคย sync schema
- ยังควรรัน `npm run build` และ QA บนเครื่องจริงก่อน deploy production
