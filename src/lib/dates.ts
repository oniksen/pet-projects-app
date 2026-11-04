import { Timestamp } from 'firebase/firestore'

export function toDate(value: Timestamp | Date | number | string | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (value instanceof Timestamp) return value.toDate()
  if (typeof value === 'number') return new Date(value)
  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

export function formatRelative(value: Timestamp | Date | null | undefined): string {
  const date = toDate(value)
  if (!date) return 'только что'
  const diff = date.getTime() - Date.now()
  const abs = Math.abs(diff)
  const formatter = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' })

  if (abs < 60_000) return 'только что'
  if (abs < 3_600_000) return formatter.format(Math.round(diff / 60_000), 'minute')
  if (abs < 86_400_000) return formatter.format(Math.round(diff / 3_600_000), 'hour')
  if (abs < 2_592_000_000) return formatter.format(Math.round(diff / 86_400_000), 'day')
  return formatter.format(Math.round(diff / 2_592_000_000), 'month')
}

export function formatShortDate(value: Timestamp | Date | null | undefined): string {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' }).format(date)
}

export function formatDateTime(value: Timestamp | Date | null | undefined): string {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('ru', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
