"use client"

import { createContext, useContext, useState } from "react"

type ToastType = "success" | "error" | "info"

type ToastItem = {
  id: number
  message: string
  type: ToastType
}

type ToastContextValue = {
  showToast: (message: string, type?: ToastType, detail?: string) => void
  success: (message: string, detail?: string) => void
  error: (message: string, detail?: string) => void
  info: (message: string, detail?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  function push(message: string, type: ToastType = "info", detail?: string) {
    const id = Date.now() + Math.random()
    const fullMessage = detail ? `${message} — ${detail}` : message

    setToasts((t) => [...t, { id, message: fullMessage, type }])

    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3500)
  }

  const showToast = (message: string, type: ToastType = "info", detail?: string) =>
    push(message, type, detail)

  const success = (message: string, detail?: string) =>
    push(message, "success", detail)

  const error = (message: string, detail?: string) =>
    push(message, "error", detail)

  const info = (message: string, detail?: string) =>
    push(message, "info", detail)

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}

      <div className="fixed bottom-5 right-5 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg px-4 py-2 text-sm text-white shadow-lg ${
              t.type === "success"
                ? "bg-green-500"
                : t.type === "error"
                ? "bg-red-500"
                : "bg-gray-800"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside ToastProvider")
  return ctx
}