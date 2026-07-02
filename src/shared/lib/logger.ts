export function logInfo(event: string, meta?: Record<string, unknown>) {
  console.info(`[paymap] ${event}`, meta ?? {})
}

export function logWarn(event: string, meta?: Record<string, unknown>) {
  console.warn(`[paymap] ${event}`, meta ?? {})
}

export function logError(event: string, meta?: Record<string, unknown>) {
  console.error(`[paymap] ${event}`, meta ?? {})
}
