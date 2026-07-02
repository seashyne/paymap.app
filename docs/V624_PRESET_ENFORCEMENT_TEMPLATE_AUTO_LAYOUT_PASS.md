# v6.2.4 Preset Enforcement + Template Auto-layout Pass

สิ่งที่เพิ่มในรอบนี้
- เพิ่ม preset engine สำหรับ Personal / Business / Merchant / Family
- เมื่อเลือก Template ใน Settings จะ apply preset ให้ทั้ง default page, theme, primary color, sidebar width/color, font, radius และ feature toggles
- AppFrame ใช้ template preset จริงในการจัด nav order, shell width, content padding, hero glow และ badge คำอธิบายบนทุกหน้าหลัก
- เพิ่ม visual language แยกตาม preset ผ่าน data-template และ data-panel-style

ไฟล์หลัก
- `src/lib/ui-template-presets.ts`
- `src/app/settings/SettingsClient.tsx`
- `src/components/layout/AppFrame.tsx`
- `src/app/globals.css`

ผลลัพธ์
- เลือก Template แล้วหน้าตาและความรู้สึกของระบบเปลี่ยนชัดขึ้น ไม่ใช่แค่เปลี่ยนชื่อ template
- ผู้ใช้ยังแก้ละเอียดต่อเองได้ก่อนกดบันทึก sync ลง DB
