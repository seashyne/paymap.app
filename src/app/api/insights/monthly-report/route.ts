export const dynamic = "force-dynamic";

import { handleError, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/authz";

export async function GET() {
  try {
    const auth = await requireApiUser();
    if ("error" in auth) return auth.error;
    return ok({ headline: "Monthly summary is ready", channels: ["dashboard", "email", "notification"], sections: ["income", "expense", "health-score", "insights", "alerts"] });
  } catch (e) { return handleError(e); }
}
