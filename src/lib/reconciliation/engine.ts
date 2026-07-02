// v14: Prisma stub client — define enum locally
const TransactionType = { income: "income", expense: "expense" } as const
type TransactionType = (typeof TransactionType)[keyof typeof TransactionType]

export type ImportedStatementLine = {
  lineNo: number
  bookedAt: Date
  description: string
  reference?: string | null
  amount: number
  kind: TransactionType
}

export function parseStatementCsv(csv: string): ImportedStatementLine[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length <= 1) return []

  const rows = lines.slice(1).map((raw) => raw.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")))

  return rows
    .map((row, index) => {
      const [dateStr, description, amountStr, typeStr, reference] = row
      const amount = Number(amountStr ?? 0)
      const kind = String(typeStr ?? "expense").toLowerCase() === "income" || amount >= 0 ? "income" : "expense"
      return {
        lineNo: index + 1,
        bookedAt: new Date(dateStr),
        description: description ?? "Statement line",
        reference: reference || null,
        amount: Math.abs(amount),
        kind: kind as TransactionType,
      }
    })
    .filter((line) => !Number.isNaN(line.bookedAt.getTime()) && Number.isFinite(line.amount))
}

export type MatchCandidate = {
  id: string
  amount: number
  happenedAt: Date
  type: TransactionType
  note?: string | null
}

export type MatchResult = {
  statementLineNo: number
  transactionId: string
  confidence: number
  deltaAmount: number
  deltaDays: number
}

function normalize(text?: string | null) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]+/gi, " ")
    .trim()
}

export function matchStatementLines(
  statementLines: ImportedStatementLine[],
  transactions: MatchCandidate[],
  tolerance = 1,
): { matches: MatchResult[]; unmatchedLines: ImportedStatementLine[]; unmatchedTransactions: MatchCandidate[] } {
  const used = new Set<string>()
  const matches: MatchResult[] = []
  const unmatchedLines: ImportedStatementLine[] = []

  for (const line of statementLines) {
    let best: { tx: MatchCandidate; score: number; deltaAmount: number; deltaDays: number } | null = null

    for (const tx of transactions) {
      if (used.has(tx.id)) continue
      if (tx.type !== line.kind) continue

      const deltaAmount = Math.abs(tx.amount - Math.abs(line.amount))
      if (deltaAmount > tolerance) continue

      const deltaDays = Math.abs(Math.round((tx.happenedAt.getTime() - line.bookedAt.getTime()) / 86400000))
      if (deltaDays > 5) continue

      const hay1 = normalize(line.description)
      const hay2 = normalize(tx.note)
      const refBonus = line.reference && hay2.includes(normalize(line.reference)) ? 0.15 : 0
      const descBonus = hay1 && hay2 && (hay1.includes(hay2) || hay2.includes(hay1)) ? 0.1 : 0
      const amountScore = Math.max(0, 1 - deltaAmount / Math.max(1, Math.abs(line.amount)))
      const dateScore = Math.max(0, 1 - deltaDays / 5)
      const score = amountScore * 0.65 + dateScore * 0.2 + refBonus + descBonus

      if (!best || score > best.score) {
        best = { tx, score, deltaAmount, deltaDays }
      }
    }

    if (best) {
      used.add(best.tx.id)
      matches.push({
        statementLineNo: line.lineNo,
        transactionId: best.tx.id,
        confidence: Number(best.score.toFixed(3)),
        deltaAmount: Number(best.deltaAmount.toFixed(2)),
        deltaDays: best.deltaDays,
      })
    } else {
      unmatchedLines.push(line)
    }
  }

  const unmatchedTransactions = transactions.filter((tx) => !used.has(tx.id))
  return { matches, unmatchedLines, unmatchedTransactions }
}
