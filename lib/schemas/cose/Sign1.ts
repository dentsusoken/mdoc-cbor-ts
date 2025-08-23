import { Sign1 } from '@auth0/cose';
import { z } from 'zod';
import { protectedHeadersSchema } from '@/schemas/cose/ProtectedHeaders';
import { unprotectedHeadersSchema } from '@/schemas/cose/UnprotectedHeaders';
import { payloadSchema } from '@/schemas/cose/Payload';
import { signatureSchema } from './Signature';
import { createFixedTupleLengthSchema } from '../common/FixedTupleLength';

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
const sign1TupleSchema = z.tuple([
  protectedHeadersSchema, // protected headers (Bytes)
  unprotectedHeadersSchema, // unprotected headers (LabelKeyMap)
  // Accept null/undefined and convert to empty Uint8Array before validating as bytes
  z
    .any()
    .transform((v) => (v == null ? new Uint8Array() : v))
    .pipe(payloadSchema), // payload (Bytes)
  signatureSchema, // signature (Bytes)
]);

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
 *     * label => any
 *   },
 *   payload:     bstr,
 *   signature:   bstr
 * ]
 * ```
 * where `label = int / tstr`
 *
 * Validation rules:
 * - Must be an array with exactly 4 elements
 * - Element 0: Protected headers (Uint8Array)
 * - Element 1: Unprotected headers (Map<number | string, unknown>)
 * - Element 2: Payload (Uint8Array | undefined)
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
export const createSign1Schema = (
  target: string
): z.ZodType<Sign1, z.ZodTypeDef, unknown> =>
  createFixedTupleLengthSchema(target, 4)
    .pipe(sign1TupleSchema)
    .transform(([protectedHeaders, unprotectedHeaders, payload, signature]) => {
      return new Sign1(
        protectedHeaders,
        unprotectedHeaders,
        payload,
        signature
      );
    });
