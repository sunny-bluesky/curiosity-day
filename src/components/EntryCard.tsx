import { entryTypes } from '../lib/entryTypes.ts'
import type { Entry } from '../types.ts'

const MAX_CHARS = 180

function shorten(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > MAX_CHARS ? `${flat.slice(0, MAX_CHARS).trimEnd()}…` : flat
}

export default function EntryCard({ entry, onOpen }: { entry: Entry; onOpen: () => void }) {
  const { icon, label } = entryTypes[entry.type]
  const title = shorten(entry.title)
  const body = shorten(entry.body)

  const text = (
    <>
      {title && <span className="font-medium">{title}</span>}
      {title && body && <br />}
      {body && <span>{body}</span>}
      {!title && !body && <span className="text-common-gray">Пустая запись</span>}
    </>
  )

  // A conclusion shows a large icon on the left; other types show a small icon at the end of the text.
  if (entry.type === 'conclusion') {
    return (
      <button type="button" onClick={onOpen} className="flex w-full items-start gap-3 py-3 text-left">
        <img src={icon} alt={label} className="mt-1 h-12 w-12 shrink-0" />
        <p className="min-w-0 break-words text-base leading-snug">{text}</p>
      </button>
    )
  }

  return (
    <button type="button" onClick={onOpen} className="block w-full py-3 text-left">
      <p className="break-words text-base leading-snug">
        {text}
        <img src={icon} alt={label} className="ml-1 inline h-7 w-7 align-middle" />
      </p>
    </button>
  )
}
