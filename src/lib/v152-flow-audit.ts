import { V151_ROUTE_MAP, type RouteEntry } from "@/lib/v151-route-map"

export type FlowAuditStatus = "wired" | "partial" | "ui-only"

export type FlowAuditEntry = RouteEntry & {
  status: FlowAuditStatus
  notes: string
}

const WIRED_PREFIXES = [
  "/login", "/register", "/forgot-password", "/reset-password", "/wallets", "/billing", "/settings", "/settings/pay-profile",
  "/merchant/pos", "/merchant/sales", "/business/invoices", "/admin", "/admin/users", "/admin/workspaces", "/admin/audit", "/pay/",
]

const PARTIAL_PREFIXES = [
  "/reports", "/analytics", "/business", "/merchant", "/enterprise", "/workspace", "/onboarding", "/profile",
]

export function getFlowAudit(): FlowAuditEntry[] {
  return V151_ROUTE_MAP.map((route) => {
    const path = route.path
    if (WIRED_PREFIXES.some((prefix) => path.startsWith(prefix) || (prefix.endsWith('/') && path.startsWith(prefix)))) {
      return { ...route, status: "wired", notes: "มี route/page และมี API หรือ auth wiring หลักรองรับ" }
    }
    if (PARTIAL_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return { ...route, status: "partial", notes: "มีหน้าและโครง flow หลัก แต่ยังพึ่ง env หรือ service ภายนอกบางส่วน" }
    }
    return { ...route, status: "ui-only", notes: "มีหน้าใน matrix แล้ว แต่ยังต้อง verify runtime/data flow เพิ่ม" }
  })
}

export function getFlowAuditSummary() {
  const rows = getFlowAudit()
  return {
    total: rows.length,
    wired: rows.filter((row) => row.status === "wired").length,
    partial: rows.filter((row) => row.status === "partial").length,
    uiOnly: rows.filter((row) => row.status === "ui-only").length,
  }
}
