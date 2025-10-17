import { z } from 'zod';
import { Algorithm } from '@/cose/types';
import { valueInvalidTypeMessage } from '../messages';

/**
 * Generates an error message when a value is not a valid COSE algorithm number.
 *
 * @param invalidValue - The provided value which failed validation.
 * @returns A string describing the expected and received values.
 *
 * @example
 * algorithmInvalidTypeMessage('abc');
 * // => 'Expected EdDSA (-8), ES256 (-7), ES384 (-35), or ES512 (-36), received abc'
 */
export const algorithmInvalidTypeMessage = (invalidValue: unknown): string =>
  valueInvalidTypeMessage({
    expected: 'EdDSA (-8), ES256 (-7), ES384 (-35), or ES512 (-36)',
    received: JSON.stringify(invalidValue),
  });
/**
 * Zod schema for validating COSE algorithm numbers, supporting only Algorithms defined in the Algorithms enum.
 *
 * @description
 * This schema validates that a given value matches one of the allowed COSE algorithm values:
 * - EdDSA (-8)
 * - ES256 (-7)
 * - ES384 (-35)
 * - ES512 (-36)
 *
 * If an invalid algorithm value is provided, a custom error message is returned:
 * "Expected EdDSA (-8), ES256 (-7), ES384 (-35), or ES512 (-36), received <value>"
 *
 * @example
 * algorithmsSchema.parse(-7); // OK (ES256)
 * algorithmsSchema.parse(-9); // throws ZodError with custom message
 */
export const algorithmsSchema = z.nativeEnum(Algorithm);

export type Algorithms = z.output<typeof algorithmsSchema>;
