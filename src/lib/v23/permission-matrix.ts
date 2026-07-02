export type MerchantRole = "owner" | "manager" | "cashier" | "staff"
export type BusinessRole = "owner" | "admin" | "hr" | "accountant" | "employee"

type PermissionSet = Record<string, true>

const merchantPermissions: Record<MerchantRole, PermissionSet> = {
  owner: {
    "merchant.products.manage": true,
    "merchant.inventory.manage": true,
    "merchant.sales.manage": true,
    "merchant.supplier.manage": true,
    "merchant.settings.manage": true,
  },
  manager: {
    "merchant.products.manage": true,
    "merchant.inventory.manage": true,
    "merchant.sales.manage": true,
    "merchant.reports.view": true,
  },
  cashier: {
    "merchant.sales.manage": true,
    "merchant.receipts.manage": true,
    "merchant.customers.manage": true,
  },
  staff: {
    "merchant.inventory.view": true,
    "merchant.sales.view": true,
  },
}

const businessPermissions: Record<BusinessRole, PermissionSet> = {
  owner: {
    "business.employees.manage": true,
    "business.payroll.manage": true,
    "business.leave.manage": true,
    "business.settings.manage": true,
  },
  admin: {
    "business.employees.manage": true,
    "business.payroll.manage": true,
    "business.leave.manage": true,
  },
  hr: {
    "business.employees.manage": true,
    "business.leave.manage": true,
    "business.documents.manage": true,
  },
  accountant: {
    "business.payroll.manage": true,
    "business.tax.manage": true,
    "business.reports.view": true,
  },
  employee: {
    "business.self_service.view": true,
  },
}

export function hasMerchantPermission(role: MerchantRole, permission: string) {
  return Boolean(merchantPermissions[role]?.[permission])
}

export function hasBusinessPermission(role: BusinessRole, permission: string) {
  return Boolean(businessPermissions[role]?.[permission])
}
