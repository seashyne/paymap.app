"use client"
// PayMap — Client Providers wrapper
// Next.js 14 App Router: "use client" components cannot be imported
// directly in Server Components (layout.tsx). Wrap them here instead.

import { ToastProvider } from "@/components/ui/Toast"
import ConsentOverlay from "@/components/ui/ConsentGate"
import DesktopOnlyGuard from "@/components/layout/DesktopOnlyGuard"
import PwaInstallPrompt from "@/components/pwa/PwaInstallPrompt"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DesktopOnlyGuard />
      {children}
      <PwaInstallPrompt />
      <ConsentOverlay />
    </ToastProvider>
  )
}
