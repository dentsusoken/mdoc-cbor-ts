import { z } from 'zod';
import { Algorithms } from '../../cose/types';

/**
 * Creates a Zod schema for validating COSE Algorithm identifiers
 * @description
 * Validates that the input is a valid COSE Algorithm value as defined in the
 * IANA "COSE Algorithms" registry for signature algorithms.
 *
 * Accepted values:
 * - `-8`: EdDSA signature algorithms
 * - `-7`: ECDSA using P-256 curve and SHA-256 (ES256)
 * - `-35`: ECDSA using P-384 curve and SHA-384 (ES384)
 * - `-36`: ECDSA using P-521 curve and SHA-512 (ES512)
 *
 * @param target - The name of the target schema (used in error messages)
 * @returns A Zod schema that validates COSE Algorithm enum values
 *
 * @example
 * ```typescript
 * const schema = createAlgorithmsSchema('ProtectedHeaders');
 * schema.parse(-7);  // ES256
 * schema.parse(-8);  // EdDSA
 * schema.parse(Algorithms.ES256); // -7
 *
 * // Invalid algorithm throws ZodError with target prefix
 * schema.parse(999); // throws "ProtectedHeaders: Invalid algorithm..."
 * ```
 *
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#algorithms} - IANA COSE Algorithms registry
 * @see {@link Algorithms} - COSE Algorithms enum
 */
export const createAlgorithmsSchema = (
  target: string
): z.ZodNativeEnum<typeof Algorithms> =>
  z.nativeEnum(Algorithms, {
    errorMap: () => ({
      message: `${target}: Invalid algorithm. Must be one of: EdDSA (-8), ES256 (-7), ES384 (-35), ES512 (-36)`,
    }),
  });
