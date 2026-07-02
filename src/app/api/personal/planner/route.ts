export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { requireModeUser } from "@/lib/authz"
import { created, handleError, ok } from "@/lib/api-response"
import { listPlannerEntries, createPlannerEntry } from "@/features/planner/server/planner-service"

export async function GET(req: NextRequest) {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error
  const { searchParams } = new URL(req.url)
  const items = await listPlannerEntries(auth.user, searchParams.get("workspace"))
  return ok(items)
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error
    const item = await createPlannerEntry(auth.user, await req.json())
    return created(item, "เพิ่มรายการ planner แล้ว")
  } catch (e: any) {
    return handleError(e)
  }
}
