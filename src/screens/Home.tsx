import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User as UserIcon } from 'lucide-react'
import { useAuth } from '../auth/useAuth.ts'
import { listEntries } from '../data/entries.ts'
import EntryCard from '../components/EntryCard.tsx'
import Splash from '../components/Splash.tsx'
import { entryTypes } from '../lib/entryTypes.ts'
import { primeKeyboard } from '../lib/keyboard.ts'
import { formatDayRu, todayISO } from '../lib/dates.ts'
import type { Entry, EntryType } from '../types.ts'

const buttons: EntryType[] = ['noticed', 'did', 'conclusion']

export default function Home() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  // The day strip arrives in stage 3; until then new entries go to today (the date can be changed in the editor).
  const selectedDate = todayISO()

  useEffect(() => {
    let active = true
    listEntries()
      .then((list) => active && setEntries(list))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [reloadKey])

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

  const meta = user?.user_metadata as { full_name?: string; name?: string } | undefined
  const shownName = meta?.full_name ?? meta?.name ?? user?.email ?? ''

  return (
    <div className="flex h-dvh flex-col">
      <header className="relative flex justify-end px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          type="button"
          aria-label="Профиль"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md"
        >
          <UserIcon size={20} />
        </button>
        {menuOpen && (
          <div className="absolute right-4 top-[calc(max(1rem,env(safe-area-inset-top))+3.25rem)] z-20 w-56 rounded-2xl bg-white p-3 shadow-xl">
            <p className="truncate px-2 pb-2 text-sm text-common-gray">{shownName}</p>
            <button type="button" onClick={() => void signOut()} className="w-full rounded-xl bg-light-gray px-3 py-2 text-left font-medium">
              Выйти
            </button>
          </div>
        )}
      </header>

      <main className="relative flex-1 overflow-y-auto px-5" onClick={() => setMenuOpen(false)}>
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
          <section key={group.date} className="pb-2">
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
                navigate(`/new/${type}?date=${selectedDate}`)
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
