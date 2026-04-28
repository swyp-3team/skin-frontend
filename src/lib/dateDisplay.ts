export interface DateTimeDisplay {
  date: string
  time: string
}

export function toDateTimeDisplay(value: string): DateTimeDisplay {
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    const day = String(parsed.getDate()).padStart(2, '0')
    const hour = String(parsed.getHours()).padStart(2, '0')
    const minute = String(parsed.getMinutes()).padStart(2, '0')

    return {
      date: `${year}.${month}.${day}`,
      time: `${hour}:${minute}`,
    }
  }

  const matchedDate = value.match(/^(\d{4})[./-](\d{2})[./-](\d{2})(?:\s+(\d{2}):(\d{2}))?$/)
  if (matchedDate) {
    const [, year, month, day, hour, minute] = matchedDate
    return {
      date: `${year}.${month}.${day}`,
      time: hour && minute ? `${hour}:${minute}` : '--:--',
    }
  }

  return { date: 'YYYY.MM.DD', time: 'HH:MM' }
}

export function toYearMonthDay(value: string): string {
  const matchedDate = value.match(/^(\d{4})[./-](\d{2})[./-](\d{2})/)
  if (matchedDate) {
    const [, year, month, day] = matchedDate
    return `${year}.${month}.${day}`
  }

  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    const day = String(parsed.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  return 'YYYY.MM.DD'
}
