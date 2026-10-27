import { supabase } from '../lib/supabase.ts'
import type { Entry } from '../types.ts'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

/** Links are written once, when a conclusion is created. */
export async function createLinks(conclusionId: string, sourceIds: string[]): Promise<void> {
  if (sourceIds.length === 0) return
  const rows = sourceIds.map((source_id) => ({ conclusion_id: conclusionId, source_id }))
  const { error } = await client().from('entry_links').insert(rows)
  if (error) throw error
}

/** Entries by id, in the order of the given ids (missing ones are skipped). */
export async function getEntriesByIds(ids: string[]): Promise<Entry[]> {
  if (ids.length === 0) return []
  const { data, error } = await client().from('entries').select('*').in('id', ids)
  if (error) throw error
  const byId = new Map((data as Entry[]).map((e) => [e.id, e]))
  return ids.flatMap((id) => byId.get(id) ?? [])
}

/** Source entries of a saved conclusion (only those that still exist), oldest impression first. */
export async function getSources(conclusionId: string): Promise<Entry[]> {
  const { data, error } = await client().from('entry_links').select('source_id').eq('conclusion_id', conclusionId)
  if (error) throw error
  const list = await getEntriesByIds((data ?? []).map((r: { source_id: string }) => r.source_id))
  return list.sort((a, b) => a.entry_date.localeCompare(b.entry_date) || a.created_at.localeCompare(b.created_at))
}
