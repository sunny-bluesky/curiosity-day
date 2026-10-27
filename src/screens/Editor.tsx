import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Check, ChevronLeft, MoreHorizontal } from 'lucide-react'
import AutoTextarea from '../components/AutoTextarea.tsx'
import ConfirmDialog from '../components/ConfirmDialog.tsx'
import MarkerShape from '../components/MarkerShape.tsx'
import Splash from '../components/Splash.tsx'
import SourceCards from '../components/SourceCards.tsx'
import { createEntry, deleteEntry, getEntry, updateEntry } from '../data/entries.ts'
import { createLinks, getEntriesByIds, getSources } from '../data/links.ts'
import { ensureDayMarker, listMarkers } from '../data/markers.ts'
import { formatDateRu, formatDateTimeRu, todayISO } from '../lib/dates.ts'
import { entryTypes } from '../lib/entryTypes.ts'
import { releasePrimedKeyboard } from '../lib/keyboard.ts'
import { isEntryType, type DayMarker, type Entry, type EntryType } from '../types.ts'

// Keeps the editor exactly as tall as the visible area, so the keyboard does not cover the toolbar.
function useVisibleHeight(): number | undefined {
  const [height, setHeight] = useState<number | undefined>(() => window.visualViewport?.height)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      setHeight(vv.height)
      window.scrollTo(0, 0)
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])
  return height
}

// A new key for every visit, so opening a conclusion from an entry editor starts with a clean form.
export default function EditorPage() {
  const { key } = useLocation()
  return <Editor key={key} />
}

function Editor() {
  const { type: typeParam, id } = useParams()
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  // Entries chosen in the feed (or the entry being written) as the basis of a new conclusion.
  const [sourceIds] = useState<string[]>(() => {
    const ids = (location.state as { sources?: unknown } | null)?.sources
    return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string') : []
  })
  const [sources, setSources] = useState<Entry[]>([])

  const [entry, setEntry] = useState<Entry | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing' | 'error'>(id ? 'loading' : 'ready')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [date, setDate] = useState(() => {
    const wanted = search.get('date')
    const today = todayISO()
    return wanted && /^\d{4}-\d{2}-\d{2}$/.test(wanted) && wanted <= today ? wanted : today
  })
  const [initial, setInitial] = useState({ title: '', body: '', date })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirm, setConfirm] = useState<'delete' | 'leave' | null>(null)
  const [markers, setMarkers] = useState<DayMarker[]>([])

  const titleRef = useRef<HTMLTextAreaElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const height = useVisibleHeight()
  const today = todayISO()

  useEffect(() => {
    let active = true
    listMarkers()
      .then((list) => active && setMarkers(list))
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  // New entry: hand the focus from the helper input (set on tap) to the title, keeping the keyboard up.
  useEffect(() => {
    if (id) return
    titleRef.current?.focus()
    releasePrimedKeyboard()
  }, [id])

  useEffect(() => {
    if (!id) return
    let active = true
    getEntry(id)
      .then((found) => {
        if (!active) return
        if (!found) return setLoadState('missing')
        setEntry(found)
        setTitle(found.title)
        setBody(found.body)
        setDate(found.entry_date)
        setInitial({ title: found.title, body: found.body, date: found.entry_date })
        setLoadState('ready')
      })
      .catch(() => active && setLoadState('error'))
    return () => {
      active = false
    }
  }, [id])

  // Sources: chosen ones for a new conclusion, or the saved links of an existing one.
  useEffect(() => {
    let active = true
    const load = id ? getSources(id) : getEntriesByIds(sourceIds)
    load.then((list) => active && setSources(list)).catch(() => undefined)
    return () => {
      active = false
    }
  }, [id, sourceIds])

  const type: EntryType | null = entry ? entry.type : isEntryType(typeParam) ? typeParam : null
  if (!id && !type) return <Navigate to="/" replace />

  if (loadState === 'loading') return <Splash />
  if (loadState === 'missing' || loadState === 'error' || !type) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-common-gray">
          {loadState === 'missing' ? 'Такой записи нет. Возможно, она удалена.' : 'Не удалось загрузить запись. Проверьте интернет.'}
        </p>
        <button type="button" onClick={() => navigate('/', { replace: true })} className="rounded-full bg-light-gray px-6 py-3 font-medium">
          К записям
        </button>
      </div>
    )
  }

  const config = entryTypes[type]
  const dirty = title !== initial.title || body !== initial.body || date !== initial.date

  const marker = markers.find((m) => m.day === date)

  // Back to the feed, showing the day of this entry.
  function leave(day?: string) {
    navigate('/', { replace: true, state: day ? { day } : undefined })
  }

  function onBack() {
    if (dirty && (title.trim() || body.trim())) setConfirm('leave')
    else leave()
  }

  // Saves the entry; returns it, or null if nothing was saved (empty or failed).
  async function persist(): Promise<Entry | null> {
    const cleanTitle = title.trim()
    const cleanBody = body.replace(/\s+$/, '')
    if (!cleanTitle && !cleanBody.trim()) return null
    const input = { title: cleanTitle, body: cleanBody, entry_date: date > today ? today : date }
    let saved: Entry
    if (id) {
      saved = dirty ? await updateEntry(id, input) : entry!
    } else {
      saved = await createEntry(type!, input)
      if (type === 'conclusion' && sourceIds.length) {
        try {
          await createLinks(saved.id, sourceIds)
        } catch (e) {
          await deleteEntry(saved.id).catch(() => undefined) // do not leave a conclusion without its links
          throw e
        }
      }
    }
    // The day gets its marker on its first entry (if this fails, the feed assigns it on the next load).
    await ensureDayMarker(input.entry_date).catch(() => undefined)
    return saved
  }

  async function onSave() {
    if (!title.trim() && !body.trim()) {
      if (id) setError('Запись пустая. Напишите что-нибудь или удалите её через меню «…».')
      else leave()
      return
    }
    setSaving(true)
    setError(null)
    try {
      const saved = await persist()
      leave(saved?.entry_date)
    } catch {
      setError('Не удалось сохранить. Проверьте интернет и попробуйте ещё раз.')
      setSaving(false)
    }
  }

  // Arrow: save this entry, then start a conclusion based on it.
  async function onConclude() {
    if (!title.trim() && !body.trim()) {
      setError('Сначала напишите что-нибудь, потом можно сделать вывод.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const saved = await persist()
      if (!saved) return
      navigate(`/new/conclusion?date=${todayISO()}`, { replace: true, state: { sources: [saved.id] } })
    } catch {
      setError('Не удалось сохранить. Проверьте интернет и попробуйте ещё раз.')
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!id) return
    setSaving(true)
    try {
      await deleteEntry(id)
      leave(entry?.entry_date)
    } catch {
      setConfirm(null)
      setError('Не удалось удалить. Проверьте интернет и попробуйте ещё раз.')
      setSaving(false)
    }
  }

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        height: height ? `${height}px` : '100dvh',
        backgroundImage: `radial-gradient(ellipse 60% 22% at 50% 0%, ${config.color}99, transparent)`,
      }}
    >
      <header className="relative flex items-center justify-between px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Назад" onClick={onBack} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full">
            <ChevronLeft size={22} />
          </button>
          <label className="relative flex items-center gap-2 text-sm text-common-gray">
            {marker && <MarkerShape shape={marker.shape} color={marker.color} size={22} />}
            {formatDateRu(date)}
            <input
              type="date"
              aria-label="Дата впечатления"
              value={date}
              max={today}
              onChange={(e) => e.target.value && setDate(e.target.value > today ? today : e.target.value)}
              className="absolute inset-0 h-full w-full opacity-0"
            />
          </label>
          <img src={config.icon} alt={config.label} className="pointer-events-none ml-3 h-7 w-7" />
        </div>
        <button
          type="button"
          aria-label="Настройки записи"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md"
        >
          <MoreHorizontal size={18} />
        </button>
        {menuOpen && (
          <div className="absolute right-4 top-[calc(max(1rem,env(safe-area-inset-top))+2.75rem)] z-20 w-64 rounded-2xl bg-white p-4 text-sm shadow-xl">
            <p className="text-common-gray">Дата впечатления</p>
            <p className="mb-2">{formatDateRu(date)}</p>
            <p className="text-common-gray">Запись написана</p>
            <p>{entry ? formatDateTimeRu(entry.created_at) : 'ещё не сохранена'}</p>
            {id && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setConfirm('delete')
                }}
                className="mt-4 w-full rounded-xl bg-peach px-3 py-2 text-left font-medium"
              >
                Удалить запись
              </button>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-5 pt-4" onClick={() => setMenuOpen(false)}>
        {type === 'conclusion' && sources.length > 0 && (
          <div className="mb-4">
            <SourceCards sources={sources} />
          </div>
        )}
        <AutoTextarea
          ref={titleRef}
          value={title}
          onChange={setTitle}
          placeholder={config.placeholder}
          ariaLabel="Заголовок"
          autoFocus={!id}
          className="text-xl leading-snug"
          onKeyDown={(e) => {
            // First Enter moves from the title to the main text.
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              bodyRef.current?.focus()
            }
          }}
        />
        <div className="mt-4 pb-6">
          <AutoTextarea ref={bodyRef} value={body} onChange={setBody} ariaLabel="Текст записи" className="min-h-40 text-base leading-snug" />
        </div>
      </main>

      <footer className="flex items-center gap-3 px-4 pb-3 pt-2">
        <button
          type="button"
          aria-label="Сделать вывод"
          onClick={() => void onConclude()}
          disabled={saving}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-common-gray shadow-md disabled:opacity-60"
        >
          <ArrowUpRight size={24} />
        </button>
        {error && (
          <p role="alert" className="flex-1 text-sm">
            {error}
          </p>
        )}
        <span className="flex-1" />
        <button
          type="button"
          aria-label="Сохранить"
          onClick={() => void onSave()}
          disabled={saving}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-common-gray text-white shadow-md disabled:opacity-60"
        >
          <Check size={24} />
        </button>
      </footer>

      {confirm === 'delete' && (
        <ConfirmDialog title="Удалить запись?" confirmLabel="Удалить" danger busy={saving} onConfirm={() => void onDelete()} onCancel={() => setConfirm(null)} />
      )}
      {confirm === 'leave' && (
        <ConfirmDialog title="Выйти без сохранения?" confirmLabel="Выйти" danger onConfirm={() => leave(initial.date || undefined)} onCancel={() => setConfirm(null)} />
      )}
    </div>
  )
}
