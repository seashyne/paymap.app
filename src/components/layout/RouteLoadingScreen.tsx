export default function RouteLoadingScreen({
  title = "Loading",
  subtitle = "Preparing the latest data for this page.",
}: {
  title?: string
  subtitle?: string
}) {
  return (
    <div className="space-y-6">
      <section className="page-hero animate-pulse">
        <div className="max-w-3xl">
          <div className="h-4 w-36 rounded-full bg-white/10" />
          <div className="mt-4 h-10 w-[min(32rem,85%)] rounded-2xl bg-white/10" />
          <div className="mt-4 h-4 w-[min(40rem,92%)] rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-[min(28rem,75%)] rounded-full bg-white/5" />
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="soft-panel animate-pulse rounded-[24px] p-5">
            <div className="h-3 w-24 rounded-full bg-white/10" />
            <div className="mt-4 h-8 w-24 rounded-2xl bg-white/10" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="glass-card animate-pulse rounded-[30px] p-6">
            <div className="h-5 w-40 rounded-full bg-white/10" />
            <div className="mt-3 h-3 w-56 rounded-full bg-white/5" />
            <div className="mt-6 grid gap-3">
              {Array.from({ length: 4 }).map((__, rowIndex) => (
                <div key={rowIndex} className="h-16 rounded-[22px] bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="sr-only">{title} — {subtitle}</div>
    </div>
  )
}
