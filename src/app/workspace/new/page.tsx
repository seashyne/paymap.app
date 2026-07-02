import { redirect } from "next/navigation"
import Link from "next/link"
import { Building2, Store, ArrowLeft, Sparkles } from "lucide-react"
import { requireUser } from "@/lib/authz"
import NewWorkspaceForm from "@/components/workspace/NewWorkspaceForm"
import { detectSiteLang, getWorkspaceFlowMessages } from "@/lib/i18n/site"

export default async function NewWorkspacePage({
  searchParams,
}: {
  searchParams?: { type?: string }
}) {
  const user = await requireUser()
  const lang = detectSiteLang()
  const copy = getWorkspaceFlowMessages(lang).newWorkspace
  const accountMode = (user as any).accountMode ?? "personal"
  const type = searchParams?.type === "merchant" ? "merchant"
    : searchParams?.type === "business" ? "business"
    : accountMode

  if (type === "personal" || accountMode === "personal") {
    redirect("/dashboard")
  }

  if (type !== accountMode) {
    redirect(`/workspace/new?type=${accountMode}`)
  }

  const isMerchant = type === "merchant"
  const color = isMerchant ? "#e11d48" : "#0ea5e9"
  const bg = isMerchant ? "rgba(225,29,72,0.1)" : "rgba(14,165,233,0.1)"
  const border = isMerchant ? "rgba(225,29,72,0.25)" : "rgba(14,165,233,0.25)"
  const Icon = isMerchant ? Store : Building2

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "var(--bg)", fontFamily: "var(--font-sans)" }}
    >
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[320px] w-[520px] rounded-full opacity-[0.06] blur-[110px]"
          style={{ background: color }}
        />
      </div>

      <div className="w-full max-w-[520px]">
        <Link
          href="/workspace/select"
          className="inline-flex items-center gap-2 text-sm mb-8 hover:underline"
          style={{ color: "var(--text-3)" }}
        >
          <ArrowLeft size={14} /> {copy.back}
        </Link>

        <div className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_94%,white),color-mix(in_srgb,var(--surface-2)_90%,transparent))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold" style={{ borderColor: border, color, background: bg }}>
            <Sparkles size={12} /> {copy.badge}
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: bg, border: `1px solid ${border}` }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div>
              <div className="font-black text-xl tracking-[-0.02em]" style={{ color: "var(--text)" }}>
                {isMerchant ? copy.titleMerchant : copy.titleBusiness}
              </div>
              <div className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>
                {isMerchant ? copy.descMerchant : copy.descBusiness}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[22px] border p-5" style={{ borderColor: border, background: bg }}>
            <div className="font-black text-sm" style={{ color }}>
              {isMerchant ? copy.panelTitleMerchant : copy.panelTitleBusiness}
            </div>
            <p className="mt-2 text-sm leading-7" style={{ color: "var(--text-2)" }}>
              {isMerchant ? copy.panelBodyMerchant : copy.panelBodyBusiness}
            </p>
            <p className="mt-3 text-xs font-medium" style={{ color: "var(--text-3)" }}>
              {isMerchant ? copy.starterMerchant : copy.starterBusiness}
            </p>
          </div>

          <div className="mt-6 rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-6">
            <NewWorkspaceForm
              type={type}
              color={color}
              copy={{
                label: isMerchant ? copy.fieldMerchant : copy.fieldBusiness,
                placeholder: isMerchant ? copy.placeholderMerchant : copy.placeholderBusiness,
                emptyError: copy.emptyError,
                failedError: copy.failedError,
                creating: copy.creating,
                createButton: isMerchant ? copy.createMerchant : copy.createBusiness,
                helper: copy.helper,
              }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
