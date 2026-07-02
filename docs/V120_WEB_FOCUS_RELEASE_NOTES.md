# PayMap v1.2 Web Focus

สิ่งที่เพิ่มในรอบนี้

- เพิ่ม middleware สำหรับป้องกันหน้า dashboard/business/merchant/billing/settings/profile/reports
- เพิ่มหน้า `/reports` สำหรับรายงาน Personal, Merchant, Business พร้อม export center
- ปรับ Billing ให้โหลดแผนจาก API และเริ่ม checkout ได้จากหน้าเดียว
- แก้ `/api/stripe/plans` ให้คืนข้อมูล plan sets ครบสำหรับ personal/business/merchant
- bump version เป็น 1.2.0

หมายเหตุ

- รอบนี้เป็น web-first patch เพื่อเร่งไปสู่การเปิดใช้งานจริงบนเว็บก่อน
- ยังควรรัน `npm run build` และไล่ QA บนเครื่องจริงอีกครั้งก่อน deploy production
