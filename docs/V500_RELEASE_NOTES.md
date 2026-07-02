# PayMap v5.0.0 — Release Notes

วันที่: March 2026

## ภาพรวม

v5 คือการ upgrade จาก v4.x ไปสู่ **Production-grade Financial Platform** โดยรวม:
- v4.1 Bug Fixes (Redis, CRON, ModeSwitcher)
- v4.2.1 R2 Upload Pack (image upload ครบทุกส่วน)
- v5 Production Architecture (Accounting Engine, Worker Queue, Plugin System)

---

## ✅ สิ่งที่แก้จาก v4.1

### Bug #1 — Redis URL ผิดรูปแบบ (Critical)
- **ก่อน:** `REDIS_URL=redis-cli --tls -u redis://...`
- **หลัง:** `REDIS_URL=rediss://...`
- ผล: Rate limiting ทำงานจริงข้ามทุก serverless instance

### Bug #2 — ขาด CRON_SECRET
- เพิ่ม `CRON_SECRET` ใน `.env` พร้อม comment แนะนำการตั้งค่า
- ผล: `/api/notifications/renewal` ส่ง email reminder ได้ถูกต้อง

### Bug #3 — Duplicate Stripe folder
- ลบ folder `src/app/api/stripe/{webhook,checkout,portal,plans}/` ที่ทำให้ Next.js route conflict

### Bug #4 — ModeSwitcher วนซ้ำ onboarding
- แก้ให้ส่ง `?next=` param ตอน redirect ไปสมัคร mode ใหม่
- ผล: สมัครเสร็จแล้วกลับมาหน้า mode ที่เลือกโดยตรง

---

## 🆕 v4.2.1 — R2 Upload Pack

### ไฟล์ใหม่
| ไฟล์ | ความสามารถ |
|------|-----------|
| `src/lib/r2.ts` | เพิ่ม upload categories ครบ: storeLogos, storeBanners, productImages, payProfileImages, payProfileCovers, userBackgrounds |
| `src/app/api/upload/route.ts` | รองรับ category ใหม่ + security fix (isOwnedKey) |
| `src/components/ui/ImageUploadButton.tsx` | Component อัปโหลดรูปพร้อมใช้งาน |
| `src/app/api/merchant/stores/[id]/branding/route.ts` | PATCH logo/banner/theme ร้าน |
| `src/app/api/merchant/products/[id]/image/route.ts` | PATCH รูปสินค้า |
| `src/app/api/pay-profile/assets/route.ts` | PATCH รูป Pay Profile |
| `prisma/migration_v421_r2_branding.sql` | เพิ่ม column branding ใน stores |

### วิธีใช้ ImageUploadButton
```tsx
<ImageUploadButton
  category="storeLogos"
  linkedId={store.id}
  linkedType="store"
  label="อัปโหลดโลโก้ร้าน"
  onUploaded={async ({ url }) => {
    await fetch(`/api/merchant/stores/${store.id}/branding`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl: url }),
    })
  }}
/>
```

---

## 🚀 v5.0.0 — Production Architecture

### 1. Accounting Engine (`src/lib/accounting/`)

Double-entry bookkeeping ระดับ production:

```ts
import { createJournalEntry, getTrialBalance } from "@/lib/accounting/engine"

// สร้าง journal entry
await createJournalEntry({
  userId: user.id,
  description: "ขายสินค้า",
  lines: [
    { accountId: cashAccountId,    debit:  1000 },
    { accountId: revenueAccountId, credit: 1000 },
  ],
})

// ดู trial balance
const balance = await getTrialBalance(user.id)
```

**APIs:**
- `POST /api/accounting/journal` — สร้าง journal entry
- `GET  /api/accounting/journal` — list entries
- `GET  /api/accounting/ledger?trial=1` — trial balance
- `GET  /api/accounting/ledger?accountId=xxx` — account detail
- `POST /api/accounting/ledger` — สร้าง chart of account
- `POST /api/accounting/reconcile` — จับคู่ bank statement

### 2. Chart of Accounts มาตรฐาน Thai SME

```
1xxx — Assets      (เงินสด, เงินฝาก, ลูกหนี้, สินค้า, สินทรัพย์ถาวร)
2xxx — Liabilities (เจ้าหนี้, เงินกู้, VAT ค้างจ่าย, เงินเดือนค้างจ่าย)
3xxx — Equity      (ทุน, กำไรสะสม)
4xxx — Revenue     (รายได้ขาย, รายได้บริการ, รายได้อื่น)
5xxx — Expenses    (ต้นทุน, เงินเดือน, ค่าเช่า, สาธารณูปโภค)
```

### 3. Background Worker Queue (`src/lib/queue/`)

```ts
import { enqueueJob } from "@/lib/queue/worker"

// เพิ่ม job เข้า queue
const jobId = await enqueueJob("payroll_calculate", { userId, month: "2026-03" })

// ตรวจสอบ status
GET /api/worker?jobId=xxx
```

Job types: `payroll_calculate`, `report_generate`, `email_batch`, `reconcile_bank`, `journal_auto`, `export_csv`

### 4. Plugin System (`src/lib/plugins/`)

```ts
import { registerPlugin, dispatchHook } from "@/lib/plugins/registry"

registerPlugin({
  manifest: { name: "my-plugin", version: "1.0.0", hooks: ["onTransaction"] },
  onTransaction: async (tx) => {
    // ส่ง webhook, sync กับ ERP ฯลฯ
    await fetch("https://my-erp.com/webhook", { method: "POST", body: JSON.stringify(tx) })
  },
})

// DispatchจากAPI
await dispatchHook("onTransaction", { id: tx.id, amount: tx.amount })
```

### 5. Bank Reconciliation

```ts
POST /api/accounting/reconcile

{
  "fromDate": "2026-03-01",
  "toDate":   "2026-03-31",
  "bankTxs": [
    { "date": "2026-03-15", "description": "โอนเงิน", "amount": 5000, "type": "credit" }
  ]
}

// Response
{
  "summary": {
    "bankTxCount": 45,
    "matchedCount": 42,
    "matchRate": 93
  },
  "matched": [...],
  "unmatchedBank": [...],
  "unmatchedPaymap": [...]
}
```

---

## 🗄️ Database Migration

รัน migration ตามลำดับ:

```bash
# 1. v4.2.1 R2 branding
psql "$DATABASE_URL" -f prisma/migration_v421_r2_branding.sql

# 2. v5 Accounting Engine (ครอบคลุม v4.2.1 ด้วย)
psql "$DATABASE_URL" -f prisma/migration_v500_accounting.sql

# 3. Regenerate Prisma client
npx prisma generate
```

---

## ⚙️ Environment Variables ใหม่

```env
# แก้ไขแล้วใน v5 (ต้องตรวจสอบว่าอัปเดตแล้ว)
REDIS_URL=rediss://...              # ✅ แก้ format จาก redis-cli เป็น rediss://

# เพิ่มใหม่
CRON_SECRET=your-random-secret      # ⚠️ ต้องตั้งค่าจริงใน Vercel
R2_PUBLIC_URL=https://pub-xxx.r2.dev # ⚠️ ต้องเป็น public domain จาก Cloudflare
```

---

## 🔧 Vercel Cron Jobs

เพิ่มใน `vercel.json` แล้ว:

| Path | Schedule | Description |
|------|----------|-------------|
| `/api/notifications/renewal` | ทุก 9:00 น. | แจ้งเตือน subscription ใกล้หมด |
| `/api/worker` | ทุก 5 นาที | drain background job queue |

---

## Roadmap ถัดไป

- **v5.1** — Profit & Loss Statement, Balance Sheet auto-generate
- **v5.2** — ePP (e-Payment Provider) integration
- **v5.3** — Multi-org / Multi-branch support
- **v5.4** — Full ERP module (Purchase Order, Sales Order)
