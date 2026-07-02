export function logModuleEvent(scope: string, message: string, metadata?: Record<string, unknown>) {
  console.info(`[${scope}] ${message}`, metadata ?? {})
}
