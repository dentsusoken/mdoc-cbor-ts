import { Mac0 } from '@auth0/cose';
import { z } from 'zod';
import { protectedHeadersSchema } from '@/schemas/cose/ProtectedHeaders';
import { unprotectedHeadersSchema } from '@/schemas/cose/UnprotectedHeaders';
import { payloadSchema } from '@/schemas/cose/Payload';
import { tagSchema } from '@/schemas/cose/Tag';

/**
 * Creates an error message for invalid COSE_Mac0 type
 * @description
 * Generates a standardized error message when a COSE_Mac0 validation fails because
 * the input is not an array with the expected 4 elements structure.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = mac0InvalidTypeMessage('DeviceMac');
 * // Returns: "DeviceMac: Expected an array with 4 elements (protected headers, unprotected headers, payload, tag). Please provide a valid COSE_Mac0 structure."
 * ```
 */
export const mac0InvalidTypeMessage = (target: string): string =>
  `${target}: Expected an array with 4 elements (protected headers, unprotected headers, payload, tag). Please provide a valid COSE_Mac0 structure.`;

/**
 * Creates an error message for required COSE_Mac0 fields
 * @description
 * Generates a standardized error message when a required COSE_Mac0 field is missing.
 * The message indicates the expected target name and that the field is required.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = mac0RequiredMessage('DeviceMac');
 * // Returns: "DeviceMac: This field is required. Please provide a COSE_Mac0 structure."
 * ```
 */
export const mac0RequiredMessage = (target: string): string =>
  `${target}: This field is required. Please provide a COSE_Mac0 structure.`;

/**
 * Creates an error message for COSE_Mac0 arrays with too few elements
 * @description
 * Generates a standardized error message when a COSE_Mac0 validation fails because
 * the array has fewer than the required 4 elements.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = mac0TooFewMessage('DeviceMac');
 * // Returns: "DeviceMac: Array must contain at least 4 element(s)"
 * ```
 */
export const mac0TooFewMessage = (target: string): string =>
  `${target}: Array must contain at least 4 element(s)`;

/**
 * Creates an error message for COSE_Mac0 arrays with too many elements
 * @description
 * Generates a standardized error message when a COSE_Mac0 validation fails because
 * the array has more than the required 4 elements.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = mac0TooManyMessage('DeviceMac');
 * // Returns: "DeviceMac: Array must contain at most 4 element(s)"
 * ```
 */
export const mac0TooManyMessage = (target: string): string =>
  `${target}: Array must contain at most 4 element(s)`;

/**
 * Creates a tuple schema for COSE_Mac0 structure validation
 * @description
 * Generates a Zod tuple schema that validates the 4-element array structure of COSE_Mac0.
 * This internal helper function creates the core validation logic for the COSE_Mac0 format.
 *
 * @param target - The name of the target schema (used in error messages)
 * @returns A Zod tuple schema that validates the 4-element COSE_Mac0 array structure
 *
 * @example
 * ```typescript
 * const tupleSchema = createMac0TupleSchema('DeviceMac');
 * const mac0Array = [protectedHeaders, unprotectedHeaders, payload, tag];
 * const result = tupleSchema.parse(mac0Array); // Returns validated tuple
 * ```
 */
const createMac0TupleSchema = (
  target: string
): z.ZodTuple<
  [
    z.ZodType<Uint8Array>,
    z.ZodType<Map<number, unknown>>, // acceptable general Zod type for map
    z.ZodType<Uint8Array | null | undefined>,
    z.ZodType<Uint8Array>,
  ]
> =>
  z.tuple(
    [
      protectedHeadersSchema, // protected headers (Bytes)
      unprotectedHeadersSchema, // unprotected headers (NumberMap)
      payloadSchema.nullish(), // payload (Bytes)
      tagSchema, // tag (Bytes)
    ],
    {
      invalid_type_error: mac0InvalidTypeMessage(target),
      required_error: mac0RequiredMessage(target),
    }
  );

/**
 * Creates a schema for validating COSE_Mac0 structures
 * @description
 * Generates a Zod schema that validates COSE_Mac0 arrays and transforms them into Mac0 objects.
 * The schema enforces the exact structure required for COSE_Mac0: a 4-element array containing
 * protected headers, unprotected headers, payload, and tag.
 *
 * ```cddl
 * COSE_Mac0 = [
 *   protected:   bstr,
 *   unprotected: {
 *     * uint => any
 *   },
 *   payload:     bstr,
 *   tag:         bstr
 * ]
 * ```
 *
 * Validation rules:
 * - Must be an array with exactly 4 elements
 * - Element 0: Protected headers (Uint8Array)
 * - Element 1: Unprotected headers (Map<number, unknown>)
 * - Element 2: Payload (Uint8Array)
 * - Element 3: Tag (Uint8Array)
 *
 * @param target - The name of the target schema (used in error messages)
 * @returns A Zod schema that validates COSE_Mac0 arrays and returns Mac0 objects
 *
 * @example
 * ```typescript
 * const deviceMacSchema = createMac0Schema('DeviceMac');
 * const mac0Array = [protectedHeaders, unprotectedHeaders, payload, tag];
 * const result = deviceMacSchema.parse(mac0Array); // Returns Mac0 instance
 * ```
 */
export const createMac0Schema = (target: string): z.ZodType<Mac0> =>
  z
    .any()
    .superRefine((val, ctx) => {
      if (!Array.isArray(val)) return;
      if (val.length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          type: 'array',
          minimum: 4,
          inclusive: true,
          exact: false,
          message: mac0TooFewMessage(target),
        });
      } else if (val.length > 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          type: 'array',
          maximum: 4,
          inclusive: true,
          exact: false,
          message: mac0TooManyMessage(target),
        });
      }
    })
    .pipe(createMac0TupleSchema(target))
    .transform(([protectedHeaders, unprotectedHeaders, payload, tag]) => {
      return new Mac0(
        protectedHeaders,
        unprotectedHeaders,
        payload as unknown as Uint8Array,
        tag
      );
    });
