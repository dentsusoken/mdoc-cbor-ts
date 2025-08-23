import { z } from 'zod';
import { Tag } from 'cbor-x';
import { isUint8Array } from 'u8a-utils';
import { createRequiredSchema } from './Required';

/**
 * Creates an error message for invalid Tag 24 types
 * @description
 * Generates a standardized error message when a Tag 24 validation fails due to invalid type
 * or structure. The message indicates the expected target name and that the value should be
 * a Tag 24 with Uint8Array value.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = tag24InvalidTypeMessage('MobileSecurityObjectBytes');
 * // Returns: "MobileSecurityObjectBytes: Expected a Tag 24 with Uint8Array value, but received a different type or structure. Please provide a Tag 24 with Uint8Array value."
 * ```
 */
export const tag24InvalidTypeMessage = (target: string): string =>
  `${target}: Expected a Tag 24 with Uint8Array value, but received a different type or structure. Please provide a Tag 24 with Uint8Array value.`;

const createTag24InnerSchema = (target: string): z.ZodType<Tag> =>
  z
    .instanceof(Tag, {
      message: tag24InvalidTypeMessage(target),
    })
    .refine((tag) => tag.tag === 24 && isUint8Array(tag.value), {
      message: tag24InvalidTypeMessage(target),
    });

/**
 * Builds a schema that validates CBOR Tag 24 structures with Uint8Array values
 * @description
 * Returns a Zod schema that validates a required CBOR Tag 24 object with Uint8Array value.
 * Tag 24 is used in CBOR to indicate embedded CBOR data. All validation error messages
 * are prefixed with the provided `target` name and use the message constants exported
 * from this module.
 *
 * Validation rules:
 * - Requires a Tag instance with a target-prefixed invalid type message
 * - Requires presence with a target-prefixed required message
 * - Enforces tag number is 24 and value is Uint8Array with a target-prefixed message
 *
 * ```cddl
 * Tag24 = #6.24(bstr)
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "MobileSecurityObjectBytes")
 *
 * @example
 * ```typescript
 * const msoSchema = createTag24Schema('MobileSecurityObjectBytes');
 * const tag = new Tag(new Uint8Array([1, 2, 3]), 24);
 * const result = msoSchema.parse(tag); // Tag instance
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid type)
 * // Message: "MobileSecurityObjectBytes: Expected a Tag 24 with Uint8Array value, but received a different type or structure. Please provide a Tag 24 with Uint8Array value."
 * const msoSchema = createTag24Schema('MobileSecurityObjectBytes');
 * // @ts-expect-error
 * msoSchema.parse(new Uint8Array([1, 2, 3])); // Uint8Array instead of Tag
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (wrong tag number or value type)
 * // Message: "MobileSecurityObjectBytes: Expected a Tag 24 with Uint8Array value, but received a different type or structure. Please provide a Tag 24 with Uint8Array value."
 * const msoSchema = createTag24Schema('MobileSecurityObjectBytes');
 * msoSchema.parse(new Tag('string value', 24)); // Wrong value type
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (required)
 * // Message: "MobileSecurityObjectBytes: This field is required"
 * const msoSchema = createTag24Schema('MobileSecurityObjectBytes');
 * // @ts-expect-error
 * msoSchema.parse(undefined);
 * ```
 */
export const createTag24Schema = (target: string): z.ZodType<Tag> =>
  createRequiredSchema(target).pipe(createTag24InnerSchema(target));
