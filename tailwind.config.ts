import type { Config } from 'tailwindcss'
import { colors } from './src/theme/colors.ts'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config
