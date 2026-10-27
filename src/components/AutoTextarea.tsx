import { useImperativeHandle, useLayoutEffect, useRef, type KeyboardEventHandler, type Ref } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  ariaLabel?: string
  autoFocus?: boolean
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>
  ref?: Ref<HTMLTextAreaElement>
}

// A textarea that grows with its content, so the page (not the field) scrolls.
export default function AutoTextarea({ value, onChange, placeholder, className, ariaLabel, autoFocus, onKeyDown, ref }: Props) {
  const inner = useRef<HTMLTextAreaElement>(null)
  useImperativeHandle(ref, () => inner.current!, [])

  useLayoutEffect(() => {
    const el = inner.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <textarea
      ref={inner}
      rows={1}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      onChange={(e) => onChange(e.target.value)}
      className={`block w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-common-gray ${className ?? ''}`}
    />
  )
}
