import { getShape, markerColorHex } from '../lib/markers.ts'

type Props = { shape: string; color: string; size: number; className?: string }

export default function MarkerShape({ shape, color, size, className }: Props) {
  const def = getShape(shape)
  if (!def) return <span style={{ width: size, height: size }} className={`inline-block rounded-full ${className ?? ''}`} />
  return (
    <svg
      width={size}
      height={size}
      viewBox={def.viewBox}
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ color: markerColorHex(color) }}
      dangerouslySetInnerHTML={{ __html: def.inner }}
    />
  )
}
