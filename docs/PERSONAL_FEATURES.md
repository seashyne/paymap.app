# payMap Personal — Feature Guide

## ✅ Features ที่เพิ่มมาใหม่

### 1. Budget Planner
ตั้งวงเงินต่อ category ต่อเดือน ดู % การใช้จ่ายจริง

**API:**
- `GET  /api/budget?year=2025&month=3` — ดู budgets พร้อม spent จริง
- `POST /api/budget`                   — สร้าง/อัปเดต budget (upsert)
- `DELETE /api/budget/[id]`            — ลบ budget

### 2. Savings Goals
สร้างเป้าหมายออมเงิน ฝากเงินสะสม ดู progress

**API:**
- `GET  /api/savings`              — ดู goals ทั้งหมด
- `POST /api/savings`              — สร้าง goal ใหม่
- `PATCH /api/savings/[id]`        — แก้ไข goal
- `DELETE /api/savings/[id]`       — ลบ goal
- `POST /api/savings/[id]/deposit` — ฝากเงิน

### 3. Subscription Tracker
ติดตาม Netflix, Spotify ฯลฯ คำนวณค่าใช้จ่ายรายเดือน แจ้งเตือนก่อนชำระ 7 วัน

**API:**
- `GET  /api/subscriptions`        — ดู subscriptions + monthly total
- `POST /api/subscriptions`        — เพิ่มใหม่
- `PATCH /api/subscriptions/[id]`  — แก้ไข (รวม pause/cancel)
- `DELETE /api/subscriptions/[id]` — ลบ

### 4. Tax Calculator (ภ.ง.ด.90/91)
คำนวณภาษีตามอัตราขั้นบันได 2567 + คำแนะนำลดหย่อน

**API:**
- `POST /api/tax` — ส่ง income + deductions → รับผลคำนวณ + คำแนะนำ

**รองรับค่าลดหย่อน:**
- ส่วนตัว 60,000 / คู่สมรส / บุตร / ดูแลพ่อแม่
- ประกันชีวิต (max 100,000) / ประกันสุขภาพ (max 25,000)
- ประกันสังคม (max 9,000)
- SSF (max 200,000) / RMF (30% ของรายได้, max 500,000)
- เงินบริจาค (2x, max 10% รายได้สุทธิ)
- ดอกเบี้ยบ้าน (max 100,000)

### 5. Dashboard Chart
- Cashflow bar chart 6 เดือนย้อนหลัง
- Donut chart รายจ่ายตามหมวดหมู่
- Budget progress bars + alert
- Savings goals widget
- Subscription summary

### 6. Export
- `GET /api/export?format=csv&type=transactions&year=2025&month=3`
- `GET /api/export?format=json&type=transactions`
- `GET /api/export?format=csv&type=subscriptions`
- รองรับ Excel (UTF-8 BOM สำหรับภาษาไทย)

## Setup หลัง unzip

```bash
# 1. รัน Docker PostgreSQL
docker compose up -d

# 2. Generate Prisma client + sync schema
npx prisma generate
npx prisma db push

# 3. Seed ข้อมูลทดสอบ
npm run db:seed

# 4. รัน dev
npm run dev
```

## Demo Login
```
Email:    demo@paymap.th
Password: Demo1234
```

## โครงสร้าง Database ใหม่
```
budgets          — วงเงิน budget ต่อ category/เดือน
savings_goals    — เป้าหมายออมเงิน
savings_deposits — ประวัติการฝากเงิน
subscriptions    — ติดตามค่าบริการรายเดือน
```
