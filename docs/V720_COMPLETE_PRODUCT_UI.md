# PayMap v7.2 Complete Product UI

รอบนี้เป็น high-impact UI overhaul ที่เน้นให้ทั้งระบบดูเป็น SaaS มากขึ้นโดยใช้ shared surfaces เป็นหลัก

## สิ่งที่อัปเดต
- เปลี่ยน theme token หลักให้สว่างและสดขึ้นทั้ง dark/light
- เพิ่ม utility สำหรับ marketing/desktop layout ใน `globals.css`
- ปรับ `AppFrame` ให้ desktop shell คมขึ้นและคุม content width กลางระบบ
- เปลี่ยน landing page (`/`) ใหม่ให้เป็น conversion-first แบบ desktop-first
- เพิ่มหน้า `/download` เพื่อแยกเส้นทาง Web / PWA / Android / iOS
- อัปเดต metadata และ version เป็น `7.2.0`

## ผลกระทบกับหน้าในระบบ
- หน้า authenticated ที่ใช้ `AppFrame` จะได้ shell ใหม่อัตโนมัติ
- หน้า public สำคัญได้ UX ใหม่ที่ชัดขึ้น: home, download

## สิ่งที่ยังไม่ถูก rewrite แบบ page-by-page เต็ม
- login, register, pricing, help, legal pages ยังใช้โครงเดิมเป็นหลัก
- รอบนี้จึงเป็น "complete product UI foundation" มากกว่า rewrite ทุกหน้าแบบ bespoke

## รอบถัดไปที่คุ้มที่สุด
- v7.2.1 Public surface rewrite (login/register/pricing/help/legal)
- v7.2.2 Dashboard visual pass (business/merchant/personal/reports)
- v7.2.3 Mobile/PWA install flow polish
