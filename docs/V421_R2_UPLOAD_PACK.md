# PayMap v4.2.1 — R2 Upload Pack

แพ็กนี้เพิ่ม R2 upload ให้ครบทุกส่วนที่มีการอัปโหลดหรือเปลี่ยนรูปได้จริง

## ส่วนที่รองรับ
- รูปโปรไฟล์ผู้ใช้ (`avatars`)
- พื้นหลังผู้ใช้ (`userBackgrounds`)
- โลโกร้าน (`storeLogos`)
- แบนเนอร์ร้าน (`storeBanners`)
- รูปสินค้า (`productImages`)
- รูป Pay Profile (`payProfileImages`)
- รูปพื้นหลัง Pay Profile (`payProfileCovers`)
- รูปใบเสร็จ/เอกสารเดิม

## ไฟล์สำคัญ
- `src/lib/r2.ts`
- `src/app/api/upload/route.ts`
- `src/app/api/merchant/stores/[id]/branding/route.ts`
- `src/app/api/merchant/products/[id]/image/route.ts`
- `src/app/api/pay-profile/assets/route.ts`
- `src/components/ui/ImageUploadButton.tsx`
- `prisma/migration_v421_r2_branding.sql`

## การใช้งานเร็ว

### 1) อัปโหลดโลโกร้าน
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

### 2) อัปโหลดแบนเนอร์ร้าน
```tsx
<ImageUploadButton
  category="storeBanners"
  linkedId={store.id}
  linkedType="store"
  label="อัปโหลดแบนเนอร์ร้าน"
  onUploaded={async ({ url }) => {
    await fetch(`/api/merchant/stores/${store.id}/branding`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bannerUrl: url }),
    })
  }}
/>
```

### 3) อัปโหลดรูปสินค้า
```tsx
<ImageUploadButton
  category="productImages"
  linkedId={product.id}
  linkedType="merchantProduct"
  label="เปลี่ยนรูปสินค้า"
  onUploaded={async ({ url }) => {
    await fetch(`/api/merchant/products/${product.id}/image`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url }),
    })
  }}
/>
```

### 4) อัปโหลดรูป Pay Profile
```tsx
<ImageUploadButton
  category="payProfileImages"
  label="อัปโหลดรูปโปรไฟล์"
  onUploaded={async ({ url }) => {
    await fetch(`/api/pay-profile/assets`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceType: "merchant", avatarUrl: url }),
    })
  }}
/>
```

### 5) อัปโหลด cover Pay Profile
```tsx
<ImageUploadButton
  category="payProfileCovers"
  label="อัปโหลดรูปพื้นหลัง"
  onUploaded={async ({ url }) => {
    await fetch(`/api/pay-profile/assets`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceType: "merchant", coverImageUrl: url, coverStyle: "image" }),
    })
  }}
/>
```

## Env
```env
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=paymap-uploads
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

## DB
รัน migration สำหรับฟิลด์ branding ของ store ก่อน

```bash
npx prisma generate
psql "$DATABASE_URL" -f prisma/migration_v421_r2_branding.sql
```

## หมายเหตุ
แพ็กนี้เตรียม backend และ component สำหรับอัปโหลดจริงแล้ว แต่ยังต้อง merge ปุ่มเข้าแต่ละหน้า UI ของคุณตามตำแหน่งที่ต้องการ
