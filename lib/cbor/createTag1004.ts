import { Tag } from 'cbor-x';
import { toISOFullDateString } from '@/utils/toISOFullDateString';

/**
 * Creates a CBOR Tag 1004 for a full-date value
 * @description
 * Produces a Tag(1004, tstr) where the value is the ISO full-date string representation
 * of the input Date. The full-date string is in YYYY-MM-DD format (UTC).
 * This matches CBOR Tag 1004 usage for full-date values as specified in RFC 3339.
 *
 * @param value - The Date object to be converted and wrapped in Tag 1004
 * @returns A `Tag` instance with `tag === 1004` and value as ISO full-date string
 *
 * @example
 * ```typescript
 * const date = new Date('2007-03-25');
 * const tag1004 = createTag1004(date);
 * console.log(tag1004.tag); // 1004
 * console.log(tag1004.value); // '2007-03-25'
 * ```
 */
export const createTag1004 = (value: Date): Tag => {
  return new Tag(toISOFullDateString(value), 1004);
};
