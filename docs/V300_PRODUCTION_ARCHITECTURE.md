# PayMap v3 Production Architecture

## หลักการ
- 1 account = 1 mode
- โหมดบัญชีถูกล็อกตั้งแต่สมัคร
- login, middleware, settings และ route guard ใช้ accountMode เป็น source of truth

## เปลี่ยนหลัก
- เพิ่ม `User.accountMode` ใน Prisma
- session มี `accountMode` และคง `workspaceMode` ไว้เพื่อ backward compatibility
- login/register/firebase-session จะไม่สลับโหมดตามใจผู้ใช้
- route ผิดโหมดจะ redirect กลับหน้าโหมดหลักของบัญชีนั้น
- settings เปลี่ยนจาก switch mode เป็นแสดงประเภทบัญชีแบบ immutable

## เวอร์ชัน
- 3.0.0
