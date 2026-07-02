# PayMap v14 Architecture Refactor Pack

## เป้าหมาย
ปรับจาก feature-first + route-heavy ไปเป็น modular monolith ที่แยก domain/application/infrastructure ชัดเจน และมี event system สำหรับ flow สำคัญ

## โครงสร้างใหม่

```
src/modules/
  accounting/
    domain/
    application/
    infrastructure/
  financial-os/
    application/
  payroll/
    application/
  merchant-sales/
    application/
  platform/
    events/
    http/
    observability/
```

## สิ่งที่ย้ายเข้าสู่ service layer
- financial summary
- business insights
- payroll ops
- payroll run upsert
- merchant sale create
- journal posting orchestration

## Event system
- `domain.merchant.sale.confirmed`
- `domain.merchant.sale.posted`
- `domain.payroll.run.upserted`
- `domain.payroll.run.posted`

Subscriber ฝั่ง default จะทำ accounting auto-post ให้หลัง domain event ถูก publish

## Production intent
- route บางตัวถูกทำให้บางลง
- business logic ถูกเรียกผ่าน module service
- seed แยก dependency ออกจาก `src/` แล้ว
- เพิ่ม `prisma/tsconfig.seed.json` ให้ script ฝั่ง seed / validate เสถียรกว่าเดิม

## หมายเหตุ
ชุดนี้เป็น architecture pack เพื่อวางฐาน refactor ต่อทั้ง repo ยังไม่ใช่การย้ายทุก route ทั่วระบบเข้ามาอยู่ใน modules ทั้งหมดในรอบเดียว
