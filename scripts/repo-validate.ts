import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const requiredFiles = [
  "prisma/schema.prisma",
  "prisma/seed.ts",
  "prisma/chart-of-accounts.seed.ts",
  "prisma/migration_v131_production_hardening.sql",
  "prisma/migration_v132_build_fix_sweep.sql",
  "src/app/business/os/page.tsx",
  "src/app/merchant/pos/page.tsx",
  "src/app/api/v13/financial/summary/route.ts",
  "src/app/api/v13/financial/forecast/route.ts",
  "src/app/api/v13/business-insights/route.ts",
  "src/app/api/v13/payroll-ops/route.ts",
  "src/modules/platform/events/bus.ts",
  "src/modules/platform/events/subscribers.ts",
  "src/modules/accounting/application/create-journal-entry.service.ts",
  "src/modules/merchant-sales/application/create-sale.service.ts",
  "src/modules/payroll/application/upsert-payroll-run.service.ts",
  "src/modules/financial-os/application/get-financial-summary.service.ts",
]

let hasError = false
function checkFile(file: string) {
  const fullPath = resolve(process.cwd(), file)
  const ok = existsSync(fullPath)
  console.log(`- ${file}: ${ok ? "OK" : "MISSING"}`)
  if (!ok) hasError = true
}

for (const file of requiredFiles) checkFile(file)

const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8")
for (const marker of ["model JournalEntry", "model LedgerLine", "model PayrollRun", "model SalesOrder", "model MerchantProduct", "model Organization", "model Store"]) {
  const ok = schema.includes(marker)
  console.log(`- schema marker ${marker}: ${ok ? "OK" : "MISSING"}`)
  if (!ok) hasError = true
}

const seed = readFileSync(resolve(process.cwd(), "prisma/seed.ts"), "utf8")
for (const marker of ["chartOfAccount", "organization.upsert", "store.upsert", "merchantProduct", "payrollRun"]) {
  const ok = seed.includes(marker)
  console.log(`- seed marker ${marker}: ${ok ? "OK" : "MISSING"}`)
  if (!ok) hasError = true
}

if (hasError) process.exit(1)
