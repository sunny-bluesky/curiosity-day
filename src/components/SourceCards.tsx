import { entryTypes } from '../lib/entryTypes.ts'
import type { Entry } from '../types.ts'

// The entries a conclusion is based on, shown collapsed: title and a few lines of text, scrollable inside.
export default function SourceCards({ sources }: { sources: Entry[] }) {
  if (sources.length === 0) return null
  return (
    <ul aria-label="Записи, на которых основан вывод" className="max-h-56 space-y-2 overflow-y-auto rounded-3xl bg-apple/20 p-3">
      {sources.map((source) => {
        const { icon, label } = entryTypes[source.type]
        return (
          <li key={source.id} className="rounded-2xl bg-white/80 p-3">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 break-words text-base font-medium leading-snug">{source.title || 'Без заголовка'}</p>
              <img src={icon} alt={label} className="h-6 w-6 shrink-0" />
            </div>
            {source.body && <p className="mt-1 line-clamp-3 break-words text-sm leading-snug">{source.body}</p>}
          </li>
        )
      })}
    </ul>
  )
}
