import MarkerShape from './MarkerShape.tsx'
import { addDays, dayOfMonth, mondayOf, monthEnd, monthNameRu, monthStart, weekdayIndex, addMonths, capitalize } from '../lib/dates.ts'
import type { DayMarker } from '../types.ts'

export type PeriodUnit = 'week' | 'month' | 'year'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

type Context = { today: string; markers: Map<string, DayMarker> }

function DayCell({ day, today, markers, size, showNumber = true }: Context & { day: string; size: number; showNumber?: boolean }) {
  const marker = markers.get(day)
  const isToday = day === today
  const future = day > today
  return (
    <div className="relative flex items-center justify-center" style={{ height: size + 6 }} data-day={day}>
      {marker ? (
        <MarkerShape shape={marker.shape} color={marker.color} size={size} className="absolute" />
      ) : isToday ? (
        <span className="absolute rounded-full bg-black" style={{ width: size - 4, height: size - 4 }} />
      ) : null}
      {showNumber && (
        <span className={`relative ${isToday && !marker ? 'text-white' : future ? 'text-light-gray' : marker ? 'text-dark-gray' : 'text-common-gray'} ${isToday ? 'font-semibold' : ''}`}>
          {dayOfMonth(day)}
        </span>
      )}
    </div>
  )
}

function WeekdayHeader() {
  return (
    <div className="grid grid-cols-7 pb-1 text-center text-xs text-common-gray">
      {WEEKDAYS.map((w) => (
        <span key={w}>{w}</span>
      ))}
    </div>
  )
}

function MonthGrid({ anchor, ctx, size, showNumbers }: { anchor: string; ctx: Context; size: number; showNumbers: boolean }) {
  const first = monthStart(anchor)
  const last = monthEnd(anchor)
  const blanks = weekdayIndex(first)
  const days: string[] = []
  for (let d = first; d <= last; d = addDays(d, 1)) days.push(d)
  return (
    <div className="grid grid-cols-7">
      {Array.from({ length: blanks }, (_, i) => (
        <span key={`b${i}`} />
      ))}
      {days.map((day) => (
        <DayCell key={day} day={day} size={size} showNumber={showNumbers} {...ctx} />
      ))}
    </div>
  )
}

export default function PeriodCalendar({ unit, anchor, today, markers }: { unit: PeriodUnit; anchor: string } & Context) {
  const ctx = { today, markers }

  if (unit === 'week') {
    const start = mondayOf(anchor)
    return (
      <div>
        <WeekdayHeader />
        <div className="grid grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => addDays(start, i)).map((day) => (
            <DayCell key={day} day={day} size={44} {...ctx} />
          ))}
        </div>
      </div>
    )
  }

  if (unit === 'month') {
    return (
      <div>
        <WeekdayHeader />
        <MonthGrid anchor={anchor} ctx={ctx} size={44} showNumbers />
      </div>
    )
  }

  const year = anchor.slice(0, 4)
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
      {Array.from({ length: 12 }, (_, i) => addMonths(`${year}-01-01`, i)).map((month) => (
        <div key={month}>
          <p className="mb-1 text-sm text-accent">{capitalize(monthNameRu(month))}</p>
          <MonthGrid anchor={month} ctx={ctx} size={14} showNumbers={false} />
        </div>
      ))}
    </div>
  )
}
