/**
 * Converts a Date object to an ISO 8601 date string (YYYY-MM-DD format) in UTC
 * @description
 * Takes a JavaScript Date object and returns only the date portion in ISO 8601 format,
 * stripping away the time component. The output is based on UTC time zone.
 * This is useful for date-only representations.
 *
 * @param date - The Date object to convert
 * @returns The date string in YYYY-MM-DD format (UTC-based)
 *
 * @example
 * ```typescript
 * const date = new Date('2024-03-20T15:30:00Z');
 * const dateString = toISOFullDateString(date);
 * console.log(dateString); // '2024-03-20'
 * ```
 */
export const toISODateTimeString = (date: Date): string =>
  date.toISOString().split('.')[0] + 'Z';
