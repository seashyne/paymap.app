type WalletSummaryLiteProps = {
  totalBalance: number
  walletCount: number
  transactionCount: number
  recentCount: number
  currency: string
  order?: Array<"balance" | "wallets" | "transactions" | "activity">
  labels?: Partial<Record<"balance" | "wallets" | "transactions" | "activity", string>>
}

export default function WalletSummaryLite({ totalBalance, walletCount, transactionCount, recentCount, currency, order = ["balance", "wallets", "transactions", "activity"], labels }: WalletSummaryLiteProps) {
  const source = {
    balance: { key: "balance", label: labels?.balance ?? "ยอดรวมทุก wallet", value: `${currency} ${totalBalance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    wallets: { key: "wallets", label: labels?.wallets ?? "จำนวน wallet", value: walletCount.toLocaleString('th-TH') },
    transactions: { key: "transactions", label: labels?.transactions ?? "ธุรกรรมทั้งหมด", value: transactionCount.toLocaleString('th-TH') },
    activity: { key: "activity", label: labels?.activity ?? "กิจกรรม 30 วัน", value: recentCount.toLocaleString('th-TH') },
  } as const

  const cards = order.map((key) => source[key])

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.key} className="soft-panel min-w-0 rounded-[24px] p-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{card.label}</div>
          <div className="mt-2 break-words text-xl font-black">{card.value}</div>
        </div>
      ))}
    </section>
  )
}
