// Temporary stage-0 screen: proves that routing, fonts and the palette work.
const entryTypes = [
  { label: 'Удивило', className: 'bg-peach' },
  { label: 'Сделано', className: 'bg-mellon' },
  { label: 'Вывод', className: 'bg-apple' },
]

const dayColors = ['bg-day-lavender', 'bg-day-green', 'bg-day-blue', 'bg-day-red', 'bg-day-pink']

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" className="h-24 w-24 rounded-3xl" />
      <div>
        <h1 className="text-3xl font-semibold">Curiosity Day</h1>
        <p className="mt-2 text-common-gray">Дневник удивлений. Каркас готов.</p>
      </div>
      <div className="flex gap-2">
        {entryTypes.map((t) => (
          <span key={t.label} className={`${t.className} rounded-full px-4 py-2 text-sm font-medium`}>
            {t.label}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        {dayColors.map((c) => (
          <span key={c} className={`${c} h-6 w-6 rounded-full`} />
        ))}
      </div>
      <p className="text-sm text-accent">Этап 0</p>
    </main>
  )
}
