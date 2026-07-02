"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { DESKTOP_ONLY_MIN_WIDTH, isDesktopBlockedUserAgent, isDesktopExemptPath } from "@/lib/desktop-only"

function isBlocked() {
  if (typeof window === "undefined") return false
  return window.innerWidth < DESKTOP_ONLY_MIN_WIDTH || isDesktopBlockedUserAgent(navigator.userAgent)
}

export default function DesktopOnlyGuard() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || isDesktopExemptPath(pathname)) return
    if (isBlocked()) router.replace(`/download?desktop=1&from=${encodeURIComponent(pathname)}`)
  }, [pathname, router])

  return null
}
