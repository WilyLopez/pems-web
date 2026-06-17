import { format, parseISO, startOfDay, isBefore, isSameWeek } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDay(date: Date | string) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd')
}

export function isPast(date: Date | string) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isBefore(d, startOfDay(new Date()))
}

export function isCurrentWeek(date: Date | string) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isSameWeek(d, new Date(), { weekStartsOn: 1 })
}

export function getFullDayLabel(date: Date | string) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "EEEE d 'de' MMMM", { locale: es })
}
