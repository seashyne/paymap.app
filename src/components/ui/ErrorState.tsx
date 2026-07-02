import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function ErrorState({
  title,
  description,
  href,
  hrefLabel,
}: {
  title: string
  description?: string
  href?: string
  hrefLabel?: string
}) {
  return (
    <div className="pm-error-state glass-card rounded-[28px] p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
        <AlertTriangle size={20} />
      </div>
      <div className="mt-4 text-lg font-black">{title}</div>
      {description ? <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">{description}</p> : null}
      {href && hrefLabel ? (
        <div className="mt-5">
          <Link href={href} className="btn-outline">
            {hrefLabel}
          </Link>
        </div>
      ) : null}
    </div>
  )
}
