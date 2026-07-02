# V6.1 Core UX Rescue Pass

เป้าหมายของรอบนี้คือทำให้ PayMap ใช้ง่ายและเร็วขึ้นก่อนเพิ่มฟีเจอร์ใหม่

## สิ่งที่แก้ในแพ็กนี้

1. Dashboard เปลี่ยนเป็น task-first
   - เพิ่ม Quick Actions
   - เพิ่ม Workspace Entry
   - เพิ่ม Recommended Setup
   - ตัด dependency หนักจากหน้า overview

2. Performance เบื้องต้น
   - หน้า dashboard ใช้ query เบาแทน loader เดิม
   - ลดการพึ่งพา dashboard client ขนาดใหญ่

3. Pay Profile build fix
   - แก้ type ของ template ให้ build ผ่าน
   - ทำให้ template ใช้งานได้เสถียรขึ้น

4. Billing / Help hotfix
   - เปลี่ยน ReceiptText เป็น Receipt ให้เข้ากับ lucide-react เวอร์ชันปัจจุบัน

## รายไฟล์ที่แก้ก่อน-หลัง

### Priority 1
- `src/app/dashboard/page.tsx`
- `src/components/dashboard/QuickActions.tsx`
- `src/components/dashboard/WalletSummaryLite.tsx`
- `src/components/dashboard/WorkspaceEntry.tsx`
- `src/components/dashboard/RecommendedSetup.tsx`

### Priority 2
- `src/components/layout/AppFrame.tsx`
- `src/components/pay-profile/PayProfileEditor.tsx`
- `src/app/settings/pay-profile/page.tsx`

### Priority 3
- `src/components/billing/PurchaseHistory.tsx`
- `src/app/help/page.tsx`

## งานที่ควรทำต่อใน v6.2
- แยก AppFrame เป็น Sidebar / Topbar / Workspace frame
- รีไรต์ Pay Profile เป็น visual builder แบบ 2 คอลัมน์
- ทำ route-level cache และ prefetch ให้ business / merchant workbench
- รีไรต์ Billing ให้เป็น task-first เช่นเดียวกับ dashboard
