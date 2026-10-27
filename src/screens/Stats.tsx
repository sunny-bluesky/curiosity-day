import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../auth/useAuth.ts'
import PeriodCalendar, { type PeriodUnit } from '../components/PeriodCalendar.tsx'
import Splash from '../components/Splash.tsx'
import { listEntries } from '../data/entries.ts'
import { listMarkers } from '../data/markers.ts'
import { addDays, addMonths, capitalize, formatDayRu, mondayOf, monthEnd, monthNameRu, monthStart, todayISO } from '../lib/dates.ts'
import { entryTypes } from '../lib/entryTypes.ts'
import { pluralRu } from '../lib/plural.ts'
import type { DayMarker, Entry, EntryType } from '../types.ts'

const UNITS: { id: PeriodUnit; label: string }[] = [
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'year', label: 'Год' },
]
const TYPES: EntryType[] = ['noticed', 'did', 'conclusion']

function periodRange(unit: PeriodUnit, anchor: string): { start: string; end: string } {
  if (unit === 'week') {
    const start = mondayOf(anchor)
    return { start, end: addDays(start, 6) }
  }
  if (unit === 'month') return { start: monthStart(anchor), end: monthEnd(anchor) }
  return { start: `${anchor.slice(0, 4)}-01-01`, end: `${anchor.slice(0, 4)}-12-31` }
}

function shift(unit: PeriodUnit, anchor: string, dir: 1 | -1): string {
  if (unit === 'week') return addDays(anchor, 7 * dir)
  if (unit === 'month') return addMonths(anchor, dir)
  return addMonths(anchor, 12 * dir)
}

function periodLabel(unit: PeriodUnit, anchor: string, start: string, end: string): string {
  if (unit === 'year') return anchor.slice(0, 4)
  if (unit === 'month') return `${capitalize(monthNameRu(anchor))} ${anchor.slice(0, 4)}`
  return `${formatDayRu(start)} – ${formatDayRu(end)}`
}

export default function Stats() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const today = todayISO()
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [markers, setMarkers] = useState<DayMarker[]>([])
  const [failed, setFailed] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [unit, setUnit] = useState<PeriodUnit>('month')
  const [anchor, setAnchor] = useState(today)

  useEffect(() => {
    let active = true
    // Markers are decoration: if they cannot be loaded, the numbers must still be shown.
    Promise.all([listEntries(), listMarkers().catch(() => [] as DayMarker[])])
      .then(([list, marks]) => {
        if (!active) return
        setEntries(list)
        setMarkers(marks)
      })
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [reloadKey])

  const { start, end } = periodRange(unit, anchor)
  const nextDisabled = periodRange(unit, shift(unit, anchor, 1)).start > today

  const stats = useMemo(() => {
    const inPeriod = (entries ?? []).filter((e) => e.entry_date >= start && e.entry_date <= end)
    const counts: Record<EntryType, number> = { noticed: 0, did: 0, conclusion: 0 }
    for (const e of inPeriod) counts[e.type] += 1
    return { counts, days: new Set(inPeriod.map((e) => e.entry_date)).size }
  }, [entries, start, end])

  // Markers are shown only for days that have entries.
  const visibleMarkers = useMemo(() => {
    const withEntries = new Set((entries ?? []).map((e) => e.entry_date))
    const map = new Map<string, DayMarker>()
    for (const m of markers) if (withEntries.has(m.day)) map.set(m.day, m)
    return map
  }, [entries, markers])

  if (failed) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <button type="button" aria-label="Назад" onClick={() => navigate('/', { replace: true })} className="absolute left-3 top-[max(1rem,env(safe-area-inset-top))] flex h-9 w-9 items-center justify-center rounded-full">
          <ChevronLeft size={24} />
        </button>
        <p className="text-common-gray">Не удалось загрузить статистику. Проверьте интернет.</p>
        <button
          type="button"
          onClick={() => {
            setFailed(false)
            setReloadKey((k) => k + 1)
          }}
          className="rounded-full bg-light-gray px-6 py-3 font-medium"
        >
          Повторить
        </button>
      </div>
    )
  }
  if (entries === null) return <Splash />

  return (
    <div className="px-5 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center gap-3">
        <button type="button" aria-label="Назад" onClick={() => navigate('/', { replace: true })} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl">Моя статистика</h1>
      </header>

      <section className="relative mt-4 flex h-32 items-center justify-center overflow-hidden" aria-live="polite">
        <img src={entryTypes.conclusion.icon} alt="" aria-hidden="true" className="absolute left-[-10%] top-2 h-24 w-40 -rotate-6 object-fill" />
        <span className="absolute right-[-4%] top-0 h-14 w-24 rotate-12 rounded-full bg-apple" />
        <span className="absolute right-12 top-14 h-5 w-5 rounded-full bg-apple" />
        <p className="relative flex items-baseline gap-2" data-testid="days-title">
          <span className="text-5xl">{stats.days}</span>
          <span className="text-base">
            {pluralRu(stats.days, 'удивительный', 'удивительных', 'удивительных')} {pluralRu(stats.days, 'день', 'дня', 'дней')}!
          </span>
        </p>
      </section>

      <h2 className="mt-4 text-center text-2xl">Что было удивительно?</h2>
      <div className="mt-5 flex justify-around">
        {TYPES.map((type) => (
          <div key={type} className="flex w-24 flex-col items-center">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <img src={entryTypes[type].icon} alt="" aria-hidden="true" className="absolute h-full w-full" />
              <span className="relative text-3xl" data-testid={`count-${type}`}>
                {stats.counts[type]}
              </span>
            </div>
            <span className="mt-1 text-sm">{entryTypes[type].label}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-2xl">Календарь</h2>
      <div role="tablist" className="mt-3 flex rounded-full bg-light-gray p-1">
        {UNITS.map((u) => (
          <button
            key={u.id}
            type="button"
            role="tab"
            aria-selected={unit === u.id}
            onClick={() => {
              setUnit(u.id)
              setAnchor(today)
            }}
            className={`flex-1 rounded-full py-1.5 text-sm ${unit === u.id ? 'bg-white font-medium shadow' : 'text-common-gray'}`}
          >
            {u.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-light-gray pt-4">
        <p className="text-sm font-medium text-accent" data-testid="period-label">
          {periodLabel(unit, anchor, start, end)}
        </p>
        <div className="flex gap-1">
          <button type="button" aria-label="Назад по времени" onClick={() => setAnchor(shift(unit, anchor, -1))} className="flex h-9 w-9 items-center justify-center rounded-full">
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Вперёд по времени"
            disabled={nextDisabled}
            onClick={() => setAnchor(shift(unit, anchor, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <PeriodCalendar unit={unit} anchor={anchor} today={today} markers={visibleMarkers} />
      </div>

      <button type="button" onClick={() => void signOut()} className="mx-auto mt-10 block rounded-full bg-light-gray px-6 py-3 font-medium">
        Выйти
      </button>
    </div>
  )
}
