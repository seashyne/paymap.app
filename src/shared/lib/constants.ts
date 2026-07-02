export const PAYMAP_VERSION = "10.0.0"

export const WORKSPACE_MODES = ["personal", "business", "merchant"] as const
export type WorkspaceMode = (typeof WORKSPACE_MODES)[number]

export const API_ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_INPUT: "INVALID_INPUT",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const
