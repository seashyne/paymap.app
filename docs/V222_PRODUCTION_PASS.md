# PayMap v22.2 Production Pass

สิ่งที่ปรับในรอบนี้

- แก้ workspace switching ให้เข้า Personal / Merchant / Business ได้จริงหลังล็อกอิน
- ปรับ middleware ให้สลับ workspace mode ตามหน้าที่ผู้ใช้เปิด แทนการเด้งกลับหน้าเดิม
- กันผู้ใช้ที่ล็อกอินแล้วไม่ให้ค้างหน้า login/register และ redirect ไป workspace ที่เลือกได้ถูกต้อง
- แก้ Business onboarding ให้สร้าง workspace ได้จริงแม้ไม่ได้ส่ง slug มาจากฟอร์ม
- ปรับ `/api/workspace` ให้สร้าง slug อัตโนมัติและคืน response ที่อ่านง่ายขึ้น
- เพิ่ม starter kit สำหรับ Merchant store แรก เพื่อให้มีสินค้า demo ใช้งานทันทีหลังสร้างร้าน
- แก้ API Merchant หลายจุดให้คืน status/response ถูกต้องขึ้น
- แก้ query ใน sales route ที่อ้าง field ไม่มีใน schema

สิ่งที่ควรทดสอบหลังแตกไฟล์

1. สมัครสมาชิกใหม่ แล้วเข้า Personal / Merchant / Business ได้ครบ
2. สร้างร้าน Merchant แล้วเห็น starter products และขายจาก POS ได้
3. สร้าง Business workspace แล้วเพิ่มพนักงานคนแรกได้
4. ล็อกอินแล้วเปิด `/login` หรือ `/register` ต้องถูกส่งกลับ workspace
