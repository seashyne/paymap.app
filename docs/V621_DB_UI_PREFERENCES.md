# PayMap v6.2.1 — DB-persisted UI Preferences

สิ่งที่เพิ่ม
- บันทึก UI preferences ลง `users.uiPreferences` (JSONB) ผ่าน Prisma
- API `GET/PATCH /api/user/ui-preferences`
- Settings > Appearance สำหรับ template, default page, primary color, sidebar color/width, font, border radius, quick actions, charts, bottom nav
- AppFrame โหลดค่า preference จาก DB แล้ว apply ข้ามเครื่องได้
- Mobile bottom nav เปิด/ปิดได้
- Floating Quick Add เปิด/ปิดได้

วิธีใช้งาน
1. รัน SQL migration `prisma/migration_v621_ui_preferences.sql` หรือ `prisma db push`
2. เปิด Settings > Appearance
3. ปรับค่าแล้วกดบันทึก
4. ล็อกอินจากเครื่องอื่นด้วยบัญชีเดียวกัน ค่าจะตามมา

หมายเหตุ
- เวอร์ชันนี้เก็บ `showCharts` และ `defaultPage` ไว้ใน DB แล้ว แต่การ redirect อัตโนมัติทุก entrypoint ยังไม่ได้ทำครบทุก route
- หากต้องการบังคับ default page ตอน login/เข้าหน้า dashboard แนะนำทำใน v6.2.2
