# payMap v0.3 — Stripe + Multi-Currency Setup Guide

## สิ่งที่เพิ่มมาใน v0.3

### 🌍 Multi-Currency (30+ currencies)
| ไฟล์ | รายละเอียด |
|---|---|
| `src/lib/i18n/currencies.ts` | 30+ สกุลเงิน + `formatMoney(amount, currency)` dynamic |
| `src/lib/i18n/countries.ts` | 18 ประเทศ — flag, currency, locale, timezone |
| `src/app/api/user/locale/route.ts` | GET/PATCH locale settings |
| `src/lib/format.ts` | Re-export จาก i18n (backward compat) |

User เลือก country/currency ได้ → format อัตโนมัติตาม locale

### 💳 Stripe Subscription
| ไฟล์ | รายละเอียด |
|---|---|
| `src/lib/stripe.ts` | Singleton + PLAN_LIMITS + STRIPE_PRICES |
| `src/app/api/stripe/checkout/route.ts` | สร้าง Checkout Session |
| `src/app/api/stripe/portal/route.ts` | Customer Portal (manage/cancel) |
| `src/app/api/stripe/webhook/route.ts` | Webhook handler |
| `src/app/api/stripe/plans/route.ts` | Plan info API |
| `src/app/pricing/page.tsx` | หน้า Pricing |
| `src/app/billing/page.tsx` | หน้า Billing + ประวัติชำระเงิน |
| `src/components/billing/BillingClient.tsx` | Billing UI |

### 🗃️ DB Changes
User เพิ่ม: `country`, `currency`, `locale`, `timezone`, `stripeCustomerId`
Transaction/Budget/SavingsGoal/Subscription เพิ่ม: `currency`
Tables ใหม่: `stripe_subscriptions`, `stripe_payments`

### ✅ Bug fixes
- Email ส่งจริงผ่าน Resend (ไม่ใช่แค่ console.log)
- Change password implement จริง
- Bootstrap: 14 categories (เพิ่มจาก 6)
- Tax engine: แยก folder รองรับหลายประเทศ

---

## Plan Limits

| Feature | Free | Pro | Family |
|---|---|---|---|
| Transactions | 50/เดือน | ∞ | ∞ |
| Budgets | 3 | 99 | 99 |
| Goals | 2 | 99 | 99 |
| Export | ❌ | ✅ | ✅ |
| Multi-currency | ❌ | ✅ | ✅ |

---

## Setup Stripe (ขั้นตอน)

### 1. สมัคร + Activate
https://stripe.com → Sign up → activate account (ใส่ bank/business info)

### 2. สร้าง Products + Prices
Dashboard → Products → Add Product

**payMap Pro**
- ฿149/month → copy Price ID → `STRIPE_PRICE_PRO_MONTHLY`
- ฿990/year  → copy Price ID → `STRIPE_PRICE_PRO_YEARLY`

**payMap Family**
- ฿299/month → copy Price ID → `STRIPE_PRICE_FAMILY_MONTHLY`
- ฿1,990/year → copy Price ID → `STRIPE_PRICE_FAMILY_YEARLY`

### 3. API Keys
Developers → API Keys:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Webhook
Developers → Webhooks → Add endpoint

URL: `https://yourdomain.com/api/stripe/webhook`

Events:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. Test Local Webhook
```bash
brew install stripe/stripe-cli/stripe
stripe login
npm run stripe:listen
```

### 6. Customer Portal
Dashboard → Settings → Customer portal → Activate session

---

## Setup Resend (Email)

1. https://resend.com → sign up
2. Add domain → DNS verify
3. API Keys → Create key
```
RESEND_API_KEY=re_...
EMAIL_FROM="payMap <noreply@yourdomain.com>"
```

---

## DB Migration

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

---

## User Locale API

```bash
# ดู locale ปัจจุบัน
GET /api/user/locale

# เปลี่ยนประเทศ / สกุลเงิน
PATCH /api/user/locale
{ "country": "SG", "currency": "SGD", "locale": "en-SG", "timezone": "Asia/Singapore" }
```

---

## เพิ่ม Tax Engine ประเทศใหม่

1. สร้าง `src/lib/tax/SG.ts` export `SG_TaxEngine(input): TaxResult`
2. เพิ่มใน `src/lib/tax/index.ts`:
```ts
case "SG": return SG_TaxEngine(input)
```
