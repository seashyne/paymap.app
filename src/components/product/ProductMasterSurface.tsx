import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight } from "lucide-react"
import type { ReactNode, CSSProperties } from "react"

export type ProductHeroStat = {
  label: string
  value: string
  hint?: string
}

export type ProductQuickLink = {
  href: string
  title: string
  description: string
  icon?: LucideIcon
}

export function ProductHero({
  eyebrow,
  title,
  description,
  badge,
  accent,
  stats = [],
}: {
  eyebrow: string
  title: string
  description: string
  badge?: string
  accent?: string
  stats?: ProductHeroStat[]
}) {
  return (
    <section className="product-master-hero" style={accent ? ({ ["--pm-accent" as any]: accent } as CSSProperties) : undefined}>
      <div className="product-master-hero__copy">
        <div className="product-master-hero__eyebrow">{eyebrow}</div>
        <div className="product-master-hero__headline-row">
          <h1 className="product-master-hero__title">{title}</h1>
          {badge ? <div className="product-master-badge">{badge}</div> : null}
        </div>
        <p className="product-master-hero__description">{description}</p>
      </div>
      {stats.length ? (
        <div className="product-master-hero__stats">
          {stats.map((item) => (
            <div key={item.label} className="product-master-stat-card">
              <div className="product-master-stat-card__label">{item.label}</div>
              <div className="product-master-stat-card__value">{item.value}</div>
              {item.hint ? <div className="product-master-stat-card__hint">{item.hint}</div> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export function ProductSection({ title, description, children, actions }: { title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="product-master-section">
      <div className="product-master-section__header">
        <div>
          <h2 className="product-master-section__title">{title}</h2>
          {description ? <p className="product-master-section__description">{description}</p> : null}
        </div>
        {actions ? <div className="product-master-section__actions">{actions}</div> : null}
      </div>
      <div>{children}</div>
    </section>
  )
}

export function ProductQuickLinks({ links }: { links: ProductQuickLink[] }) {
  return (
    <div className="product-master-links-grid">
      {links.map((item) => {
        const Icon = item.icon
        return (
          <Link key={item.href + item.title} href={item.href} className="product-master-link-card">
            <div className="product-master-link-card__row">
              <div>
                <div className="product-master-link-card__title">{item.title}</div>
                <div className="product-master-link-card__description">{item.description}</div>
              </div>
              <div className="product-master-link-card__icon">
                {Icon ? <Icon size={16} /> : <ArrowRight size={16} />}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
