import { addExtension } from 'cbor-x';

/**
 * Class representing a date-time value in ISO 8601 format
 * @description
 * Extends the JavaScript Date class to handle date-time values.
 * This class is used for CBOR encoding/decoding of date-time values with tag 0.
 *
 * @example
 * ```typescript
 * const dateTime = new DateTime('2024-03-20T15:30:00Z');
 * console.log(dateTime.toISOString()); // '2024-03-20T15:30:00Z'
 * ```
 */
export class DateTime extends Date {
  /**
   * Returns the date-time in ISO 8601 format without milliseconds
   * @returns ISO 8601 date-time string
   */
  toISOString(): string {
    return `${super.toISOString().split('.')[0]}Z`;
  }

  /**
   * Returns the date-time as a string in ISO 8601 format
   * @returns ISO 8601 date-time string
   */
  toString(): string {
    return this.toISOString();
  }

  /**
   * Returns the date-time as a JSON string in ISO 8601 format
   * @returns ISO 8601 date-time string
   */
  toJSON(): string {
    return this.toISOString();
  }
}

/**
 * CBOR extension for DateTime values
 * @description
 * Registers a CBOR extension for DateTime values with tag 0.
 * The extension handles encoding and decoding of date-time values.
 */
addExtension({
  Class: DateTime,
  tag: 0,
  encode: (date: DateTime, encode) => encode(date.toISOString()),
  decode: (isoStringDateTime: string) => new DateTime(isoStringDateTime),
});
