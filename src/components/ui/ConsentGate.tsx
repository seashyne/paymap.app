"use client"
// PayMap v5.1 — ConsentGate (fixed for Next.js 14 App Router)
// ใช้แบบ standalone — ไม่รับ children
// วางเป็น sibling ใน layout ของ authenticated pages

import { useState, useEffect } from "react"
import ConsentModal from "@/components/ui/ConsentModal"

interface ConsentStatus {
  required: boolean
  tosOk: boolean
  privacyOk: boolean
}

// Standalone overlay — ไม่ wrap children, แค่ render modal ทับหน้าจอ
export default function ConsentOverlay() {
  const [status, setStatus]   = useState<ConsentStatus | null>(null)

  useEffect(() => {
    fetch("/api/user/consent")
      .then(r => r.json())
      .then(j => {
        if (j.success) setStatus(j.data)
        // fail-open: ถ้า API error ไม่แสดง modal
      })
      .catch(() => null)
  }, [])

  if (!status?.required) return null

  const isUpdate = !!(status.tosOk || status.privacyOk)

  return (
    <ConsentModal
      isUpdate={isUpdate}
      onAccepted={() => setStatus({ required: false, tosOk: true, privacyOk: true })}
    />
  )
}
