# PayMap v5.6 — UI Unification + Performance Pass

งานรอบนี้โฟกัส 3 เรื่องหลัก

1. รวมภาษาดีไซน์ของหน้า Dashboard, Billing, Reports, Settings และ Pay Profile ให้ใกล้เคียงกันมากขึ้น
2. ปรับ perceived performance ด้วย route loading screens และลด query ซ้ำใน shell หลัก
3. ทำให้การแสดงผลแผน (plan) ใช้ source เดียวกันผ่าน helper กลาง

## สิ่งที่เปลี่ยน

- เพิ่ม `src/lib/subscription/current-plan.ts`
  - ใช้ helper เดียวคำนวณ active plan จาก `productSubscriptions` ก่อน แล้ว fallback ไป `user.plan`
- ปรับ `AppFrame`
  - query available modes ครั้งเดียว แล้วใช้ซ้ำทั้ง sidebar/topbar
  - ลดโอกาส query ซ้ำใน shell หลัก
  - เพิ่ม `min-w-0` และกันข้อความล้นใน title/top chips
- เพิ่ม route loading screens
  - `/dashboard`
  - `/billing`
  - `/settings`
  - `/reports`
  - `/business`
  - `/merchant`
- ปรับ Billing และ Purchase History
  - ลดข้อความยาว
  - ปรับ grid ให้ปลอดภัยขึ้นบน desktop
- ปรับ Settings / Pay Profile
  - ขยายความกว้างบน desktop
  - ลดข้อความอธิบายที่ไม่จำเป็น
  - ใช้คำที่เข้าใจง่ายขึ้นสำหรับผู้ใช้ใหม่
- อัปเดต release label เป็น v5.6

## สิ่งที่ยังควรทำต่อในรอบถัดไป

- unify workbench รุ่นเก่าใน business / merchant ให้เป็น design system เดียวกันทั้งหมด
- ลด data fetching ซ้ำในหน้า report/workbench ที่ query หลายชุดมาก
- audit responsive ทุก breakpoint สำหรับหน้า table หนัก ๆ และ panel ที่มี action หลายปุ่ม
