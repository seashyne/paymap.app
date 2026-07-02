# payMap v2.1 — Developer & Operations Guide
> Domain: **paymap.app** | Stack: Next.js 14 · PostgreSQL (Neon) · Firebase Auth · Cloudflare R2 · Stripe · Anthropic Claude

---

## Quick Start (Local Dev)

```bash
cd paymap-v21
npm install
cp .env.local.example .env.local   # fill in your keys (see below)
npx prisma db push                  # sync schema to Neon
npm run db:seed                     # optional: create demo accounts
npm run dev                         # → http://localhost:3000
```

---

## Environment Variables

ไฟล์ `.env.local` — **อย่า commit ไฟล์นี้ขึ้น Git ทุกกรณี**

### Core (Required)

| Variable | Where to get | Description |
|---|---|---|
| `DATABASE_URL` | [neon.tech](https://neon.tech) Dashboard | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | JWT signing secret |
| `NEXTAUTH_URL` | `https://paymap.app` | App base URL |
| `NEXT_PUBLIC_APP_URL` | `https://paymap.app` | Public URL |

### Firebase Auth (Required)

| Variable | Where to get |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console > Project Settings > General |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Console |
| `FIREBASE_PRIVATE_KEY` | Firebase Console > Service Accounts > Generate Key |
| `FIREBASE_CLIENT_EMAIL` | Same JSON file |

### Anthropic AI (Required for AI Advisor)

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```
- ขอได้ที่ [console.anthropic.com](https://console.anthropic.com/settings/keys)
- Free users: 3 messages/day (preview)
- Pro/AI Add-on: 300 messages/hour

### Cloudflare R2 Storage (Required for file uploads)

```env
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=paymap-uploads
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

**วิธีตั้งค่า R2:**
1. ไปที่ [dash.cloudflare.com](https://dash.cloudflare.com) → R2 Object Storage
2. สร้าง Bucket ชื่อ `paymap-uploads`
3. ตั้ง CORS policy ใน bucket settings:
```json
[
  {
    "AllowedOrigins": ["https://paymap.app", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```
4. สร้าง API Token: R2 > Manage R2 API Tokens > Create Token (Object Read & Write)
5. Copy Account ID จาก Overview

**Public URL:** ไปที่ bucket > Settings > Enable R2.dev subdomain หรือเชื่อม custom domain

### Stripe (Required for payments)

```env
STRIPE_SECRET_KEY=sk_live_xxxxx           # หรือ sk_test_ สำหรับ dev
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Price IDs (สร้างใน Stripe Dashboard > Products)
STRIPE_PRICE_PRO_MONTHLY=price_xxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxx
STRIPE_PRICE_AI_ADVISOR_MONTHLY=price_xxxx
STRIPE_PRICE_AI_ADVISOR_YEARLY=price_xxxx
```

**วิธีสร้าง Products ใน Stripe:**
1. Stripe Dashboard > Products > Add Product
2. สร้าง "Pro Plan": ฿149/month recurring, ฿1,490/year recurring
3. สร้าง "AI Advisor": ฿99/month recurring, ฿990/year recurring
4. Copy Price IDs ใส่ .env.local

**Webhook setup:**
```bash
# Local testing
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Production: Stripe Dashboard > Webhooks > Add endpoint
# URL: https://paymap.app/api/stripe/webhook
# Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
```

---

## Pricing Model (v2.1)

### Free Plan (฿0)
- ทุก workspace เข้าได้ (Personal, Business, Merchant)
- Transactions: 200/เดือน
- Budget: 6 หมวด, Goals: 3 เป้า
- Storage: 100 MB (R2)
- AI Advisor: 3 messages/day (preview)
- Business: พนักงาน 5 คน, Payroll 2 ครั้ง
- Merchant: SKU 50 รายการ, ออเดอร์ 100/เดือน

### Pro Plan (฿149/เดือน)
- ทุกอย่างไม่จำกัด
- Storage: 5 GB
- Business: พนักงาน 100 คน + Bank file export
- Merchant: SKU ไม่จำกัด + VAT e-Filing

### AI Advisor Add-on (฿99/เดือน)
- ใช้ได้ทั้ง Free และ Pro
- AI ตอบจากข้อมูลจริงของ user
- ไม่จำกัดจำนวนครั้ง (300/ชั่วโมง)

---

## Architecture

```
paymap.app (Vercel)
├── Next.js 14 App Router
├── src/app/
│   ├── (public)/         landing, pricing, login, register
│   ├── dashboard/        Personal workspace
│   ├── business/         Business workspace (HR, Payroll)
│   ├── merchant/         Merchant workspace (POS, Inventory)
│   ├── settings/, billing/, profile/
│   └── api/
│       ├── auth/          Firebase session
│       ├── transactions/  CRUD + soft delete
│       ├── budget/        Budget CRUD
│       ├── savings/       Goals CRUD + deposit
│       ├── subscriptions/ Subscriptions CRUD
│       ├── tax/           Multi-country tax calculator (18+ countries)
│       ├── upload/        Cloudflare R2 file uploads
│       ├── ai/advisor/    Claude Sonnet AI chat
│       ├── ai/forecast/   Smart budget forecast (pure math)
│       ├── business/      Employees, Payroll, Leave
│       ├── merchant/      Products, Sales, Stores
│       └── stripe/        Checkout, Webhook, Portal
├── src/lib/
│   ├── authz.ts           Auth + access control
│   ├── prisma.ts          DB client
│   ├── r2.ts              Cloudflare R2 storage
│   ├── stripe.ts          Stripe + plan limits
│   ├── tax/               Tax engines (TH, SG, MY, JP, US, GB, AU, DE + 10 more)
│   └── business/          Payroll calculator, plan limits
└── prisma/schema.prisma   Full DB schema
```

### Database (Neon PostgreSQL)

```bash
# Apply schema changes
npx prisma db push

# Run migration SQL (for production)
psql $DATABASE_URL < prisma/migration_v19.sql

# Open Prisma Studio (DB browser)
npx prisma studio
```

**Key models:**
- `User` — accounts, plan, currency, country
- `Transaction` — income/expense, soft delete, receiptUrl (R2)
- `Budget` — monthly limits by category
- `SavingsGoal` — savings targets + deposit history
- `Subscription` — recurring expenses tracking
- `Organization` + `Employee` + `PayrollRun` — Business workspace
- `Store` + `MerchantProduct` + `SalesOrder` — Merchant workspace
- `ProductSubscription` — Stripe subscription records

---

## Workspace Features

### Personal Dashboard
- **QuickAdd** — บันทึกรายรับ/รายจ่ายด่วน
- **Budget Panel** — ตั้งงบรายหมวด + progress bar
- **Goals Panel** — เป้าออม + ฝากเงิน
- **Subscriptions** — ติดตาม subscriptions + due soon alert
- **Tax Calculator** — 18+ ประเทศ รองรับ SSF/RMF/หักหย่อน
- **AI Advisor** — chat กับ Claude รู้ข้อมูลการเงินของ user
- **PromptPay QR** — สร้าง QR จาก ID/เบอร์

### Business Dashboard
- **Employees Tab** — เพิ่ม/แก้ไข/ลบพนักงาน, CRUD ผ่าน `/api/business/employees`
- **Payroll Tab** — คำนวณ payroll เดือนนี้ผ่าน `/api/business/payroll`
  - ใช้ `calculatePayroll()` จาก `src/lib/business/payroll.ts`
  - คำนวณ: Gross, WHT (ภ.ง.ด.1), SSO (สปส.), Net
- **Leave Tab** — บันทึกคำขอลา (พักร้อน/ป่วย/กิจ/คลอด/บวช)
- **Onboarding** — สร้างองค์กรครั้งแรก

### Merchant Dashboard
- **Inventory** — เพิ่ม/แก้ไข/ลบสินค้า, ค้นหา, แจ้งเตือนสต็อกต่ำ
- **POS Tab** — ระบบขายหน้าร้านแบบ real-time
  - เลือกสินค้า → เพิ่มตะกร้า → เลือกวิธีชำระ → checkout
  - บันทึกผ่าน `/api/merchant/sales` — ตัด stock อัตโนมัติ
  - รองรับ: เงินสด, QR/PromptPay, โอน, บัตร
  - แสดง receipt modal หลัง checkout
- **Reports** — revenue, ต้นทุน, กำไรขั้นต้น, top products chart

---

## File Upload (R2)

```typescript
// Frontend — upload receipt to transaction
const formData = new FormData();
formData.append("file", file);
formData.append("category", "receipts");
formData.append("linkedId", transactionId);
formData.append("linkedType", "transaction");

const res = await fetch("/api/upload", { method: "POST", body: formData });
const { url, key } = await res.json();
```

**Categories:** `receipts` | `invoices` | `avatars` | `documents` | `exports`

**Limits by category:**
| Category | Max size | Allowed types |
|---|---|---|
| receipts | 5 MB | JPEG, PNG, WebP, PDF |
| invoices | 10 MB | PDF, JPEG, PNG |
| avatars | 2 MB | JPEG, PNG, WebP |
| documents | 20 MB | PDF, JPEG, PNG, CSV |
| exports | 50 MB | CSV, JSON, PDF |

---

## AI Advisor

### How it works
1. User ส่งข้อความผ่าน `AdvisorChat` component
2. `/api/ai/advisor` ดึงข้อมูลจริงของ user จาก DB:
   - รายรับ/รายจ่ายเดือนนี้
   - Budget status (ใช้ไปกี่ %)
   - เป้าออมทุกรายการ
   - Subscriptions ที่ active
   - Transaction 6 รายการล่าสุด
3. ส่งให้ Claude Sonnet พร้อม context ข้างต้น
4. Claude ตอบเป็นภาษาไทย ≤200 คำ actionable

### Rate limits
| Plan | Limit | Window |
|---|---|---|
| Free | 3 messages | 24 ชั่วโมง |
| Pro / AI Add-on | 300 messages | 1 ชั่วโมง |

### Error handling
- ไม่มี `ANTHROPIC_API_KEY` → แสดง setup error พร้อม hint
- เกินโควต้า Free → แสดง upgrade prompt พร้อมลิงก์ pricing

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add ANTHROPIC_API_KEY
vercel env add DATABASE_URL
# ... (ทำซ้ำสำหรับทุก variable ใน .env.local)
```

**Vercel project settings:**
- Framework: Next.js
- Build command: `npm run build`
- Root directory: `/`
- Node version: 18.x

**Required env vars in Vercel dashboard:**
ทุก variable ใน `.env.local` ยกเว้น `NEXT_PUBLIC_*` ที่ต้องตั้งด้วยเช่นกัน

---

## Custom Domain (paymap.app)

1. Vercel Dashboard > Domains > Add `paymap.app`
2. Cloudflare DNS:
   ```
   A     paymap.app       76.76.21.21
   CNAME www.paymap.app   cname.vercel-dns.com
   ```
3. ปิด Cloudflare proxy (orange cloud → gray) สำหรับ Vercel SSL

---

## Security Notes

⚠️ **PENDING สำหรับ production:**

1. **bankAccount/taxId encryption** — ยังเก็บเป็น plaintext ใน DB
   ```typescript
   // TODO: encrypt sensitive employee fields
   import { encrypt, decrypt } from "@/lib/crypto"
   ```

2. **JWT tokenVersion** — ยังไม่มี forced logout mechanism
   ```sql
   ALTER TABLE users ADD COLUMN "tokenVersion" INTEGER DEFAULT 0;
   ```

3. **R2 access control** — ตรวจสอบว่า R2 bucket ไม่ได้ตั้งเป็น public ทั้งหมด
   - ควรใช้ presigned URLs แทน public URL สำหรับข้อมูลส่วนตัว

---

## Demo Accounts

| Email | Password | Workspace |
|---|---|---|
| `demo@paymap.th` | `Demo1234` | Personal |
| `biz@paymap.th` | `Demo1234` | Business |
| `shop@paymap.th` | `Demo1234` | Merchant |
| `admin@paymap.th` | `Demo1234` | Admin |

Demo without login: `/demo/personal`, `/demo/business`, `/demo/merchant`

---

## Common Issues & Fixes

### "handleRefresh is not defined"
→ Fixed in v2.1: `WorkspaceOverview` ใช้ `onRefresh` prop แทน

### "toast is undefined"
→ Fixed in v2.1: เปลี่ยน `const { toast } = useToast()` เป็น `const toast = useToast()`

### AI Advisor returns 503
→ เพิ่ม `ANTHROPIC_API_KEY` ใน `.env.local` หรือ Vercel environment variables

### R2 upload returns 503
→ เพิ่ม `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` ใน env

### Business/Merchant "ยังไม่มีองค์กร/ร้านค้า"
→ กดปุ่ม "สร้างองค์กร" หรือ "สร้างร้านค้า" บนหน้า dashboard → กรอกชื่อ → confirm

### Stripe webhook fails locally
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the webhook secret → STRIPE_WEBHOOK_SECRET ใน .env.local
```

---

## Changelog

### v2.1 (Current)
- ✅ Free access to ALL workspaces (Personal, Business, Merchant)
- ✅ New pricing: Free / Pro ฿149 / AI Advisor add-on ฿99
- ✅ Cloudflare R2 storage library (`src/lib/r2.ts`) + upload API
- ✅ AI Advisor: fixed Anthropic API key header, plan-based rate limits
- ✅ Business: working create org modal, add employee, run payroll, leave requests
- ✅ Merchant: working create store modal, functional POS with cart + checkout, add product
- ✅ Bug fix: `handleRefresh is not defined` (scope issue in WorkspaceOverview)
- ✅ Bug fix: `toast` undefined (wrong destructuring pattern)
- ✅ New Logo component (`src/components/ui/Logo.tsx`) with SVG mark

### v2.0
- Login workspace selector (split-screen Personal/Business/Merchant)
- Multi-country tax engine (8 real engines: TH/SG/MY/JP/US/GB/AU/DE)
- Interactive CRUD: Budget, Goals, Subscriptions, Transactions
- PromptPay GET API

### v1.9
- Schema enums + soft delete (6 models)
- Apple Sign-In
- YNAB-style landing page

---

*สร้างโดย payMap Engineering · paymap.app*
