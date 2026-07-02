# Deploy PayMap บน Vercel + Neon + Firebase + Stripe

เอกสารนี้สรุปการตั้งค่า production ที่ต้องมีเพื่อให้โปรเจกต์ deploy ได้จริง

## 1) Services ที่ต้องเตรียม

- Vercel สำหรับ deploy Next.js
- Neon สำหรับ PostgreSQL
- Firebase สำหรับ Email/Password + Google Login
- Stripe สำหรับ subscription billing
- Resend สำหรับอีเมล transactional
- Redis (Upstash หรือ Redis อื่น) ถ้าต้องการ rate limit แบบ distributed

## 2) Environment Variables บน Vercel

คัดลอกค่าจาก `.env.example` ขึ้นไปที่ Vercel ทั้งหมดอย่างน้อยชุดนี้

### App
- `NEXT_PUBLIC_APP_URL=https://your-domain.com`
- `NEXTAUTH_URL=https://your-domain.com`
- `AUTH_SECRET=` ค่าสุ่มยาว
- `NEXTAUTH_SECRET=` ใช้ค่าเดียวกับ `AUTH_SECRET`

### Neon
- `DATABASE_URL=` connection string ของ Neon ที่มี `sslmode=require`
- `DIRECT_URL=` ใส่ค่าเดียวกันกับ `DATABASE_URL` สำหรับ Prisma migrations

### Firebase Client
- `NEXT_PUBLIC_FIREBASE_API_KEY=`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=`
- `NEXT_PUBLIC_FIREBASE_APP_ID=`

### Firebase Admin
- `FIREBASE_PROJECT_ID=`
- `FIREBASE_CLIENT_EMAIL=`
- `FIREBASE_PRIVATE_KEY=`

> สำคัญ: `FIREBASE_PRIVATE_KEY` ต้องเก็บรูปแบบ `\n` ไม่ใช่ขึ้นบรรทัดจริง ถ้าใส่ใน Vercel UI ให้ paste แบบหนึ่งบรรทัด

### Stripe
- `STRIPE_SECRET_KEY=`
- `STRIPE_PUBLISHABLE_KEY=`
- `STRIPE_WEBHOOK_SECRET=`
- `STRIPE_PRICE_PRO_MONTHLY=`
- `STRIPE_PRICE_PRO_YEARLY=`
- `STRIPE_PRICE_FAMILY_MONTHLY=`
- `STRIPE_PRICE_FAMILY_YEARLY=`

### Email / Optional
- `RESEND_API_KEY=`
- `EMAIL_FROM=`
- `REDIS_URL=`

## 3) ตั้งค่า Neon

1. สร้าง database ใหม่ใน Neon
2. คัดลอก connection string ที่มี `sslmode=require`
3. รัน migration/local sync ก่อน deploy จริง

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

## 4) ตั้งค่า Firebase

ใน Firebase Console:

- เปิด Email/Password provider
- เปิด Google provider
- เพิ่ม Authorized domains
  - `localhost`
  - โดเมน Vercel ของคุณ
  - custom domain จริงของคุณ

## 5) ตั้งค่า Stripe

1. สร้าง Product และ Price สำหรับ
   - Pro Monthly
   - Pro Yearly
   - Family Monthly
   - Family Yearly
2. เอา `price_...` ไปใส่ใน env
3. ตั้ง Webhook endpoint เป็น
   - `https://your-domain.com/api/stripe/webhook`
4. subscribe events อย่างน้อย:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

## 6) Deploy บน Vercel

### วิธีผ่าน Git

1. push โปรเจกต์ขึ้น GitHub
2. Import project ใน Vercel
3. ตั้งค่า Framework เป็น Next.js
4. ใส่ environment variables ทั้งหมด
5. Deploy

### Build settings

- Install Command: `npm install`
- Build Command: `npm run build`
- Output: ค่า default ของ Next.js

## 7) หลัง deploy ต้องทดสอบ

- สมัครสมาชิกด้วย email/password
- login ด้วย Google
- logout
- เพิ่ม transaction
- ตั้ง budget
- สร้าง savings goal
- เปิดหน้า billing
- สร้าง Stripe checkout session
- ยืนยันว่า webhook อัปเดต plan ได้

## 8) สิ่งที่แก้ในโปรเจกต์นี้แล้ว

- เพิ่ม lazy Stripe client เพื่อไม่ให้โปรเจกต์พังตั้งแต่ import ถ้ายังไม่ได้ตั้ง env
- เพิ่ม Google sign up ที่หน้า register
- แก้ implicit `any` หลายจุดใน API routes หลัก
- แยก helper สำหรับ environment และ app URL
- ปรับโค้ดให้พร้อมใช้กับ Vercel/Neon มากขึ้น

## 9) ข้อควรระวัง production

- ห้ามใช้ secret จากไฟล์ `.env.local` เดิมใน production
- ต้องเปลี่ยน `AUTH_SECRET` เป็นค่าสุ่มใหม่เสมอ
- ควรเปิด database branching แยก dev/staging/prod
- ควรเปิด Sentry/monitoring เพิ่มก่อนใช้งานจริงกับลูกค้า
