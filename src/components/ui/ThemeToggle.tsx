"use client"
// v1.6: Dark/Light/System theme toggle
// Persists to localStorage + updates <html> class
import { useEffect, useState } from "react"
import { Moon, Sun, Monitor, Briefcase } from "lucide-react"
import type { ThemeMode } from "@/lib/ui-preferences"

type Theme = ThemeMode

function getSystemPrefersDark() {
  if (typeof window === "undefined") return true
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function resolveTheme(theme: Theme): Exclude<Theme, "system"> {
  if (theme === "system") return getSystemPrefersDark() ? "dark" : "light"
  return theme
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const resolved = resolveTheme(theme)
  root.classList.toggle("dark", resolved === "dark" || resolved === "executive")
  root.classList.toggle("light", resolved === "light")
  root.setAttribute("data-theme", resolved)
  root.setAttribute("data-theme-mode", theme)
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system")

  useEffect(() => {
    const rawSaved = localStorage.getItem("paymap-theme") || document.documentElement.getAttribute("data-theme-mode")
    const saved = rawSaved === "dark" || rawSaved === "light" || rawSaved === "system" || rawSaved === "executive" ? rawSaved : null
    const initial: Theme = saved ?? "light"
    setTheme(initial)
    applyTheme(initial)

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      const rawCurrent = document.documentElement.getAttribute("data-theme-mode")
      const current: Theme = rawCurrent === "dark" || rawCurrent === "light" || rawCurrent === "system" || rawCurrent === "executive" ? rawCurrent : initial
      if (current === "system") applyTheme("system")
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const setAndApply = async (t: Theme) => {
    setTheme(t)
    localStorage.setItem("paymap-theme", t)
    applyTheme(t)
    try {
      await fetch("/api/user/ui-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeMode: t }),
      })
    } catch {}
  }

  return { theme, setTheme: setAndApply }
}

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()

  if (compact) {
    // Single button — cycles dark → light → executive → system
    const next: Record<Theme, Theme> = { dark: "light", light: "executive", executive: "system", system: "dark" }
    const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : theme === "executive" ? Briefcase : Monitor
    const label = theme === "dark" ? "Dark" : theme === "light" ? "Light" : theme === "executive" ? "Executive" : "System"
    return (
      <button
        onClick={() => setTheme(next[theme])}
        className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        title={`Theme: ${label} — คลิกเปลี่ยน`}
      >
        <Icon size={15} />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1">
      {([
        { id: "dark" as Theme,   Icon: Moon,    label: "Dark"   },
        { id: "light" as Theme,  Icon: Sun,               label: "Light"  },
        { id: "executive" as Theme, Icon: Briefcase, label: "Executive" },
        { id: "system" as Theme, Icon: Monitor,           label: "System" },
      ] as const).map(({ id, Icon, label }) => (
        <button
          key={id}
          onClick={() => setTheme(id)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
            theme === id
              ? "bg-[var(--surface-2)] text-[var(--text)]"
              : "text-[var(--text-3)] hover:text-[var(--text-2)]"
          }`}
        >
          <Icon size={12} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
