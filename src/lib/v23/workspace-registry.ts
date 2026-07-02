export type WorkspaceType = "personal" | "merchant" | "business"

export type WorkspaceRegistryItem = {
  type: WorkspaceType
  label: string
  path: string
  description: string
  starterData: string[]
}

export const WORKSPACE_REGISTRY: Record<WorkspaceType, WorkspaceRegistryItem> = {
  personal: {
    type: "personal",
    label: "Personal",
    path: "/dashboard",
    description: "จัดการการเงินส่วนบุคคล, budget, savings และภาษี",
    starterData: ["default categories", "sample budget", "cashflow template"],
  },
  merchant: {
    type: "merchant",
    label: "Merchant",
    path: "/merchant",
    description: "จัดการร้านค้า, สินค้า, สต็อก, การขาย และ VAT",
    starterData: ["default store", "starter products", "opening stock"],
  },
  business: {
    type: "business",
    label: "Business",
    path: "/business",
    description: "จัดการพนักงาน, payroll, leave และภาษีองค์กร",
    starterData: ["company profile", "default department", "starter employee"],
  },
}

export function getWorkspaceRegistryItem(type?: string | null) {
  if (type === "merchant" || type === "business") return WORKSPACE_REGISTRY[type]
  return WORKSPACE_REGISTRY.personal
}
