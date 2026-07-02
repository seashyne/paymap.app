import AppFrame from "@/components/layout/AppFrame"
import { requireRolePage } from "@/lib/authz"
import { getCurrentSession } from "@/lib/session"
import { Shield, Users, Building2, BarChart3 } from "lucide-react"
import AdminWorkspacesManager from "@/components/admin/AdminWorkspacesManager"

export default async function AdminWorkspacesPage() {
  await requireRolePage("admin")
  const session = await getCurrentSession()
  const nav = [
    { href: "/admin", label: "Admin", icon: Shield, accent: "#ef4444", active: false },
    { href: "/admin/users", label: "Users", icon: Users, accent: "#8b5cf6", active: false },
    { href: "/admin/workspaces", label: "Workspaces", icon: Building2, accent: "#14b8a6", active: true },
    { href: "/admin/audit", label: "Audit", icon: BarChart3, accent: "#f59e0b", active: false },
  ]
  return (
    <AppFrame brand="payMap" icon="🏢" version="PayMap v15.3" title="Admin workspaces" subtitle="จัดการ tenant, owner, member count และ workspace status จากจุดเดียว" accent="#14b8a6" planLabel="Admin" nav={nav} accountMode={(session?.accountMode ?? "personal") as any}>
      <AdminWorkspacesManager />
    </AppFrame>
  )
}
