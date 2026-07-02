# PayMap v1.5 — Dev-Ready Release

## จุดประสงค์รอบนี้
ทำให้ระบบรันได้บนเครื่อง dev โดยไม่ต้องตั้งค่า Firebase / Stripe / Resend ก่อน

## สิ่งที่แก้

### 1. Credentials Login ไม่ผ่าน Firebase (แก้ปัญหาหลัก)
- `POST /api/auth/login` — login ด้วย email/password โดยตรงจาก DB
- `LoginForm.tsx` ตรวจ `NEXT_PUBLIC_FIREBASE_API_KEY` — ถ้าไม่มีใช้ `/api/auth/login` แทน
- ใน dev เห็น banner "Dev Mode" แสดงบน login form
- Google login จะแสดง "(ต้องตั้งค่า Firebase)" ถ้ายังไม่ configure

### 2. Firebase Admin ไม่ crash เมื่อไม่มี config
- `firebase-admin.ts` lazy init — ไม่ crash ตอน startup
- `firebase-session` route ตรวจก่อน verify — return 503 พร้อม message ที่ชัดเจน

### 3. .env.local ชัดเจน
- ต้องการขั้นต่ำแค่ `DATABASE_URL` + `AUTH_SECRET`
- ทุก optional service มี comment อธิบาย
- `DEV_SETUP.md` อธิบาย step-by-step ครบ

### 4. Family Demo Data ใน Seed
- `demo@paymap.th` + `biz@paymap.th` ถูก link เป็น "ครอบครัวสมิธ Demo"
- ทดสอบ Family Workspace ได้ทันทีหลัง seed

### 5. Login Page ปรับปรุง
- Demo cards 3 โหมดอยู่ล่างหน้า login
- รองรับ `?next=` redirect หลัง login
- Password show/hide toggle

## ไฟล์ที่เปลี่ยน
- `src/app/api/auth/login/route.ts` — NEW: direct credentials login
- `src/components/auth/LoginForm.tsx` — dual-mode (Firebase / direct)
- `src/lib/firebase-admin.ts` — lazy init, no crash on missing config
- `src/app/api/auth/firebase-session/route.ts` — graceful 503 when no Firebase
- `src/app/login/page.tsx` — improved UX + demo cards
- `prisma/seed.ts` — family demo data
- `.env.local` / `.env.example` — dev-friendly with comments
- `DEV_SETUP.md` — NEW: step-by-step dev setup guide

## Quick Start
```bash
docker compose up -d
cp .env.local .env
npm install
npx prisma db push
npm run db:seed
npm run dev
# → http://localhost:3000
# Login: demo@paymap.th / Demo1234
```
