import { z } from 'zod';

/**
 * Zod schema for hair colour values according to ISO 18013-5 (Mobile Driving License).
 *
 * The allowed values are:
 * - "bald"
 * - "black"
 * - "blond"
 * - "brown"
 * - "grey"
 * - "red"
 * - "auburn"
 * - "sandy"
 * - "white"
 * - "unknown" (not specified or cannot be determined)
 *
 * Example usage:
 * ```typescript
 * hairColorSchema.parse("blond"); // Valid
 * hairColorSchema.parse("purple"); // Throws ZodError
 * ```
 */
export const hairColorSchema = z.enum([
  'bald',
  'black',
  'blond',
  'brown',
  'grey',
  'red',
  'auburn',
  'sandy',
  'white',
  'unknown',
]);

/**
 * Type representing valid hair colour values.
 */
export type HairColor = z.output<typeof hairColorSchema>;
