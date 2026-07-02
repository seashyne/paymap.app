"use client"

import Link from "next/link"
import { AlertTriangle, RotateCcw } from "lucide-react"

export default function GlobalErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-20 text-[var(--text)]">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
          <AlertTriangle size={24} />
        </div>
        <h1 className="mt-5 text-3xl font-black">We could not finish loading this page</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">Try loading the page again. If the problem continues, go back to your dashboard or open the Help Center.</p>
        {error?.digest ? <div className="mt-4 text-xs text-[var(--text-3)]">Reference: {error.digest}</div> : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => reset()} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white">
            <RotateCcw size={15} /> Try again
          </button>
          <Link href="/dashboard" className="rounded-2xl border border-[var(--border)] px-5 py-3 text-sm font-bold">Go to dashboard</Link>
          <Link href="/help" className="rounded-2xl border border-[var(--border)] px-5 py-3 text-sm font-bold">Help Center</Link>
        </div>
      </div>
    </main>
  )
}
