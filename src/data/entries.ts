import { supabase } from '../lib/supabase.ts'
import type { Entry, EntryType } from '../types.ts'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export type EntryInput = { title: string; body: string; entry_date: string }

/** All entries of the signed-in user (RLS), newest impression first, then newest written. */
export async function listEntries(): Promise<Entry[]> {
  const { data, error } = await client()
    .from('entries')
    .select('*')
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Entry[]
}

export async function getEntry(id: string): Promise<Entry | null> {
  const { data, error } = await client().from('entries').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return (data as Entry | null) ?? null
}

export async function createEntry(type: EntryType, input: EntryInput): Promise<Entry> {
  const { data, error } = await client()
    .from('entries')
    .insert({ type, ...input })
    .select()
    .single()
  if (error) throw error
  return data as Entry
}

export async function updateEntry(id: string, input: EntryInput): Promise<Entry> {
  const { data, error } = await client().from('entries').update(input).eq('id', id).select().single()
  if (error) throw error
  return data as Entry
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await client().from('entries').delete().eq('id', id)
  if (error) throw error
}
