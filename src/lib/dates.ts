// Dates are the device's local calendar day. No time-zone conversion is done.

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** "1 октября 2026" */
export function formatDateRu(iso: string): string {
  return parseISO(iso)
    .toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    .replace(/\s?г\.$/, '')
}

/** "1 октября" (with the year only if it is not the current one) */
export function formatDayRu(iso: string): string {
  const d = parseISO(iso)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d
    .toLocaleDateString('ru-RU', sameYear ? { day: 'numeric', month: 'long' } : { day: 'numeric', month: 'long', year: 'numeric' })
    .replace(/\s?г\.$/, '')
}

/** "1 октября 2026, 14:05" for a stored timestamp */
export function formatDateTimeRu(timestamp: string): string {
  return new Date(timestamp)
    .toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    .replace(/\s?г\.,?\s?(в\s)?/, ', ')
}

export function addDays(iso: string, n: number): string {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

/** Monday of the week that contains the day. */
export function mondayOf(iso: string): string {
  const dow = (parseISO(iso).getDay() + 6) % 7
  return addDays(iso, -dow)
}

export function addMonths(iso: string, n: number): string {
  const d = parseISO(iso)
  return toISODate(new Date(d.getFullYear(), d.getMonth() + n, 1))
}

export function monthStart(iso: string): string {
  return `${iso.slice(0, 7)}-01`
}

export function monthEnd(iso: string): string {
  const d = parseISO(iso)
  return toISODate(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

export function dayOfMonth(iso: string): number {
  return Number(iso.slice(8, 10))
}

/** 0 = Monday ... 6 = Sunday */
export function weekdayIndex(iso: string): number {
  return (parseISO(iso).getDay() + 6) % 7
}

export function monthNameRu(iso: string): string {
  return parseISO(iso).toLocaleDateString('ru-RU', { month: 'long' })
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
