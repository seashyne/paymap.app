import { createJournalEntry } from "@/lib/accounting/engine"
import type { CreateJournalEntryInput } from "../domain/journal"

export async function createJournalEntryService(input: CreateJournalEntryInput) {
  return createJournalEntry(input)
}
