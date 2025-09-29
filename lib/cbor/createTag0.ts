import { Tag } from 'cbor-x';
import { toISODateTimeString } from '@/utils/toISODateTimeString';

/**
 * Creates a CBOR Tag 0 for a Date value
 * @description
 * Produces a Tag(0, tstr) where the value is the ISO date-time string representation
 * of the input Date. The date-time string is normalized to YYYY-MM-DDTHH:MM:SSZ format
 * (UTC, without milliseconds). This matches CBOR Tag 0 usage for date-time values.
 *
 * @param value - The Date object to be converted and wrapped in Tag 0
 * @returns A `Tag` instance with `tag === 0` and value as ISO date-time string
 *
 * @example
 * ```typescript
 * const date = new Date('2024-03-20T15:30:45.123Z');
 * const tag0 = createTag0(date);
 * console.log(tag0.tag); // 0
 * console.log(tag0.value); // '2024-03-20T15:30:45Z'
 * ```
 */
export const createTag0 = (value: Date): Tag => {
  return new Tag(toISODateTimeString(value), 0);
};
