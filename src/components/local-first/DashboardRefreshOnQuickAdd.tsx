"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardRefreshOnQuickAdd() {
  const router = useRouter()

  useEffect(() => {
    const refreshDashboard = () => router.refresh()
    window.addEventListener("paymap:tx-added", refreshDashboard)
    return () => window.removeEventListener("paymap:tx-added", refreshDashboard)
  }, [router])

  return null
}
