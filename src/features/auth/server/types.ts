import type { WorkspaceMode } from "@/lib/workspace"

export type AuthMode = WorkspaceMode

export type AuthResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; extra?: Record<string, unknown> }
