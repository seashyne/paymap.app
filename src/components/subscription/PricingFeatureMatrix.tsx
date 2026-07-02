export default function PricingFeatureMatrix() {
  const rows = [
    ["Wallet / Budget / Savings", "✔", "✔", "✔", "✔"],
    ["Investments / Installments / Tax basic", "✔", "✔", "✔", "✔"],
    ["AI insights / automation", "—", "✔", "✔", "✔"],
    ["Business payroll basic", "—", "—", "✔", "✔"],
    ["Invoices Lite", "—", "—", "✔", "✔"],
    ["Accounting / Reconciliation / VAT", "—", "—", "SME+", "✔"],
    ["Merchant sales + inventory basic", "—", "—", "—", "—"],
    ["Merchant accounting / reconciliation", "—", "—", "—", "Growth+"],
    ["Enterprise controls / reports", "—", "—", "—", "✔"],
  ]

  const headers = ["Feature", "Free", "Pro", "Business", "Enterprise"]

  return (
    <div className="overflow-x-auto rounded-[28px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)]">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[var(--text-3)]">
            {headers.map((h) => <th key={h} className="px-4 py-4 font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-[var(--border)] last:border-b-0">
              {row.map((cell, idx) => <td key={idx} className="px-4 py-3 text-[var(--text)]">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
