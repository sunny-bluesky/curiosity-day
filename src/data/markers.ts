import { supabase } from '../lib/supabase.ts'
import { addDays } from '../lib/dates.ts'
import { pickMarker } from '../lib/markers.ts'
import type { DayMarker } from '../types.ts'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function listMarkers(): Promise<DayMarker[]> {
  const { data, error } = await client().from('day_markers').select('day, shape, color')
  if (error) throw error
  return (data ?? []) as DayMarker[]
}

/**
 * Makes sure the day has a marker. A marker is assigned once (random, different from the neighbouring days)
 * and is never removed, even if all entries of the day are deleted. Returns the fresh list.
 */
export async function ensureDayMarker(day: string, known?: DayMarker[]): Promise<DayMarker[]> {
  const list = known ?? (await listMarkers())
  if (list.some((m) => m.day === day)) return list
  const around = [addDays(day, -1), addDays(day, 1)]
  const pick = pickMarker(list.filter((m) => around.includes(m.day)))
  const { error } = await client()
    .from('day_markers')
    .upsert({ day, ...pick }, { onConflict: 'user_id,day', ignoreDuplicates: true })
  if (error) throw error
  return listMarkers()
}
