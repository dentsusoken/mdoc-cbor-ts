import { addExtension } from 'cbor-x';

/**
 * Class representing a date-only value in ISO 8601 format
 * @description
 * Extends the JavaScript Date class to handle date-only values (without time).
 * This class is used for CBOR encoding/decoding of date-only values with tag 1004.
 *
 * @example
 * ```typescript
 * const date = new Tag1004('2024-03-20');
 * console.log(date.value); // '2024-03-20'
 * ```
 */
export class Tag1004 {
  /** The date value in ISO 8601 format (YYYY-MM-DD) */
  value: string;

  /**
   * Creates a new Tag1004 instance
   * @param value - The date value to be stored as a string. Can be a date string in various formats
   * @throws {Error} If the provided value cannot be converted to a valid date
   * @example
   * ```typescript
   * const date1 = new Tag1004('2024-03-20');
   * console.log(date1.value); // '2024-03-20'
   *
   * const date2 = new Tag1004('2024-03-20T15:30:00Z'); // Time part will be stripped
   * console.log(date2.value); // '2024-03-20'
   *
   * const date3 = new Tag1004('2024-03-20T00:00:00.000Z'); // Full ISO string
   * console.log(date3.value); // '2024-03-20'
   * ```
   */
  constructor(value: string) {
    this.value = new Date(value).toISOString().split('T')[0];
  }
}

/**
 * CBOR extension for Tag1004 values
 * @description
 * Registers a CBOR extension for Tag1004 values with tag 1004.
 * The extension handles encoding and decoding of date-only values.
 * @example
 * ```typescript
 * // The extension is automatically registered when this module is imported
 * import { Tag1004 } from './Tag1004';
 *
 * // Now Tag1004 instances can be encoded/decoded with CBOR
 * const date = new Tag1004('2024-03-20');
 * // ... use with CBOR encoding/decoding
 * ```
 */
addExtension({
  Class: Tag1004,
  tag: 1004,
  /**
   * Encodes a Tag1004 instance to CBOR
   * @param tag1004 - The Tag1004 instance to encode
   * @param encode - The CBOR encode function
   * @returns The encoded CBOR value
   */
  encode: (tag1004: Tag1004, encode) => encode(tag1004.value),
  /**
   * Decodes a CBOR value to a Tag1004 instance
   * @param value - The string value to decode
   * @returns A new Tag1004 instance
   */
  decode: (value: string) => new Tag1004(value),
});
