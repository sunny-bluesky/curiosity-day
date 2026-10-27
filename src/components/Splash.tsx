// Simple loading state shown while the saved session is being checked.
export default function Splash({ text = 'Загрузка…' }: { text?: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-common-gray">{text}</p>
    </div>
  )
}
