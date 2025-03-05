import { addExtension } from 'cbor-x';

/**
 * Class representing a date-only value in ISO 8601 format
 * @description
 * Extends the JavaScript Date class to handle date-only values (without time).
 * This class is used for CBOR encoding/decoding of date-only values with tag 1004.
 *
 * @example
 * ```typescript
 * const date = new DateOnly('2024-03-20');
 * console.log(date.toISOString()); // '2024-03-20'
 * ```
 */
export class DateOnly extends Date {
  /**
   * Creates a new DateOnly instance
   * @param dateString - ISO 8601 date string (YYYY-MM-DD format)
   */
  constructor(dateString: string) {
    super(dateString);
  }

  /**
   * Returns the date in ISO 8601 format (YYYY-MM-DD)
   * @returns ISO 8601 date string
   */
  toISOString() {
    return super.toISOString().split('T')[0];
  }

  /**
   * Returns the date as a string in ISO 8601 format
   * @returns ISO 8601 date string
   */
  toString() {
    return this.toISOString();
  }

  /**
   * Returns the date as a JSON string in ISO 8601 format
   * @returns ISO 8601 date string
   */
  toJSON() {
    return this.toISOString();
  }
}

/**
 * CBOR extension for DateOnly values
 * @description
 * Registers a CBOR extension for DateOnly values with tag 1004.
 * The extension handles encoding and decoding of date-only values.
 */
addExtension({
  Class: DateOnly,
  tag: 1004,
  encode: (date: DateOnly, encode) => encode(date.toISOString()),
  decode: (isoStringDate: string) => new DateOnly(isoStringDate),
});
