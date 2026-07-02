import { z } from "zod"

export const plannerWorkspaceSchema = z.enum(["personal", "business", "merchant"])

export const createPlannerEntrySchema = z.object({
  workspace: plannerWorkspaceSchema.default("personal"),
  kind: z.enum(["note", "task", "reminder"]).default("note"),
  title: z.string().trim().min(1).max(120),
  content: z.string().max(2000).optional().nullable(),
  dueAt: z.string().datetime().optional().nullable().or(z.literal("")),
  priority: z.coerce.number().min(1).max(3).default(2),
  relatedPath: z.string().max(255).optional().nullable(),
})
