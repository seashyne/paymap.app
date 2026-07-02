"use client"
import NotificationBell from "@/components/ui/NotificationBell"
import ThemeToggle from "@/components/ui/ThemeToggle"
import QuickAdd from "@/components/ui/QuickAdd"
import AdvisorChat from "@/components/ai/AdvisorChat"
import GlobalSearch from "@/components/ui/GlobalSearch"
import ConsentOverlay from "@/components/ui/ConsentGate"
import { DenseModeToggle, KeyboardHint, KeyboardNavigation } from "@/components/layout/DesktopUXControls"

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <GlobalSearch />
      <KeyboardHint />
      <DenseModeToggle />
      <ThemeToggle compact />
      <NotificationBell />
    </div>
  )
}

export function FloatingActions({ showQuickActions = true }: { showQuickActions?: boolean }) {
  return <>
    <KeyboardNavigation />
    {showQuickActions ? <QuickAdd /> : null}
    <AdvisorChat />
    <ConsentOverlay />
  </>
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
