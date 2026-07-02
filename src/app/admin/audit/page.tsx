import AppFrame from "@/components/layout/AppFrame"
import { requireRolePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/session"
import { Shield, Users, Building2, BarChart3 } from "lucide-react"
import AdminAuditCenter from "@/components/admin/AdminAuditCenter"

export default async function AdminAuditPage() {
  await requireRolePage("admin")
  const session = await getCurrentSession()
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 80, include: { user: { select: { id: true, email: true, name: true } } } })
  const nav = [
    { href: "/admin", label: "Admin", icon: Shield, accent: "#ef4444", active: false },
    { href: "/admin/users", label: "Users", icon: Users, accent: "#8b5cf6", active: false },
    { href: "/admin/workspaces", label: "Workspaces", icon: Building2, accent: "#14b8a6", active: false },
    { href: "/admin/audit", label: "Audit", icon: BarChart3, accent: "#f59e0b", active: true },
  ]

  return (
    <AppFrame brand="payMap" icon="📜" version="PayMap v15.3" title="Audit log center" subtitle="ค้นหา auth, billing, admin และ workspace events แบบละเอียดได้จากหน้าเดียว" accent="#f59e0b" planLabel="Admin" nav={nav} accountMode={(session?.accountMode ?? "personal") as any}>
      <AdminAuditCenter initialLogs={logs as any} />
    </AppFrame>
  )
}
