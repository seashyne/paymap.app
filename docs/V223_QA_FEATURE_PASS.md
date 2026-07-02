# payMap v22.3 — QA + Feature Pass

รอบนี้โฟกัสแก้จุดที่ build พังจาก Prisma schema ไม่สอดคล้องกับ API ฝั่ง Personal/Family

## สิ่งที่แก้
- เพิ่ม Prisma models ที่ขาด:
  - `Family`
  - `FamilyMember`
  - `FamilyBudget`
- เพิ่ม relations ใน `User`
  - `ownedFamilies`
  - `familyMembers`
- เพิ่ม enum `FamilyRole`
- bump version เป็น `2.2.3`
- เพิ่ม SQL reference file `prisma/migration_v223_family_fix.sql`

## อาการที่แก้ตรง
Build error เดิม:
- `Property 'family' does not exist on type 'PrismaClient'`

สาเหตุ:
- มี API และ UI สำหรับ Family workspace อยู่แล้ว
- แต่ `schema.prisma` ไม่มี model ที่เกี่ยวข้อง ทำให้ Prisma client ไม่มี `prisma.family`, `prisma.familyMember`, `prisma.familyBudget`

## หลังอัปเดต
ให้รันตามนี้

```bash
npm install
npm run db:generate
npm run db:push
npm run build
```

## หมายเหตุ
รอบนี้เป็นการปิด build blocker หลักที่ผู้ใช้เจอจริงก่อน
ถ้าหลังจากนี้ยังมี type error ตัวถัดไป ควรไล่ต่อจากผล build ล่าสุด เพราะโปรเจกต์มีหลาย module และ Prisma/schema mismatch เป็นจุดเสี่ยงหลัก
