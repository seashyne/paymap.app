# PayMap v6.0 — Public Launch Readiness Pass

รอบนี้โฟกัสก่อนเปิด public SaaS จริง โดยเก็บ 7 ส่วนหลัก

1. Onboarding final polish
2. Pricing clarity
3. Help center / support entry points
4. Legal center และ public legal routes
5. Error states สำหรับ App Router
6. Conversion flow บน landing / pricing / register
7. Deploy checklist ก่อนเปิดใช้งานจริง

## ไฟล์สำคัญที่เพิ่ม/แก้

- `src/lib/app-version.ts`
- `src/app/layout.tsx`
- `src/app/help/page.tsx`
- `src/app/legal/page.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/page.tsx`
- `src/app/pricing/page.tsx`
- `src/app/register/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/onboarding/OnboardingClient.tsx`
- `README.md`

## Deploy checklist

### Environment
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `R2_*` สำหรับ file upload
- email provider / Resend ถ้ามี

### Database
```bash
npx prisma generate
npx prisma db push
```

### Local verification
```bash
npm install
npm run build
npm run start
```

### Stripe
- เปิด checkout ได้
- webhook `/api/stripe/webhook` รับ event ได้
- purchase history แสดงผลหลังชำระสำเร็จ
- customer portal กลับเข้าระบบได้

### Launch QA
- `/`
- `/pricing`
- `/register`
- `/onboarding`
- `/help`
- `/legal`
- `/terms`
- `/privacy`
- `/dashboard`
- `/billing`

### Conversion pass
- ปุ่ม CTA มีทั้งหน้าแรก, pricing, help
- ผู้ใช้ฟรีรู้ทันทีว่าเริ่มได้โดยไม่ต้องใส่บัตร
- ผู้ใช้ที่ถูกล็อก feature ถูกพาไป pricing ได้ถูก section
