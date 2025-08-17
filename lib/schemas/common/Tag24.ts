import { z } from 'zod';
import { Tag } from 'cbor-x';
import { isUint8Array } from 'u8a-utils';

/**
 * Creates an error message for invalid Tag 24 types
 * @description
 * Generates a standardized error message when a Tag 24 validation fails.
 * The message indicates the expected target name and that the value should be Uint8Array.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = tag24InvalidTypeMessage('MobileSecurityObjectBytes');
 * // Returns: "MobileSecurityObjectBytes: Please provide a Tag 24 with value type Uint8Array."
 * ```
 */
export const tag24InvalidTypeMessage = (target: string): string =>
  `${target}: Please provide a Tag 24 with value type Uint8Array.`;

/**
 * Creates a Zod schema for validating CBOR Tag 24 structures
 * @description
 * Generates a schema that validates CBOR Tag 24 objects with Uint8Array values.
 * Tag 24 is used in CBOR to indicate embedded CBOR data. This function
 * creates schemas that ensure both the tag number (24) and that the value is a Uint8Array.
 *
 * The schema performs two validations:
 * 1. Ensures the input is a Tag instance
 * 2. Refines to check that the tag number is 24 and the value is a Uint8Array
 *
 * @param target - The name of the target schema (used in error messages)
 * @returns A Zod schema that validates Tag 24 structures with Uint8Array values
 *
 * @example
 * ```typescript
 * const msoSchema = createTag24Schema('MobileSecurityObject');
 *
 * const tag = new Tag(new Uint8Array([1, 2, 3]), 24);
 * const result = msoSchema.parse(tag); // Returns the validated Tag
 * ```
 */
export const createTag24Schema = (target: string): z.ZodType<Tag> =>
  z
    .instanceof(Tag, {
      message: tag24InvalidTypeMessage(target),
    })
    .refine((tag) => tag.tag === 24 && isUint8Array(tag.value), {
      message: tag24InvalidTypeMessage(target),
    });
