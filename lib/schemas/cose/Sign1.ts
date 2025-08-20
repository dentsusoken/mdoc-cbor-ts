import { Sign1 } from '@auth0/cose';
import { z } from 'zod';
import { protectedHeadersSchema } from '@/schemas/cose/ProtectedHeaders';
import { unprotectedHeadersSchema } from '@/schemas/cose/UnprotectedHeaders';
import { payloadSchema } from '@/schemas/cose/Payload';
import { signatureSchema } from './Signature';

/**
 * Creates an error message for invalid COSE_Sign1 type
 * @description
 * Generates a standardized error message when a COSE_Sign1 validation fails because
 * the input is not an array with the expected 4 elements structure.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = sign1InvalidTypeMessage('DeviceSignature');
 * // Returns: "DeviceSignature: Expected an array with 4 elements (protected headers, unprotected headers, payload, signature). Please provide a valid COSE_Sign1 structure."
 * ```
 */
export const sign1InvalidTypeMessage = (target: string): string =>
  `${target}: Expected an array with 4 elements (protected headers, unprotected headers, payload, signature). Please provide a valid COSE_Sign1 structure.`;

/**
 * Creates an error message for required COSE_Sign1 fields
 * @description
 * Generates a standardized error message when a required COSE_Sign1 field is missing.
 * The message indicates the expected target name and that the field is required.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = sign1RequiredMessage('DeviceSignature');
 * // Returns: "DeviceSignature: This field is required. Please provide a COSE_Sign1 structure."
 * ```
 */
export const sign1RequiredMessage = (target: string): string =>
  `${target}: This field is required. Please provide a COSE_Sign1 structure.`;

/**
 * Creates an error message for COSE_Sign1 arrays with too few elements
 * @description
 * Generates a standardized error message when a COSE_Sign1 validation fails because
 * the array has fewer than the required 4 elements.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = sign1TooFewMessage('DeviceSignature');
 * // Returns: "DeviceSignature: Array must contain at least 4 element(s)"
 * ```
 */
export const sign1TooFewMessage = (target: string): string =>
  `${target}: Array must contain at least 4 element(s)`;

/**
 * Creates an error message for COSE_Sign1 arrays with too many elements
 * @description
 * Generates a standardized error message when a COSE_Sign1 validation fails because
 * the array has more than the required 4 elements.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = sign1TooManyMessage('DeviceSignature');
 * // Returns: "DeviceSignature: Array must contain at most 4 element(s)"
 * ```
 */
export const sign1TooManyMessage = (target: string): string =>
  `${target}: Array must contain at most 4 element(s)`;

/**
 * Creates a tuple schema for COSE_Sign1 structure validation
 * @description
 * Generates a Zod tuple schema that validates the 4-element array structure of COSE_Sign1.
 * This internal helper function creates the core validation logic for the COSE_Sign1 format.
 *
 * @param target - The name of the target schema (used in error messages)
 * @returns A Zod tuple schema that validates the 4-element COSE_Sign1 array structure
 *
 * @example
 * ```typescript
 * const tupleSchema = createSign1TupleSchema('DeviceSignature');
 * const sign1Array = [protectedHeaders, unprotectedHeaders, payload, signature];
 * const result = tupleSchema.parse(sign1Array); // Returns validated tuple
 * ```
 */
const createSign1TupleSchema = (
  target: string
): z.ZodTuple<
  [
    z.ZodType<Uint8Array>,
    z.ZodType<Map<number, unknown>>, // acceptable general Zod type for map
    z.ZodType<Uint8Array>,
    z.ZodType<Uint8Array>,
  ]
> =>
  z.tuple(
    [
      protectedHeadersSchema, // protected headers (Bytes)
      unprotectedHeadersSchema, // unprotected headers (NumberMap)
      payloadSchema, // payload (Bytes)
      signatureSchema, // signature (Bytes)
    ],
    {
      invalid_type_error: sign1InvalidTypeMessage(target),
      required_error: sign1RequiredMessage(target),
    }
  );

/**
 * Creates a schema for validating COSE_Sign1 structures
 * @description
 * Generates a Zod schema that validates COSE_Sign1 arrays and transforms them into Sign1 objects.
 * The schema enforces the exact structure required for COSE_Sign1: a 4-element array containing
 * protected headers, unprotected headers, payload, and signature.
 *
 * ```cddl
 * COSE_Sign1 = [
 *   protected:   bstr,
 *   unprotected: {
 *     * uint => any
 *   },
 *   payload:     bstr,
 *   signature:   bstr
 * ]
 * ```
 *
 * Validation rules:
 * - Must be an array with exactly 4 elements
 * - Element 0: Protected headers (Uint8Array)
 * - Element 1: Unprotected headers (Map<number, unknown>)
 * - Element 2: Payload (Uint8Array)
 * - Element 3: Signature (Uint8Array)
 *
 * @param target - The name of the target schema (used in error messages)
 * @returns A Zod schema that validates COSE_Sign1 arrays and returns Sign1 objects
 *
 * @example
 * ```typescript
 * const deviceSignatureSchema = createSign1Schema('DeviceSignature');
 * const sign1Array = [protectedHeaders, unprotectedHeaders, payload, signature];
 * const result = deviceSignatureSchema.parse(sign1Array); // Returns Sign1 instance
 * ```
 */
export const createSign1Schema = (target: string): z.ZodType<Sign1> =>
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
          message: sign1TooFewMessage(target),
        });
      } else if (val.length > 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          type: 'array',
          maximum: 4,
          inclusive: true,
          exact: false,
          message: sign1TooManyMessage(target),
        });
      }
    })
    .pipe(createSign1TupleSchema(target))
    .transform(([protectedHeaders, unprotectedHeaders, payload, signature]) => {
      return new Sign1(
        protectedHeaders,
        unprotectedHeaders,
        payload,
        signature
      );
    });
