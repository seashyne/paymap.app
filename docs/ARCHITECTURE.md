# payMap Production Starter Architecture

เอกสารนี้คือโครงระบบที่พร้อมนำไปต่อเป็นงานจริง โดยใช้ **Next.js 14 + NextAuth + Prisma + PostgreSQL + Redis + Docker Compose**

## 1. เป้าหมายระบบ
- มีระบบสมัครสมาชิก / เข้าสู่ระบบ / ลืมรหัสผ่าน / ยืนยันอีเมล
- รองรับ **Credentials Login** และ **Google Login**
- มี health check สำหรับ deploy
- แยก environment ชัดเจนสำหรับ dev / staging / production
- ใช้ Docker ได้ทันที

## 2. Topology
- `app` = Next.js application + API routes
- `postgres` = ฐานข้อมูลหลัก
- `redis` = cache / rate limit / queue ในขั้นถัดไป
- `mailhog` = ทดสอบอีเมล local

## 3. Request Flow
1. Browser เรียกหน้าเว็บ Next.js
2. Login ผ่าน Credentials หรือ Google OAuth
3. NextAuth ออก session แบบ JWT
4. API อ่าน/เขียนข้อมูลผ่าน Prisma ไปยัง PostgreSQL
5. Dashboard ดึงข้อมูลผู้ใช้จาก session + database

## 4. ตารางหลักในระบบ
- `users`
- `accounts`
- `sessions`
- `verification_tokens`
- `tokens`
- `audit_logs`

## 5. แนวทางขยายต่อ
- เปลี่ยน rate limit จาก memory → Redis
- เพิ่ม worker สำหรับ email / notification
- เพิ่ม RBAC ระดับ admin / staff / member
- เพิ่ม observability เช่น Grafana / Loki / OpenTelemetry
- แยก object storage (S3/MinIO) เมื่อต้องมี upload

## 6. Security Baseline
- ใช้ `NEXTAUTH_SECRET` ที่สุ่มจริง
- production ต้องใช้ HTTPS
- ตั้ง Google OAuth redirect URI ให้ตรง
- ตั้ง `NEXTAUTH_URL` ให้เป็นโดเมนจริงตอน deploy
- อย่า commit `.env` หรือ `.env.local`
