/**
 * Converts a Date object to an ISO 8601 UTC datetime string without milliseconds.
 * @description
 * Takes a JavaScript Date object and returns the datetime portion in ISO 8601 format
 * with seconds precision, removing milliseconds. The output is in UTC.
 *
 * @param date - The Date object to convert
 * @returns The datetime string in the form YYYY-MM-DDTHH:mm:ssZ (UTC)
 *
 * @example
 * ```typescript
 * const date = new Date('2024-03-20T15:30:45.123Z');
 * const dateTime = toISODateTimeString(date);
 * console.log(dateTime); // '2024-03-20T15:30:45Z'
 * ```
 */
export const toISODateTimeString = (date: Date): string =>
  date.toISOString().split('.')[0] + 'Z';
