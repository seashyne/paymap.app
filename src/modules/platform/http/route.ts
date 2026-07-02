import { type ZodTypeAny } from "zod"
import { handleError } from "@/lib/api-response"

export async function withRouteErrorHandling<T>(handler: () => Promise<T>) {
  try {
    return await handler()
  } catch (error) {
    return handleError(error)
  }
}

export async function parseJsonBody<TSchema extends ZodTypeAny>(request: Request, schema: TSchema) {
  const body = await request.json()
  return schema.parse(body)
}
