/**
 * Pads a number with leading zeros to ensure it has at least 2 digits.
 * @param n - The number to pad
 * @returns The padded string representation
 */
export const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * Gets the year component for X.509 time format.
 * @description
 * X.509 uses a 2-digit year format for years 1950-2049 (YY format),
 * and a 4-digit year format for all other years (YYYY format).
 *
 * @param date - The Date object to extract the year from
 * @returns The year as a string in the appropriate X.509 format
 */
export const getX509Year = (date: Date): string => {
  const fullYear = date.getUTCFullYear();

  return fullYear >= 1950 && fullYear <= 2049
    ? pad(fullYear % 100)
    : fullYear.toString();
};

/**
 * Converts a Date object to X.509 time format.
 * @description
 * X.509 certificates use a specific time format:
 * - For years 1950-2049: YYMMDDHHMMSSZ (2-digit year)
 * - For other years: YYYYMMDDHHMMSSZ (4-digit year)
 * The time is always in UTC and ends with 'Z'.
 *
 * @param date - The Date object to convert
 * @returns The time string in X.509 format
 *
 * @example
 * ```typescript
 * const date = new Date('2024-03-20T15:30:45Z');
 * const x509Time = toX509Time(date);
 * console.log(x509Time); // '240320153045Z'
 * ```
 */
export const toX509Time = (date: Date): string => {
  const x509Year = getX509Year(date);
  const MM = pad(date.getUTCMonth() + 1);
  const dd = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const mm = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  return `${x509Year}${MM}${dd}${hh}${mm}${ss}Z`;
};
