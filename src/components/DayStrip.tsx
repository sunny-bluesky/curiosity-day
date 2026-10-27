import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import MarkerShape from './MarkerShape.tsx'
import { addDays, dayOfMonth, monthNameRu } from '../lib/dates.ts'
import type { DayMarker } from '../types.ts'

type Props = {
  selected: string
  today: string
  /** oldest day that has an entry, so it can be reached by scrolling back */
  earliest: string | null
  /** markers of days that have entries (only those are shown) */
  markers: Map<string, DayMarker>
  onSelect: (day: string) => void
}

const VISIBLE = 7
const FUTURE_CELLS = 3

// Seven days in a row; swipe sideways to go back in time. Future days are shown but disabled.
export default function DayStrip({ selected, today, earliest, markers, onSelect }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')

  const days = useMemo(() => {
    const floor = addDays(today, -1100)
    const base = addDays(today, -120)
    let start = earliest && earliest < base ? earliest : base
    if (start < floor) start = floor
    const list: string[] = []
    for (let d = start; d <= addDays(today, FUTURE_CELLS); d = addDays(d, 1)) list.push(d)
    return list
  }, [earliest, today])
  const firstDay = days[0]

  function updateLabel() {
    const el = scroller.current
    if (!el) return
    const cell = el.clientWidth / VISIBLE
    const left = Math.max(0, Math.min(days.length - 1, Math.round(el.scrollLeft / cell)))
    const right = Math.min(days.length - 1, left + VISIBLE - 1)
    const a = monthNameRu(days[left])
    const b = monthNameRu(days[right])
    const next = a === b ? a : `${a} · ${b}`
    setLabel((prev) => (prev === next ? prev : next))
  }

  // Put the selected day in the middle of the strip when the list (re)builds.
  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const index = Math.max(0, days.indexOf(selected))
    el.scrollLeft = (index - Math.floor(VISIBLE / 2)) * (el.clientWidth / VISIBLE)
    updateLabel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstDay])

  const frame = useRef(0)
  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  return (
    <div className="px-1">
      <div
        ref={scroller}
        onScroll={() => {
          cancelAnimationFrame(frame.current)
          frame.current = requestAnimationFrame(updateLabel)
        }}
        className="flex snap-x overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {days.map((day) => {
          const future = day > today
          const marker = markers.get(day)
          const isSelected = day === selected
          return (
            <button
              key={day}
              type="button"
              disabled={future}
              aria-label={day}
              aria-pressed={isSelected}
              onClick={() => onSelect(day)}
              className="relative flex h-16 shrink-0 basis-1/7 snap-start items-center justify-center"
            >
              {marker ? (
                <MarkerShape shape={marker.shape} color={marker.color} size={isSelected ? 60 : 46} className="absolute" />
              ) : (
                <span
                  className={`absolute rounded-full ${isSelected ? 'h-14 w-14 bg-dark-gray' : future ? 'h-11 w-11 bg-dusty' : 'h-11 w-11 bg-light-gray'}`}
                />
              )}
              <span
                className={`relative text-lg ${isSelected && !marker ? 'font-medium text-white' : isSelected ? 'font-medium text-dark-gray' : future ? 'text-light-gray' : marker ? 'text-dark-gray' : 'text-common-gray'}`}
              >
                {dayOfMonth(day)}
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-1 text-center text-xs text-common-gray">{label}</p>
    </div>
  )
}
