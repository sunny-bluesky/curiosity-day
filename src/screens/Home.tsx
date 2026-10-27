import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { User as UserIcon } from 'lucide-react'
import DayStrip from '../components/DayStrip.tsx'
import EntryCard from '../components/EntryCard.tsx'
import Splash from '../components/Splash.tsx'
import { listEntries } from '../data/entries.ts'
import { ensureDayMarker, listMarkers } from '../data/markers.ts'
import { formatDayRu, todayISO } from '../lib/dates.ts'
import { entryTypes } from '../lib/entryTypes.ts'
import { primeKeyboard } from '../lib/keyboard.ts'
import type { DayMarker, Entry, EntryType } from '../types.ts'

const buttons: EntryType[] = ['noticed', 'did', 'conclusion']

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const today = todayISO()
  const startDay = (location.state as { day?: string } | null)?.day

  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [markers, setMarkers] = useState<DayMarker[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [selected, setSelected] = useState(startDay && startDay <= today ? startDay : today)
  const feed = useRef<HTMLElement>(null)

  useEffect(() => {
    let active = true
    Promise.all([listEntries(), listMarkers()])
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

  // Assign markers to days that have entries but no marker yet (older entries, or a failed earlier attempt).
  useEffect(() => {
    if (!entries || !markers) return
    const missing = [...new Set(entries.map((e) => e.entry_date))].filter((d) => !markers.some((m) => m.day === d)).sort()
    if (missing.length === 0) return
    let active = true
    ;(async () => {
      let list = markers
      for (const day of missing) {
        try {
          list = await ensureDayMarker(day, list)
        } catch {
          return
        }
        if (!active) return
      }
      setMarkers(list)
    })()
    return () => {
      active = false
    }
  }, [entries, markers])

  function retry() {
    setFailed(false)
    setReloadKey((k) => k + 1)
  }

  const groups = useMemo(() => {
    const result: { date: string; items: Entry[] }[] = []
    for (const entry of entries ?? []) {
      const last = result[result.length - 1]
      if (last && last.date === entry.entry_date) last.items.push(entry)
      else result.push({ date: entry.entry_date, items: [entry] })
    }
    return result
  }, [entries])

  const entryDays = useMemo(() => new Set((entries ?? []).map((e) => e.entry_date)), [entries])
  const visibleMarkers = useMemo(() => {
    const map = new Map<string, DayMarker>()
    for (const m of markers ?? []) if (entryDays.has(m.day)) map.set(m.day, m)
    return map
  }, [markers, entryDays])
  const earliest = groups.length ? groups[groups.length - 1].date : null

  // Scroll the feed to the entries of a day (or to the closest earlier day that has entries).
  function scrollToDay(day: string) {
    const target = groups.find((g) => g.date <= day) ?? groups[groups.length - 1]
    const el = target && document.getElementById(`day-${target.date}`)
    if (el && feed.current) feed.current.scrollTo({ top: el.offsetTop - 8, behavior: 'smooth' })
  }

  // Coming back from the editor: show the day that was just saved.
  const scrolledToStart = useRef(false)
  useEffect(() => {
    if (!startDay || !entries || scrolledToStart.current) return
    scrolledToStart.current = true
    const target = groups.find((g) => g.date <= startDay) ?? groups[groups.length - 1]
    const el = target && document.getElementById(`day-${target.date}`)
    if (el && feed.current) feed.current.scrollTop = el.offsetTop - 8
  }, [startDay, entries, groups])

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex justify-end px-4 pb-1 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          type="button"
          aria-label="Статистика"
          onClick={() => navigate('/stats')}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md"
        >
          <UserIcon size={20} />
        </button>
      </header>

      <DayStrip
        selected={selected}
        today={today}
        earliest={earliest}
        markers={visibleMarkers}
        onSelect={(day) => {
          setSelected(day)
          scrollToDay(day)
        }}
      />

      <main ref={feed} className="relative flex-1 overflow-y-auto px-5">
        {entries === null && !failed && <Splash />}

        {failed && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="text-common-gray">Не удалось загрузить записи. Проверьте интернет.</p>
            <button type="button" onClick={retry} className="rounded-full bg-light-gray px-6 py-3 font-medium">
              Повторить
            </button>
          </div>
        )}

        {entries !== null && entries.length === 0 && (
          <div className="flex h-full items-center justify-center" aria-hidden="true">
            <div className="h-40 w-40 rounded-full bg-peach/50 blur-3xl" />
          </div>
        )}

        {groups.map((group) => (
          <section key={group.date} id={`day-${group.date}`} className="pb-2">
            <h2 className="pt-3 text-sm text-common-gray">{formatDayRu(group.date)}</h2>
            {group.items.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onOpen={() => navigate(`/entry/${entry.id}`)} />
            ))}
          </section>
        ))}
        <div className="h-6" />
      </main>

      <footer className="relative bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 text-center">
        <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-white to-transparent" />
        <h2 className="text-xl">Что интересного сегодня?</h2>
        <div className="mt-3 flex justify-around">
          {buttons.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                primeKeyboard()
                navigate(`/new/${type}?date=${selected}`)
              }}
              className="flex w-24 flex-col items-center gap-1"
            >
              <img src={entryTypes[type].icon} alt="" className="h-14 w-14" />
              <span className="text-sm">{entryTypes[type].label}</span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  )
}
