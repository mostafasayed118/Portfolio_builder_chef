/**
 * Egypt Timezone Utilities
 *
 * Convex stores all timestamps as UTC milliseconds (Date.now()).
 * This module handles display formatting in Africa/Cairo time.
 *
 * RULES:
 * - Storage: ALWAYS Date.now() (UTC ms)
 * - Display: ALWAYS use Intl.DateTimeFormat with timeZone: 'Africa/Cairo'
 * - NEVER use toLocaleString() without explicit timeZone parameter
 * - NEVER store formatted date strings in database
 */

export const EGYPT_TIMEZONE = 'Africa/Cairo' as const

/**
 * Format a UTC timestamp for display in Egypt local time.
 *
 * @param timestamp - UTC milliseconds (from Date.now())
 * @param locale - 'en' for English, 'ar' for Arabic
 * @returns Formatted date string like "22 Jun 2026, 10:30 PM" or "٢٢ يونيو ٢٠٢٦، ١٠:٣٠ م"
 */
export function formatEgyptTime(
  timestamp: number,
  locale: 'en' | 'ar' = 'en',
): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    timeZone: EGYPT_TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

/**
 * Format a UTC timestamp for short date display (no time).
 *
 * @param timestamp - UTC milliseconds
 * @param locale - 'en' for English, 'ar' for Arabic
 * @returns Formatted date string like "22 Jun 2026"
 */
export function formatEgyptDate(
  timestamp: number,
  locale: 'en' | 'ar' = 'en',
): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    timeZone: EGYPT_TIMEZONE,
    dateStyle: 'medium',
  }).format(new Date(timestamp))
}

/**
 * Format a UTC timestamp for full date + weekday display.
 *
 * @param timestamp - UTC milliseconds
 * @param locale - 'en' for English, 'ar' for Arabic
 * @returns Formatted string like "Monday, 22 June 2026" or "الاثنين، ٢٢ يونيو ٢٠٢٦"
 */
export function formatEgyptFullDate(
  timestamp: number,
  locale: 'en' | 'ar' = 'en',
): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    timeZone: EGYPT_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(timestamp))
}

/**
 * Get current Egypt time as a formatted string (for display only).
 * Do NOT use this for storage — always use Date.now() for storage.
 *
 * @param locale - 'en' for English, 'ar' for Arabic
 * @returns Current Egypt time formatted for display
 */
export function formatEgyptNow(locale: 'en' | 'ar' = 'en'): string {
  return formatEgyptTime(Date.now(), locale)
}

/**
 * Relative time helper ("2 hours ago") in Egypt context.
 * Uses UTC clock for comparison, outputs human-readable relative time.
 *
 * @param timestamp - UTC milliseconds
 * @param locale - 'en' for English, 'ar' for Arabic
 * @returns Relative time string like "2h ago" or "منذ ٢ ساعة"
 */
export function formatRelativeEgyptTime(
  timestamp: number,
  locale: 'en' | 'ar' = 'en',
): string {
  const now = Date.now()
  const diffMs = now - timestamp
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (locale === 'ar') {
    if (diffSecs < 60) return 'الآن'
    if (diffMins < 60) return `منذ ${toArabicNum(diffMins)} ${diffMins === 1 ? 'دقيقة' : 'دقائق'}`
    if (diffHours < 24) return `منذ ${toArabicNum(diffHours)} ${diffHours === 1 ? 'ساعة' : 'ساعات'}`
    if (diffDays < 7) return `منذ ${toArabicNum(diffDays)} ${diffDays === 1 ? 'يوم' : 'أيام'}`
    if (diffWeeks < 4) return `منذ ${toArabicNum(diffWeeks)} ${diffWeeks === 1 ? 'أسبوع' : 'أسابيع'}`
    if (diffMonths < 12) return `منذ ${toArabicNum(diffMonths)} ${diffMonths === 1 ? 'شهر' : 'شهرًا'}`
    return formatEgyptTime(timestamp, 'ar')
  }

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  if (diffMonths < 12) return `${diffMonths}mo ago`
  return formatEgyptTime(timestamp, 'en')
}

/**
 * Convert Arabic-Indic numerals to Western Arabic numerals.
 * Used internally for Arabic relative time formatting.
 */
function toArabicNum(num: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return String(num)
    .split('')
    .map((d) => arabicDigits[parseInt(d)] ?? d)
    .join('')
}

/**
 * Get the current Egypt date for initializing date pickers.
 * Returns a Date object in Egypt local time (NOT UTC).
 * Only use for UI initialization, never for storage.
 *
 * @returns Date object representing current time in Egypt
 */
export function getEgyptNow(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: EGYPT_TIMEZONE }))
}

/**
 * Format a timestamp as ISO date string in Egypt timezone.
 * Useful for <input type="date"> value binding.
 *
 * @param timestamp - UTC milliseconds
 * @returns ISO date string like "2026-06-22"
 */
export function toEgyptISODate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: EGYPT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date(timestamp))
    .split('/')
    .reverse()
    .join('-')
}
