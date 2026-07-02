# V901 QA Sweep Fixes

ไฟล์ชุดนี้แก้บัคจาก QA sweep รอบล่าสุดแล้ว

## แก้แล้ว
- sanitize redirect ใน auth switch-mode และ helper post-auth
- sync profile กลับ DB จาก Firebase session สำหรับ user เดิม
- lock planner workspace ให้ตรงกับ accountMode ของ user (admin override ได้)
- เพิ่ม error/loading state ตอนเปิด Stripe billing portal
- เพิ่ม validation profile สำหรับ image / website / username / country / currency / locale / timezone
- ทำให้ FileUploader ใช้ props `accept` และ `maxSizeMB` จริง

## หมายเหตุ
- ชุดนี้เป็น code fix จาก static QA sweep
- ยังไม่ได้ยืนยัน end-to-end runtime pass ทุก flow ใน environment จริง
