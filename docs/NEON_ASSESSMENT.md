# Neon Database — ดีพอสำหรับ payMap หรือยัง?

## Neon คืออะไร
Neon เป็น **Serverless PostgreSQL** — ต่างจาก Supabase/Railway ตรงที่ compute scale to zero ได้จริง คิดเงินตาม compute time ไม่ใช่ตาม instance

---

## ✅ สิ่งที่ Neon ทำได้ดีสำหรับ payMap

### 1. Serverless autoscaling
payMap มี 3 workspace (Personal/Business/Merchant) ที่ traffic ไม่เท่ากัน Neon scale compute ขึ้นลงได้ตาม load — ไม่ต้อง provision instance ใหญ่ค้างไว้

### 2. Branching (killer feature)
Neon มี database branch เหมือน git — สร้าง branch จาก production data เพื่อทดสอบ migration ก่อน apply จริง ซึ่งมีประโยชน์มากสำหรับ migration v1.9 ที่เปลี่ยน enum type หลายตัว

```bash
# สร้าง branch จาก prod เพื่อทดสอบ
neon branches create --name test-v1.9
# Run migration บน branch
DATABASE_URL=<branch-url> psql -f migration_v19.sql
# ถ้าผ่าน → apply บน main
```

### 3. Connection pooling built-in (PgBouncer)
payMap ใช้ Prisma + Next.js serverless functions ซึ่งเปิด connection ใหม่ทุก request Neon มี pooler endpoint ในตัว — ใช้ `DATABASE_URL` สำหรับ pooled connections และ `DIRECT_URL` สำหรับ migration เท่านั้น (รองรับแล้วใน `.env.local`)

### 4. Point-in-Time Recovery
ถ้าเกิด data corruption ย้อนกลับได้ถึง 7 วัน (Free) หรือ 30 วัน (Pro) — สำคัญมากสำหรับข้อมูลการเงิน

---

## ⚠️ ข้อจำกัดที่ต้องรู้

### 1. Cold start latency
Neon scale to zero หลัง inactive 5 นาที — request แรกอาจช้า **1–3 วินาที** เพราะต้อง warm up compute

**วิธีแก้:**
```bash
# เพิ่ม cron ping ทุก 4 นาที (ใน vercel.json)
{
  "crons": [{ "path": "/api/health", "schedule": "*/4 * * * *" }]
}
```

### 2. Connection limit
Free plan: **5 concurrent connections** (pooled สูงสุด 10,000 แต่ un-pooled 5)
Pro plan: ขึ้นกับ compute size — เริ่มจาก 112 connections

payMap ตอนนี้ไม่มีปัญหาบน free plan แต่ถ้า users เกิน 500 active พร้อมกัน ควร upgrade

### 3. Storage pricing
Free plan: **0.5 GB storage** (จะเต็มเร็วถ้า Transaction table โตไม่หยุด)

ประมาณการ:
- 1 Transaction ≈ 200 bytes
- 100,000 transactions ≈ 20 MB
- 1,000,000 transactions ≈ 200 MB

เมื่อ users เกิน ~10,000 คน storage เริ่มน่าเป็นห่วง

### 4. Region
Neon free plan มีแค่ us-east-1 — latency จากไทยประมาณ **200–250ms** สำหรับทุก query

**วิธีแก้ระยะยาว:** Upgrade เป็น paid plan แล้วเลือก `ap-southeast-1` (Singapore) latency จะลดเหลือ **5–20ms**

---

## เปรียบเทียบกับทางเลือกอื่น

| | Neon Free | Neon Pro | Supabase | PlanetScale | Railway |
|---|---|---|---|---|---|
| **Price** | ฟรี | $19/mo | ฟรี/$25 | ฟรี/$39 | $5/mo+ |
| **Region TH/SG** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Branching** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Cold start** | ⚠️ 1-3s | ✅ Always-on opt. | ✅ | ✅ | ✅ |
| **Prisma compat** | ✅ | ✅ | ✅ | ⚠️ Vitess | ✅ |
| **Max storage free** | 0.5 GB | Unlimited | 500 MB | 5 GB | 1 GB |

---

## คำแนะนำสำหรับ payMap แต่ละ stage

### Stage 1: Dev / Beta (< 500 users)
**ใช้ Neon Free ต่อได้** — เพียงพอ เพิ่ม `/api/health` ping ป้องกัน cold start

### Stage 2: Early production (500–5,000 users)
**Upgrade Neon Pro ($19/mo)** และเปลี่ยน region เป็น Singapore — latency ลดจาก 250ms เหลือ 15ms ราคาคุ้มมาก

### Stage 3: Scale (5,000+ users / > 1M transactions)
พิจารณา:
1. **Neon Pro + Read Replicas** สำหรับ dashboard queries
2. **Redis (Upstash)** สำหรับ rate limiting และ notification polling cache
3. หรือ **Supabase Pro** ถ้าต้องการ Realtime subscriptions สำหรับ notification

---

## สรุป

Neon ดีพอสำหรับ payMap ในขณะนี้ แต่มี 2 เรื่องที่ต้องทำก่อน production:

1. **เพิ่ม keep-alive ping** ป้องกัน cold start 3 วินาที
2. **วางแผน upgrade region** เป็น Singapore เมื่อมี paying users จริง

ฐานข้อมูลไม่ใช่ bottleneck ของ payMap ตอนนี้ — bottleneck คือ query optimization และ index ที่ทำไปใน v1.9 นี้แล้ว
