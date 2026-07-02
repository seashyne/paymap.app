import { verifyRequiredEnv } from "../src/shared/lib/env"

type SmokeCase = {
  name: string
  url: string
  expectedStatuses: number[]
}

async function runRemoteChecks(baseUrl: string) {
  const checks: SmokeCase[] = [
    { name: "health", url: `${baseUrl}/api/health`, expectedStatuses: [200] },
    { name: "session", url: `${baseUrl}/api/auth/session`, expectedStatuses: [200, 401] },
    { name: "notifications", url: `${baseUrl}/api/notifications`, expectedStatuses: [200, 401] },
    { name: "categories", url: `${baseUrl}/api/categories`, expectedStatuses: [200, 401] },
    { name: "budget", url: `${baseUrl}/api/budget`, expectedStatuses: [200, 401] },
    { name: "v13 financial summary", url: `${baseUrl}/api/v13/financial/summary`, expectedStatuses: [200, 401] },
    { name: "v13 forecast", url: `${baseUrl}/api/v13/financial/forecast`, expectedStatuses: [200, 401] },
    { name: "v13 business insights", url: `${baseUrl}/api/v13/business-insights`, expectedStatuses: [200, 401] },
    { name: "v13 payroll ops", url: `${baseUrl}/api/v13/payroll-ops`, expectedStatuses: [200, 401] },
    { name: "merchant stores", url: `${baseUrl}/api/merchant/stores`, expectedStatuses: [200, 401] },
    { name: "merchant inventory", url: `${baseUrl}/api/merchant/products`, expectedStatuses: [200, 401] },
    { name: "merchant sales", url: `${baseUrl}/api/merchant/sales`, expectedStatuses: [200, 401, 405] },
    { name: "business employees", url: `${baseUrl}/api/business/employees`, expectedStatuses: [200, 401] },
    { name: "business payroll", url: `${baseUrl}/api/business/payroll`, expectedStatuses: [200, 401] },
    { name: "business invoices", url: `${baseUrl}/api/business/invoices`, expectedStatuses: [200, 401] },
    { name: "reconciliation reports", url: `${baseUrl}/api/accounting/reports`, expectedStatuses: [200, 401] },
  ]

  for (const check of checks) {
    try {
      const res = await fetch(check.url, { method: "GET", redirect: "manual" })
      const statusLabel = check.expectedStatuses.includes(res.status) ? "OK" : "UNEXPECTED"
      console.log(`- ${check.name}: ${res.status} ${statusLabel}`)
    } catch (error) {
      console.log(`- ${check.name}: FAILED ${(error as Error).message}`)
    }
  }
}

async function main() {
  console.log("Running PayMap v13.2 smoke test...")
  for (const item of verifyRequiredEnv()) {
    console.log(`- env ${item.key}: ${item.present ? "OK" : "MISSING"}`)
  }

  const baseUrl = process.env.SMOKE_BASE_URL
  if (baseUrl) {
    console.log(`Remote smoke target: ${baseUrl}`)
    await runRemoteChecks(baseUrl.replace(/\/$/, ""))
  } else {
    console.log("Remote route checks skipped. Set SMOKE_BASE_URL to enable endpoint smoke tests.")
  }

  console.log("Smoke test finished.")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
