import { Mac0 } from '@auth0/cose';
import { z } from 'zod';
import { protectedHeadersSchema } from '@/schemas/cose/ProtectedHeaders';
import { unprotectedHeadersSchema } from '@/schemas/cose/UnprotectedHeaders';
import { payloadSchema } from '@/schemas/cose/Payload';
import { tagSchema } from '@/schemas/cose/Tag';
import { createFixedTupleLengthSchema } from '../common/FixedTupleLength';

/**
 * A tuple schema for COSE_Mac0 structure validation
 * @description
 * Validates the 4-element array structure of COSE_Mac0. This internal helper creates the
 * core validation logic for COSE_Mac0 format.
 *
 * ```cddl
 * COSE_Mac0 = [
 *   protected:   bstr,
 *   unprotected: {
 *     * uint => any
 *   },
 *   payload:     bstr / null / undefined,
 *   tag:         bstr
 * ]
 * ```
 * @internal
 */
const mac0TupleSchema = z.tuple([
  protectedHeadersSchema, // protected headers (Bytes)
  unprotectedHeadersSchema, // unprotected headers (NumberMap)
  payloadSchema, // payload (Bytes | null | undefined)
  tagSchema, // tag (Bytes)
]);

export const MAC0_INVALID_STRUCTURE_MESSAGE =
  'COSE_Mac0: structure must be [protectedHeaders(Uint8Array), unprotectedHeaders(Map<number, unknown>), payload(Uint8Array | null | undefined), tag(Uint8Array)]';

/**
 * Creates a schema for validating COSE_Mac0 structures
 * @description
 * Validates COSE_Mac0 arrays and returns the encoded 4-tuple instead of a `Mac0` instance.
 * The transform constructs a `Mac0` to validate, then returns its `getContentForEncoding()` result.
 *
 * Validation rules:
 * - Must be an array with exactly 4 elements
 * - Element 0: Protected headers (Uint8Array)
 * - Element 1: Unprotected headers (Map<number, unknown>)
 * - Element 2: Payload (Uint8Array | null | undefined)
 * - Element 3: Tag (Uint8Array)
 *
 * @param target - The name of the target schema (used in error messages)
 * @returns Zod schema that parses to `[Uint8Array, Map<number, unknown>, Uint8Array, Uint8Array]`
 *
 * @example
 * ```typescript
 * const deviceMacTupleSchema = createMac0Schema('DeviceMac');
 * const mac0Array = [protectedHeaders, unprotectedHeaders, payload, tag];
 * const result = deviceMacTupleSchema.parse(mac0Array); // Returns 4-tuple
 * ```
 */
export const createMac0Schema = (
  target: string
): z.ZodType<
  [Uint8Array, Map<number, unknown>, Uint8Array, Uint8Array],
  z.ZodTypeDef,
  unknown
> =>
  createFixedTupleLengthSchema(target, 4)
    .pipe(mac0TupleSchema)
    .transform(([protectedHeaders, unprotectedHeaders, payload, tag], ctx) => {
      try {
        return new Mac0(
          protectedHeaders,
          unprotectedHeaders,
          payload!,
          tag
        ).getContentForEncoding() as [
          Uint8Array,
          Map<number, unknown>,
          Uint8Array,
          Uint8Array,
        ];
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: MAC0_INVALID_STRUCTURE_MESSAGE,
        });
        return z.NEVER;
      }
    });
