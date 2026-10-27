import { useRef, useState, type PointerEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { entryTypes } from '../lib/entryTypes.ts'
import type { Entry } from '../types.ts'

const MAX_CHARS = 180
const SHIFT = 48 // how far a selected card is pushed to the right
const THRESHOLD = 56 // swipe distance that counts as "select"
const EDGE = 24 // touches starting at the screen edge belong to the system "back" gesture

function shorten(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > MAX_CHARS ? `${flat.slice(0, MAX_CHARS).trimEnd()}…` : flat
}

type Props = { entry: Entry; onOpen: () => void; selected?: boolean; onToggle?: () => void }

export default function EntryCard({ entry, onOpen, selected = false, onToggle }: Props) {
  const { icon, label } = entryTypes[entry.type]
  const title = shorten(entry.title)
  const body = shorten(entry.body)

  const [drag, setDrag] = useState(0)
  const start = useRef<{ x: number; y: number } | null>(null)
  const swiping = useRef(false)
  const justSwiped = useRef(false)

  function reset() {
    start.current = null
    swiping.current = false
    setDrag(0)
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!onToggle || (e.pointerType === 'mouse' && e.button !== 0) || e.clientX < EDGE) return
    start.current = { x: e.clientX, y: e.clientY }
    swiping.current = false
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const s = start.current
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (!swiping.current) {
      // Vertical movement: it is a scroll, leave it alone.
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        start.current = null
        return
      }
      // Only a clear movement to the right starts a swipe.
      if (dx > 12 && dx > Math.abs(dy) * 2) {
        swiping.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
      } else return
    }
    setDrag(Math.max(0, Math.min(dx, 40)))
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (swiping.current && start.current) {
      if (e.clientX - start.current.x >= THRESHOLD) onToggle?.()
      // The click that follows a swipe must not open the entry.
      justSwiped.current = true
      window.setTimeout(() => (justSwiped.current = false), 350)
    }
    reset()
  }

  function open() {
    if (!justSwiped.current) onOpen()
  }

  const text = (
    <>
      {title && <span className="font-medium">{title}</span>}
      {title && body && <br />}
      {body && <span>{body}</span>}
      {!title && !body && <span className="text-common-gray">Пустая запись</span>}
    </>
  )

  // A conclusion shows a large icon on the left; other types show a small icon at the end of the text.
  const content =
    entry.type === 'conclusion' ? (
      <button type="button" onClick={open} className="flex w-full items-start gap-3 py-3 text-left">
        <img src={icon} alt={label} className="mt-1 h-12 w-12 shrink-0" />
        <p className="min-w-0 break-words text-base leading-snug">{text}</p>
      </button>
    ) : (
      <button type="button" onClick={open} className="block w-full py-3 text-left">
        <p className="break-words text-base leading-snug">
          {text}
          <img src={icon} alt={label} className="ml-1 inline h-7 w-7 align-middle" />
        </p>
      </button>
    )

  const offset = (selected ? SHIFT : 0) + drag

  return (
    <div
      className="relative touch-pan-y select-none"
      data-selected={selected ? 'true' : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={reset}
    >
      {(selected || drag > 0) && (
        <button
          type="button"
          aria-label="Убрать из вывода"
          onClick={onToggle}
          className="absolute left-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-common-gray text-white"
        >
          <ArrowUpRight size={20} />
        </button>
      )}
      <div style={{ paddingLeft: offset }} className={drag ? '' : 'transition-[padding] duration-200'}>
        <div className={`-mx-3 my-0.5 rounded-2xl px-3 ${selected ? 'bg-apple/30' : ''}`}>{content}</div>
      </div>
    </div>
  )
}
