import { z } from 'zod';
import { protectedHeadersSchema } from '@/schemas/cose/ProtectedHeaders';
import { unprotectedHeadersSchema } from '@/schemas/cose/UnprotectedHeaders';
import { payloadSchema } from '@/schemas/cose/Payload';
import { signatureSchema } from './Signature';
import { createFixedTupleLengthSchema } from '../common/FixedTupleLength';
import { Sign1 } from '@/cose/Sign1';
import { UnprotectedHeaders } from '@/cose/UnprotectedHeaders';
import { getErrorMessage } from '@/utils';

export const sign1InvalidStructureMessage = (target: string): string =>
  `${target}: structure must be [protectedHeaders(Uint8Array), unprotectedHeaders(Map<number, unknown>), payload(Uint8Array | null | undefined), signature(Uint8Array)]`;

export const sign1FailedToVerifyMessage = (
  target: string,
  error: string
): string => `${target}: failed to verify: ${error}`;

/**
 * Tuple schema for COSE_Sign1 structure validation
 * @description
 * Validates the 4-element array structure of COSE_Sign1 and normalizes the payload field.
 * The payload is accepted as `Uint8Array | null | undefined` and is normalized to `null`
 * (never `undefined`) in the parsed output. The returned value is the validated 4-tuple,
 * not a `Sign1` instance.
 *
 * Elements:
 * - 0: Protected headers (`Uint8Array`)
 * - 1: Unprotected headers (`Map<number, unknown>`)
 * - 2: Payload (`Uint8Array | null`) – `null` if input was `null` or `undefined`
 * - 3: Signature (`Uint8Array`)
 */
const createSign1TupleSchema = (
  target: string
): z.ZodTuple<
  [
    z.ZodType<Uint8Array>,
    z.ZodType<Map<number, unknown>>,
    z.ZodType<Uint8Array | null | undefined>,
    z.ZodType<Uint8Array>,
  ]
> =>
  z.tuple(
    [
      protectedHeadersSchema, // protected headers (Bytes)
      unprotectedHeadersSchema, // unprotected headers (LabelKeyMap)
      // Normalize undefined/null to null so output type excludes undefined
      payloadSchema, // payload (Bytes | null | undefined)
      signatureSchema, // signature (Bytes)
    ],
    {
      message: sign1InvalidStructureMessage(target),
    }
  );

/**
 * Schema for validating COSE_Sign1 4-tuples
 * @description
 * Validates COSE_Sign1 arrays with exact length 4 and returns the original tuple
 * with the payload normalized to `null` (never `undefined`). This schema does not
 * return a `Sign1` instance; it only ensures the tuple is constructible into one.
 * A refinement step tries to construct `new Sign1(...)` to confirm validity but
 * the parsed output remains the tuple.
 *
 * ```cddl
 * COSE_Sign1 = [
 *   protected:   bstr,
 *   unprotected: {
 *     * label => any
 *   },
 *   payload:     bstr / null,
 *   signature:   bstr
 * ]
 * ```
 * where `label = int / tstr`
 *
 * Validation rules:
 * - Must be an array with exactly 4 elements
 * - Element 0: Protected headers (Uint8Array)
 * - Element 1: Unprotected headers (Map<number | string, unknown>)
 * - Element 2: Payload (Uint8Array | null) – undefined becomes null
 * - Element 3: Signature (Uint8Array)
 *
 * @param target - The name of the target schema (used in error messages)
 * @returns Zod schema that parses to `[Uint8Array, Map<number, unknown>, Uint8Array | null, Uint8Array]`
 *
 * @example
 * ```typescript
 * const deviceSignatureTupleSchema = createSign1Schema('DeviceSignature');
 * const input = [protectedHeaders, unprotectedHeaders, undefined, signature];
 * const result = deviceSignatureTupleSchema.parse(input);
 * // result[2] is null (normalized)
 * ```
 */
export const createSign1Schema = (
  target: string
): z.ZodType<
  [Uint8Array, Map<number, unknown>, Uint8Array, Uint8Array],
  z.ZodTypeDef,
  unknown
> =>
  createFixedTupleLengthSchema(target, 4)
    .pipe(createSign1TupleSchema(target))
    .transform(
      ([protectedHeaders, unprotectedHeaders, payload, signature], ctx) => {
        try {
          // Ensure the tuple can construct a valid Sign1
          const sign1 = new Sign1(
            protectedHeaders,
            UnprotectedHeaders.fromMap(unprotectedHeaders),
            payload ?? new Uint8Array(),
            signature
          );
          sign1.verify();

          return sign1.getContentForEncoding();
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: sign1FailedToVerifyMessage(target, getErrorMessage(error)),
          });
          return z.NEVER;
        }
      }
    );
