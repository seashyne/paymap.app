# V904 Auth + Public Contrast Sweep

สิ่งที่แก้ในรอบนี้

- แก้ปุ่ม CTA/public buttons ที่ยังกลายเป็นโทนขาวจนอ่านข้อความยากบน dark theme
- แก้ input auth ให้เสถียรขึ้นกับ Chrome/Edge autofill และข้อความในช่องกรอก
- เพิ่มปุ่ม Apple ในหน้า Register
- ปรับ social auth buttons ของ Login/Register ให้ใช้ style เดียวกัน
- รีดีไซน์หน้า forgot-password และ reset-password ให้ใช้ public/auth surface ชุดเดียวกับหน้า login/register
- เพิ่ม CSS override รอบใหม่เพื่อลดจุดที่ contrast ต่ำในหน้า public/auth

ไฟล์ที่แก้

- `src/components/auth/LoginForm.tsx`
- `src/components/auth/RegisterForm.tsx`
- `src/app/forgot-password/page.tsx`
- `src/app/reset-password/page.tsx`
- `src/app/globals.css`
