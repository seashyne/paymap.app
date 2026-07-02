export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "APP_ERROR",
    public status: number = 400,
    public details?: unknown,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Unknown error"
}
