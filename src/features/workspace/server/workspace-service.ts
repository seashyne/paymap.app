import { prisma } from "@/server/db/prisma"
import { normalizeWorkspaceMode, workspacePath, type WorkspaceMode } from "@/lib/workspace"
import type { AppSession } from "@/lib/session"

export async function listUserModeAccounts(email: string) {
  return prisma.user.findMany({
    where: { email },
    select: { id: true, email: true, accountMode: true, role: true, name: true, plan: true, image: true },
    orderBy: { createdAt: "asc" },
  })
}

export async function findModeAccount(email: string, accountMode: WorkspaceMode) {
  return prisma.user.findFirst({ where: { email, accountMode } })
}

export async function buildWorkspaceContext(session: AppSession | null) {
  if (!session?.email) return null
  const activeMode = normalizeWorkspaceMode(session.accountMode || session.workspaceMode)
  const accounts = await listUserModeAccounts(session.email)
  return {
    activeMode,
    homePath: workspacePath(activeMode),
    switchBasePath: workspacePath(activeMode),
    accounts,
  }
}
