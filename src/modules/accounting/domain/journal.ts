export interface JournalLineInput {
  accountId: string
  debit?: number
  credit?: number
  note?: string
}

export interface CreateJournalEntryInput {
  orgId?: string
  userId: string
  description?: string
  date?: Date
  lines: JournalLineInput[]
  sourceType?: string
  sourceId?: string
}
