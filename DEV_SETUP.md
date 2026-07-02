# payMap v1.5 — Dev Setup (เริ่มใช้งานบนเครื่องตัวเอง)

## ต้องการ
- Node.js 18+
- PostgreSQL (local หรือ Docker)
- npm หรือ pnpm

---

## 1. เตรียม Database (เลือกวิธีใดวิธีหนึ่ง)

### วิธี A: Docker Compose (แนะนำ)
```bash
docker compose up -d
# PostgreSQL จะรันที่ localhost:5432 (user: postgres / pass: postgres)
```

### วิธี B: PostgreSQL ที่ติดตั้งแล้ว
สร้าง database ชื่อ `paymap` ด้วย user ที่ต้องการ

---

## 2. ตั้งค่า Environment
```bash
cp .env.local .env
# แก้ DATABASE_URL ให้ตรงกับ database ของคุณ
# AUTH_SECRET ใช้ค่า default ใน dev ได้เลย
```

**ขั้นต่ำที่ต้องมี:**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/paymap"
AUTH_SECRET="dev-secret-change-me-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

> ไม่ต้องตั้งค่า Firebase, Stripe, หรือ Resend สำหรับ dev

---

## 3. ติดตั้ง Dependencies + ตั้งค่า Database
```bash
npm install

# Sync schema + สร้างตาราง
npx prisma db push

# สร้างข้อมูล demo
npm run db:seed
```

---

## 4. รัน Dev Server
```bash
npm run dev
# เปิด http://localhost:3000
```

---

## บัญชีทดสอบ (หลัง seed)

| บัญชี | Email | Password | Mode |
|---|---|---|---|
| Personal | demo@paymap.th | Demo1234 | Personal Finance |
| Business | biz@paymap.th | Demo1234 | Business + HR |
| Merchant | shop@paymap.th | Demo1234 | POS + Inventory |
| Admin | admin@paymap.th | Demo1234 | Admin Panel |

### Demo โดยไม่ต้อง login
- http://localhost:3000/demo/personal
- http://localhost:3000/demo/business
- http://localhost:3000/demo/merchant

---

## Dev Mode Features
- **Login**: ใช้ Email/Password โดยตรง (ไม่ต้องมี Firebase)
- **Email**: log ไปที่ console แทนส่งจริง
- **Stripe**: UI แสดงได้ แต่ checkout disabled
- **Family**: demo@paymap.th + biz@paymap.th ถูก link เป็น "ครอบครัวสมิธ Demo" แล้ว

---

## เพิ่มฟีเจอร์เสริม (Optional)

### Firebase (Google Login)
เพิ่มใน `.env`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### Stripe (Billing)
```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Email (Resend)
```
RESEND_API_KEY=re_xxx
EMAIL_FROM="noreply@yourdomain.com"
```

---

## คำสั่งที่ใช้บ่อย
```bash
npm run dev          # รัน development server
npm run build        # build production (ตรวจ TypeScript errors)
npm run db:seed      # reset + seed ข้อมูล demo
npx prisma studio    # GUI สำหรับดู/แก้ไข database
npx prisma db push   # sync schema changes (ไม่ต้องเขียน migration)
```
