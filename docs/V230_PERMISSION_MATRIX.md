# payMap v23 Permission Matrix

## Personal
- owner: full access

## Merchant
- owner: full access
- manager: products, inventory, sales, reports
- cashier: sales, customers, receipts
- staff: limited inventory and view-only sales

## Business
- owner: full access
- admin: most HR + payroll setup
- hr: employees, leave, documents
- accountant: payroll, tax exports, reports
- employee: self-service payslips and leave

## Feature gate examples
- `merchant.supplier.manage` -> Merchant Growth+
- `merchant.branch.multi` -> Merchant Scale+
- `business.payroll.bank_export` -> Business SME+
- `business.api.access` -> Business Scale+
- `personal.export.pdf` -> Personal Pro+
