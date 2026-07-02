"use client"

import { ReactNode } from "react"

export function WorkbenchSection({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="mb-4">
        <div className="text-lg font-black">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-[var(--text-3)]">{subtitle}</div> : null}
      </div>
      {children}
    </section>
  )
}

export function InlineNotice({ tone = "neutral", children }: { tone?: "neutral" | "success" | "danger"; children: ReactNode }) {
  const tones = {
    neutral: "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-2)]",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    danger: "border-rose-500/20 bg-rose-500/10 text-rose-300",
  }
  return <div className={`rounded-2xl border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>
}

export async function apiJson<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json?.error || json?.message || "Request failed")
  }
  return json
}

export function formatMoney(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString("th-TH", { maximumFractionDigits: 2 })
}
