// Single source of truth for all app colors.
// Hex values come from the "Дизайн и ассеты" table in TZ. Wired into Tailwind via tailwind.config.ts.
export const colors = {
  // entry types
  apple: '#E6F97F', // conclusion ("Вывод")
  peach: '#FFB1B0', // noticed ("Удивило")
  mellon: '#FFE38E', // did ("Сделано")

  // day markers
  'day-lavender': '#CFA4F3',
  'day-green': '#E4EB80',
  'day-blue': '#91DEFF',
  'day-red': '#FFA9C3',
  'day-pink': '#FF9CE9',

  // gray scale
  'dark-gray': '#4C4C4C',
  'common-gray': '#8B8B8B',
  'light-gray': '#F0F0F0',
  dusty: '#F9F9F9',

  // base
  accent: '#0088FF',
  background: '#FFFFFF',
} as const

export type ColorName = keyof typeof colors
