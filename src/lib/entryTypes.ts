import { colors } from '../theme/colors.ts'
import type { EntryType } from '../types.ts'
import noticedIcon from '../assets/entry-icons/noticed.svg'
import didIcon from '../assets/entry-icons/did.svg'
import conclusionIcon from '../assets/entry-icons/conclusion.svg'

// Icons are the author's SVGs; to replace one, swap the file in src/assets/entry-icons/.
export const entryTypes: Record<
  EntryType,
  { label: string; placeholder: string; icon: string; color: string }
> = {
  noticed: {
    label: 'Удивило',
    placeholder: 'Запиши, что удивило',
    icon: noticedIcon,
    color: colors.peach,
  },
  did: {
    label: 'Сделано',
    placeholder: 'Запиши, что удивительного сделано',
    icon: didIcon,
    color: colors.mellon,
  },
  conclusion: {
    label: 'Вывод',
    placeholder: 'Запиши мысль, появившуюся на основе нового опыта',
    icon: conclusionIcon,
    color: colors.apple,
  },
}
