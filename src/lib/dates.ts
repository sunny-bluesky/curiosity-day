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
