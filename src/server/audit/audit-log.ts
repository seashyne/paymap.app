export async function writeAuditLog(action: string, meta: Record<string, unknown>) {
  console.info("[audit]", action, meta)
}
