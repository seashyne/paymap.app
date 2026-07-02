export type PermissionKey =
  | "billing.manage"
  | "planner.read"
  | "planner.write"
  | "workspace.switch"
  | "inventory.manage"
  | "payroll.approve"

const rolePermissionMap: Record<string, PermissionKey[]> = {
  admin: ["billing.manage", "planner.read", "planner.write", "workspace.switch", "inventory.manage", "payroll.approve"],
  owner: ["billing.manage", "planner.read", "planner.write", "workspace.switch", "inventory.manage", "payroll.approve"],
  manager: ["planner.read", "planner.write", "workspace.switch", "inventory.manage", "payroll.approve"],
  member: ["planner.read", "planner.write", "workspace.switch"],
  viewer: ["planner.read"],
}

export function can(role: string | undefined, permission: PermissionKey) {
  return Boolean(role && rolePermissionMap[role]?.includes(permission))
}
