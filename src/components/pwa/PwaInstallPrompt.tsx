"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PwaInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const isLocalDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "::1"

    if ("serviceWorker" in navigator) {
      if (isLocalDev) {
        navigator.serviceWorker.getRegistrations()
          .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
          .catch(() => {})
        if ("caches" in window) {
          caches.keys()
            .then((keys) => Promise.all(keys.filter((key) => key.startsWith("paymap-")).map((key) => caches.delete(key))))
            .catch(() => {})
        }
      } else {
        navigator.serviceWorker.register("/sw.js").catch(() => {})
      }
    }

    const handler = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    if (!isLocalDev) window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (!promptEvent || dismissed) return null

  async function install() {
    if (!promptEvent) return
    await promptEvent.prompt()
    const choice = await promptEvent.userChoice
    if (choice.outcome) setDismissed(true)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)] backdrop-blur md:left-auto md:right-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <Download size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black">Install PayMap</div>
          <p className="mt-1 text-xs leading-5 text-[var(--text-3)]">Use your private money dashboard from your home screen, with offline access to cached pages.</p>
          <button onClick={install} className="mt-3 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white">Install app</button>
        </div>
        <button onClick={() => setDismissed(true)} className="rounded-lg p-1 text-[var(--text-3)] hover:text-[var(--text)]">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
