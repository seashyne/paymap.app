"use client"

import { Plus, Upload } from "lucide-react"
import Link from "next/link"

export function OpenQuickAddButton({ children = "เพิ่มรายการ" }: { children?: string }) {
  return (
    <button
      type="button"
      className="clean-button"
      onClick={() => window.dispatchEvent(new CustomEvent("paymap:quick-add-open"))}
    >
      <Plus size={15} />
      {children}
    </button>
  )
}

export function ImportBackupButton({ children = "นำเข้า backup" }: { children?: string }) {
  return (
    <Link href="/settings?tab=data" className="clean-button clean-button-secondary">
      <Upload size={15} />
      {children}
    </Link>
  )
}
