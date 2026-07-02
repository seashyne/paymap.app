export const dynamic = "force-dynamic";

import { ok } from "@/lib/api-response";

export async function GET() {
  return ok({ version: "v1", resources: ["transactions", "reports", "invoices", "approvals", "webhooks"], status: "scaffold-ready" });
}
