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
 * Generates a Zod tuple schema that validates the 4-element array structure of COSE_Mac0.
 * This internal helper function creates the core validation logic for the COSE_Mac0 format.
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
 * @internal
 */
const mac0TupleSchema = z.tuple([
  protectedHeadersSchema, // protected headers (Bytes)
  unprotectedHeadersSchema, // unprotected headers (NumberMap)
  payloadSchema.nullish(), // payload (Bytes)
  tagSchema, // tag (Bytes)
]);

/**
 * Creates a schema for validating COSE_Mac0 structures
 * @description
 * Generates a Zod schema that validates COSE_Mac0 arrays and transforms them into Mac0 objects.
 * The schema enforces the exact structure required for COSE_Mac0: a 4-element array containing
 * protected headers, unprotected headers, payload, and tag.
 *
 * Validation rules:
 * - Must be an array with exactly 4 elements
 * - Element 0: Protected headers (Uint8Array)
 * - Element 1: Unprotected headers (Map<number, unknown>)
 * - Element 2: Payload (Uint8Array or null/undefined)
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
export const createMac0Schema = (
  target: string
): z.ZodType<Mac0, z.ZodTypeDef, unknown> =>
  createFixedTupleLengthSchema(target, 4)
    .pipe(mac0TupleSchema)
    .transform(([protectedHeaders, unprotectedHeaders, payload, tag]) => {
      return new Mac0(
        protectedHeaders,
        unprotectedHeaders,
        payload as unknown as Uint8Array,
        tag
      );
    });
