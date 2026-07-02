# payMap v1.8 — Performance Fixes + จุดเด่นใหม่ 3 อย่าง

## 🔧 แก้ปัญหาที่เจอ

### Performance (DB)
| ปัญหา | วิธีแก้ | ผลลัพธ์ |
|---|---|---|
| N+1: 6 query แยกสำหรับ chart | query เดียว filter ใน JS | -5 DB round-trips ต่อ load |
| `allTimeAgg` full table scan | จำกัด 24 เดือน | ไม่ช้าขึ้นเรื่อยๆ ตามข้อมูล |
| Business page: 3 sequential await | `Promise.all()` parallel | -100~200ms ต่อ page load |
| Missing composite index | เพิ่ม `(userId, categoryId, type, happenedAt)` | Budget alert query เร็วขึ้น |
| Notification index | เพิ่ม `(userId, createdAt)` | Polling 30s เบาลง |

### UX Fixes
- **QuickAdd → Dashboard refresh** — `paymap:tx-added` event เชื่อม `router.refresh()` แล้ว ตัวเลขอัปเดตทันทีหลังเพิ่มรายการ
- **Business Onboarding Wizard** — ไม่มี "ยังไม่มีองค์กร" อีกแล้ว มี wizard 3 step พาผ่านตั้งแต่แรก
- **Server/Client split** — AppShell.tsx แก้ถูกต้อง, ThemeToggle/Bell/QuickAdd ไม่ crash อีก

## ✨ จุดเด่นใหม่

### 1. AI Financial Advisor (Cmd+K chat)
- Chat floating button มุมขวาล่าง — ถามเรื่องการเงินได้เลย
- Claude Sonnet รู้ข้อมูลจริง: income, expense, budget %, goals, subscriptions ของ user
- Rate limit 20 ข้อความ/ชั่วโมง ไม่เปลืองโควต้า
- Suggested questions, typing indicator, minimize/close
- **File**: `src/components/ai/AdvisorChat.tsx`, `src/app/api/ai/advisor/route.ts`

### 2. PromptPay QR Generator
- สร้าง QR รับเงินมาตรฐาน EMVCo PromptPay ในเบราว์เซอร์
- รองรับ: เบอร์โทร, เลขบัตรประชาชน, เลขนิติบุคคล
- ระบุยอดเงินหรือปล่อยให้ผู้โอนกรอกเองได้
- Download PNG, Copy EMVCo payload string
- ไม่ใช้ API ภายนอก — CRC-16 CCITT คำนวณใน server
- **Tab ใหม่**: Personal → PromptPay
- **File**: `src/components/ui/PromptPayQR.tsx`, `src/app/api/promptpay/route.ts`

### 3. Smart Budget Forecast
- คาดการณ์ยอดรายจ่ายสิ้นเดือน จาก daily spending rate + 3 เดือนย้อนหลัง
- แสดง dual-bar: สีทึบ = ใช้จริง, สีจาง = คาด
- Insight text อัตโนมัติ: แจ้งหมวดที่เสี่ยงเกิน, แนะนำโอนออม
- ไม่ใช้ AI API — pure math, เร็วและฟรี
- **Widget**: Personal Dashboard > Overview
- **File**: `src/components/dashboard/BudgetForecast.tsx`, `src/app/api/ai/forecast/route.ts`

### 4. Global Search (Cmd+K)
- Search bar ใน header — keyboard shortcut Cmd+K / Ctrl+K
- ค้นรายการ, เป้าออม, subscription, พนักงาน, invoice ในครั้งเดียว
- Navigation suggestions: พิมพ์ "payroll" → กด Enter → ไป /business
- Keyboard navigation ↑↓↵, grouped results, debounce 280ms
- **File**: `src/components/ui/GlobalSearch.tsx`, `src/app/api/search/route.ts`

## ไฟล์ที่เปลี่ยน/เพิ่ม
```
src/components/ai/AdvisorChat.tsx          NEW
src/components/ui/PromptPayQR.tsx          NEW  
src/components/ui/GlobalSearch.tsx         NEW
src/components/dashboard/BudgetForecast.tsx NEW
src/app/api/ai/advisor/route.ts            NEW
src/app/api/ai/forecast/route.ts           NEW
src/app/api/promptpay/route.ts             NEW
src/app/api/search/route.ts               NEW
src/components/layout/AppShell.tsx         UPDATED (GlobalSearch, AdvisorChat)
src/components/dashboard/DashboardClient.tsx UPDATED (+PromptPay tab, +BudgetForecast, +QrCode)
src/app/business/page.tsx                  UPDATED (parallel queries, OnboardingWizard)
src/lib/dashboard-data.ts                  UPDATED (N+1 fix, allTimeAgg fix)
prisma/schema.prisma                       UPDATED (2 composite indexes)
src/middleware.ts                          UPDATED (protect /api/ai, /api/search, /api/promptpay)
```

## Quick Start (ยังเหมือนเดิม)
```bash
docker compose up -d
cp .env.local .env
npm install
npx prisma db push    # picks up new indexes
npm run db:seed
npm run dev
# demo@paymap.th / Demo1234
```
