# PayMap ERP Roadmap

## สรุปสั้น

PayMap สามารถต่อยอดเป็น ERP ได้ โดยฐานสำคัญมีอยู่แล้วในระบบปัจจุบัน ทั้งด้านบัญชี, ขาย, จัดซื้อ, สต็อก, เงินเดือน, ภาษี, องค์กร, สิทธิ์การใช้งาน และ workspace หลายรูปแบบ

แนวทางที่เหมาะที่สุดไม่ใช่การ "เปลี่ยนระบบทั้งหมดให้เป็น ERP ทันที" แต่คือการยกระดับ PayMap จาก Financial OS / Business OS ไปเป็น SME ERP แบบเป็นเฟส และเชื่อมข้อมูลทุกโมดูลเข้าหากันให้แน่นขึ้น

## สิ่งที่มีอยู่แล้วในโค้ด

จาก `prisma/schema.prisma` และโครงสร้างโมดูลปัจจุบัน ระบบมีแกน ERP หลายส่วนแล้ว:

- องค์กรและหลายหน่วยงาน: `Organization`, `OrganizationMember`, `Team`, `Branch`, `Workspace`
- งานขาย: `Quotation`, `Invoice`, `InvoiceItem`, `InvoicePayment`, `SalesOrder`, `SalesItem`
- งานจัดซื้อ: `Supplier`, `PurchaseOrder`, `POItem`
- สต็อกและร้านค้า: `Store`, `MerchantProduct`, `InventoryLog`
- บัญชีและสมุดรายวัน: `ChartOfAccount`, `JournalEntry`, `LedgerLine`
- การเงินและกระทบยอด: `BankStatement`, `StatementLine`, `ReconciliationMatch`
- ภาษี: `VatReport`
- HR / Payroll: `Employee`, `LeaveRequest`, `PayrollRun`, `PayrollItem`
- Workflow / Governance: `ApprovalRequest`, `AuditLog`, `Notification`

นอกจากนี้ใน `src/modules` ยังมี service ที่ชี้ว่ามีการเชื่อมข้ามโมดูลแล้ว เช่น:

- `src/modules/accounting/application/post-merchant-sale.service.ts`
- `src/modules/accounting/application/post-payroll-run.service.ts`
- `src/modules/merchant-sales/application/create-sale.service.ts`
- `src/modules/payroll/application/upsert-payroll-run.service.ts`

สรุปคือ PayMap ตอนนี้อยู่ในจุดที่เรียกได้ว่าเป็น "ERP foundation" มากกว่าแอปการเงินทั่วไป

## ช่องว่างที่ยังต้องปิดเพื่อให้เป็น ERP จริง

แม้โครงสร้างข้อมูลจะไปไกลแล้ว แต่ ERP ที่พร้อมใช้งานจริงยังต้องปิด gap สำคัญต่อไปนี้:

### 1. เอกสารธุรกรรมต้องไหลต่อกันแบบ end-to-end

ควรเชื่อม flow หลักให้ครบ เช่น:

- Lead / ลูกค้า
- Quotation
- Sales Order
- Delivery / Fulfillment
- Invoice
- Payment
- Journal Entry

ฝั่งจัดซื้อก็เช่นกัน:

- Purchase Request
- Approval
- Purchase Order
- Receive Goods
- AP Bill / Payment
- Inventory Update
- Journal Entry

ตอนนี้มีหลาย model แล้ว แต่ยังต้องตรวจให้แน่ใจว่าทุกจุดเชื่อมและเปลี่ยนสถานะกันอัตโนมัติ

### 2. Master data กลางยังไม่ครบ

ERP ใช้ไม่ได้จริงถ้าไม่มี master data กลางที่ชัดเจน เช่น:

- Customer master
- Vendor master ที่แยกจาก supplier เชิงพื้นฐาน
- Product / SKU master ที่มีหน่วยนับ, barcode, costing method, reorder point
- Tax code
- Cost center / department
- Payment terms
- Warehouse / bin location

### 3. สิทธิ์และอนุมัติยังต้องละเอียดขึ้น

มี `ApprovalRequest` และโครงสร้างองค์กรแล้ว แต่ ERP มักต้องมี:

- สิทธิ์ตามโมดูลและตาม action
- approval matrix ตามวงเงิน / แผนก / สาขา
- maker-checker
- audit trail ระดับเอกสาร

### 4. รายงานผู้บริหารและรายงานปฏิบัติการต้องครบขึ้น

ERP ที่ใช้งานจริงควรมีอย่างน้อย:

- AR aging
- AP aging
- Inventory valuation
- Cashflow forecast
- P&L
- Balance sheet
- VAT purchase / sales summary
- Payroll cost by department
- Branch / team performance

### 5. ปิดรอบบัญชีและควบคุมข้อมูลย้อนหลัง

ควรมี:

- accounting period
- period close / reopen
- lock backdated entries
- document numbering rules
- correction via reversal instead of direct overwrite

## ลำดับเฟสที่แนะนำ

## Phase 1: SME ERP Core

เป้าหมายคือทำให้ธุรกิจใช้งานประจำวันได้จริงก่อน

ขอบเขต:

- Customer master
- Supplier master ปรับให้ครบข้อมูลเชิงธุรกิจ
- Product / SKU master กลาง
- Quotation -> Sales Order -> Invoice -> Payment flow
- Purchase Order -> Receive -> Payment flow
- Inventory movement เชื่อมกับขายและซื้อ
- Auto-post journal จากขาย, ซื้อ, payroll
- Dashboard เจ้าของกิจการ

ผลลัพธ์:

PayMap จะกลายเป็น ERP สำหรับ SME ระดับต้นที่ใช้งานงานขาย, ซื้อ, สต็อก, บัญชี และ payroll ได้ในระบบเดียว

## Phase 2: Control + Compliance

เป้าหมายคือเพิ่มความพร้อมระดับองค์กร

ขอบเขต:

- approval matrix
- document audit trail
- accounting period close
- bank reconciliation flow ที่สมบูรณ์
- VAT reports ให้ครบวงจร
- export สำหรับผู้สอบบัญชี / สำนักงานบัญชี

ผลลัพธ์:

ระบบจะเริ่มมี governance และความน่าเชื่อถือระดับใช้งานธุรกิจจริงมากขึ้น

## Phase 3: Multi-Branch / Multi-Entity ERP

เป้าหมายคือรองรับธุรกิจที่ใหญ่ขึ้น

ขอบเขต:

- inter-branch visibility
- branch stock transfer
- cost center / department reporting
- consolidated dashboard
- advanced RBAC
- optional enterprise workflow

ผลลัพธ์:

PayMap จะขยับจาก SME ERP ไปใกล้ระบบ business operating platform เต็มรูปแบบ

## สิ่งที่ควรทำก่อนเป็นอันดับแรก

ถ้าจะเริ่มทันที แนะนำ 5 งานนี้ก่อน:

1. สร้าง master data กลางสำหรับ `Customer`, `Product`, `Warehouse`
2. ทำ status flow เอกสารขายและซื้อให้ครบทั้ง lifecycle
3. บังคับ auto-post ไปบัญชีสำหรับเอกสารหลักทุกตัว
4. เพิ่มรายงาน AR/AP/Inventory/P&L เบื้องต้น
5. เพิ่ม approval + audit trail ระดับเอกสาร

## คำตอบเชิงธุรกิจ

ถ้าถามว่า "PayMap ทำให้เป็น ERP ได้ไหม" คำตอบคือ "ได้ และจริง ๆ มีฐานเกินครึ่งแล้ว"

แต่ถ้าถามว่า "วันนี้เป็น ERP ที่พร้อมใช้ครบกระบวนการหรือยัง" คำตอบคือ "ยังไม่เต็มรูปแบบ" เพราะยังต้องเชื่อม flow, เติม master data, เสริม control, และปิดรายงาน operational ให้ครบ

## คำแนะนำเชิงเทคนิค

แนวทางที่ปลอดภัยที่สุดคือ:

- ใช้ schema ปัจจุบันเป็นฐาน
- เพิ่ม model ใหม่เฉพาะจุดที่จำเป็น
- ค่อย ๆ ย้าย logic ไปที่ `src/modules/*/application`
- ให้ทุกธุรกรรมหลัก post เข้า accounting layer เดียวกัน
- ใช้ workspace / organization เป็น tenant boundary หลัก

แนวทางนี้จะทำให้ระบบโตเป็น ERP โดยไม่เสียของเดิมที่ PayMap ทำได้ดีอยู่แล้ว
