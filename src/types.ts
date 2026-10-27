export type EntryType = 'noticed' | 'did' | 'conclusion'

export type Entry = {
  id: string
  user_id: string
  type: EntryType
  title: string
  body: string
  /** local calendar day of the impression, "YYYY-MM-DD" */
  entry_date: string
  created_at: string
  updated_at: string
}

export function isEntryType(value: string | undefined): value is EntryType {
  return value === 'noticed' || value === 'did' || value === 'conclusion'
}
