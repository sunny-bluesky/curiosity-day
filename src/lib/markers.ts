import { colors, type ColorName } from '../theme/colors.ts'
import type { DayMarker } from '../types.ts'

// Shapes are the author's SVGs in src/assets/markers/. Replacing the files changes the shapes, no code edits.
const rawShapes = import.meta.glob('../assets/markers/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

type Shape = { viewBox: string; inner: string }

function parseShape(svg: string): Shape {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 44 44'
  const group = svg.match(/<g[^>]*>([\s\S]*?)<\/g>/)
  // Drop the gray background square and recolor to the current text color (set per marker).
  const inner = (group ? group[1] : svg.replace(/<\/?svg[^>]*>/g, '').replace(/<rect[^>]*\/>/, '')).replace(/fill="#[0-9A-Fa-f]{3,8}"/g, 'fill="currentColor"')
  return { viewBox, inner }
}

const shapes: Record<string, Shape> = {}
for (const [path, svg] of Object.entries(rawShapes)) {
  const name = path.match(/([^/]+)\.svg$/)?.[1]
  if (name) shapes[name] = parseShape(svg)
}

export const MARKER_SHAPES = Object.keys(shapes).sort()

// Palette for day markers (from the colors table).
export const MARKER_COLORS = ['day-lavender', 'day-green', 'day-blue', 'day-red', 'day-pink'] as const

export function getShape(name: string): Shape | undefined {
  return shapes[name]
}

export function markerColorHex(name: string): string {
  return colors[name as ColorName] ?? colors['day-lavender']
}

const key = (m: { shape: string; color: string }) => `${m.shape}|${m.color}`

/** Random shape+color that differs from both neighbours' combination. */
export function pickMarker(neighbours: DayMarker[]): { shape: string; color: string } {
  const banned = new Set(neighbours.map(key))
  const options: { shape: string; color: string }[] = []
  for (const shape of MARKER_SHAPES) for (const color of MARKER_COLORS) if (!banned.has(key({ shape, color }))) options.push({ shape, color })
  const pool = options.length ? options : MARKER_SHAPES.flatMap((shape) => MARKER_COLORS.map((color) => ({ shape, color })))
  return pool[Math.floor(Math.random() * pool.length)]
}
