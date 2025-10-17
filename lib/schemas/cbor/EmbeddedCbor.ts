import { z } from 'zod';
import { Tag } from 'cbor-x';
import { isUint8Array } from 'u8a-utils';
import { valueInvalidTypeMessage } from '../messages';
import { getTypeName } from '@/utils/getTypeName';

/**
 * Generates an error message for when an embedded CBOR Tag has an invalid tag number.
 *
 * @param invalidTag - The tag number provided (expected: 24).
 * @returns The error message string.
 *
 * @example
 * embeddedCborInvalidTagMessage(99);
 * // => 'Invalid type: expected Tag 24, received Tag 99'
 */
export const embeddedCborInvalidTagMessage = (invalidTag: number): string =>
  valueInvalidTypeMessage({
    expected: 'Tag 24',
    received: `Tag ${invalidTag}`,
  });

/**
 * Generates an error message for when the value of Tag 24 is not a Uint8Array.
 *
 * @param invalidValue - The value contained within the Tag (should be a Uint8Array).
 * @returns The error message string.
 *
 * @example
 * embeddedCborInvalidValueMessage('text');
 * // => 'Invalid type: expected Tag 24 with Uint8Array value, received Tag 24 with string value'
 */
export const embeddedCborInvalidValueMessage = (
  invalidValue: unknown
): string =>
  valueInvalidTypeMessage({
    expected: 'Tag 24 with Uint8Array value',
    received: `Tag 24 with ${getTypeName(invalidValue)} value`,
  });

/**
 * Zod schema for validating embedded CBOR data (Tag 24).
 * Ensures:
 *   - The input is an instance of Tag,
 *   - The tag number is exactly 24,
 *   - The tag value is a Uint8Array
 *
 * Fails with context-specific error messages otherwise.
 *
 * @example
 * import { Tag } from 'cbor-x';
 * const tag = new Tag(new Uint8Array([1, 2, 3]), 24);
 * embeddedCborSchema.safeParse(tag); // success
 *
 * embeddedCborSchema.safeParse(new Tag('not bytes', 24)); // error: value not Uint8Array
 * embeddedCborSchema.safeParse(new Tag(new Uint8Array(), 99)); // error: tag not 24
 */
export const embeddedCborSchema: z.ZodType<Tag> = z
  .instanceof(Tag)
  .refine(
    (tag) => tag.tag === 24,
    (tag) => ({
      message: embeddedCborInvalidTagMessage(tag.tag),
    })
  )
  .refine(
    (tag) => isUint8Array(tag.value),
    (tag) => ({
      message: embeddedCborInvalidValueMessage(tag.value),
    })
  );
