type Props = {
  title: string
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ title, confirmLabel, cancelLabel = 'Отмена', danger, busy, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-gray/30 px-6" role="dialog" aria-modal="true">
      <div className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-xl">
        <p className="text-lg font-medium">{title}</p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-full px-6 py-3 font-medium disabled:opacity-60 ${danger ? 'bg-peach' : 'bg-dark-gray text-white'}`}
          >
            {confirmLabel}
          </button>
          <button type="button" onClick={onCancel} disabled={busy} className="rounded-full bg-light-gray px-6 py-3 font-medium">
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
