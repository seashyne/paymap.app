# คู่มือตั้งค่า PayMap: Neon + Firebase Auth

## สรุประบบ

- Firebase Auth: สมัครสมาชิก, ล็อกอิน, Google Login, reset password
- Firebase Admin: verify token ฝั่ง server
- Neon PostgreSQL: ฐานข้อมูลหลัก
- Prisma: schema และ query layer
- Session ของเว็บ: HTTP-only cookie (`paymap_session`)

## ลำดับตั้งค่าที่แนะนำ

1. สร้าง Neon project
2. สร้าง Firebase project
3. ตั้งค่า `.env.local`
4. `npm install`
5. `npm run db:generate && npm run db:push && npm run db:seed`
6. `npm run dev`
7. ทดลอง register, login, Google login, logout

## Firebase Console ที่ต้องเปิด

- Authentication > Sign-in method > Email/Password
- Authentication > Sign-in method > Google
- Authentication > Settings > Authorized domains
  - localhost
  - โดเมน production

## จุดสำคัญสำหรับ production

- เปลี่ยน `AUTH_SECRET` เป็นค่ายาวและสุ่มจริง
- อย่าเอา `FIREBASE_PRIVATE_KEY` ไปฝั่ง client
- แยก Neon database เป็น dev/staging/prod
- เปิด monitoring และ backup policy
- ตั้ง domain จริงใน Firebase ก่อน deploy
