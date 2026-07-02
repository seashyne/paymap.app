import AppFrame from "@/components/layout/AppFrame"
import { requireRolePage } from "@/lib/authz"
import { getCurrentSession } from "@/lib/session"
import { BarChart3, Shield, Users, Building2 } from "lucide-react"
import AdminOverviewClient from "@/components/admin/AdminOverviewClient"

export default async function AdminPage() {
  await requireRolePage("admin")
  const session = await getCurrentSession()

  const nav = [
    { href: "/admin", label: "Admin", icon: Shield, accent: "#ef4444", active: true },
    { href: "/admin/users", label: "Users", icon: Users, accent: "#8b5cf6", active: false },
    { href: "/admin/workspaces", label: "Workspaces", icon: Building2, accent: "#14b8a6", active: false },
    { href: "/admin/audit", label: "Audit", icon: BarChart3, accent: "#f59e0b", active: false },
  ]

  return (
    <AppFrame brand="payMap" icon="🛡️" version="PayMap 15.3" title="Admin control center" subtitle="ภาพรวมงานปฏิบัติการของ SaaS สำหรับผู้ดูแลระบบ" accent="#ef4444" planLabel="Admin" nav={nav} accountMode={(session?.accountMode ?? "personal") as any}>
      <AdminOverviewClient />
    </AppFrame>
  )
}
