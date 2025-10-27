import { z } from 'zod';

/**
 * Zod schema for eye colour values according to ISO 18013-5 (Mobile Driving License).
 *
 * The allowed values represent the standard set of possible eye colours that can be encoded:
 * - "black"
 * - "blue"
 * - "brown"
 * - "dichromatic" (different coloured eyes)
 * - "grey"
 * - "green"
 * - "hazel"
 * - "maroon"
 * - "pink"
 * - "unknown" (not specified or cannot be determined)
 *
 * Example usage:
 * ```typescript
 * eyeColorSchema.parse("blue"); // Valid
 * eyeColorSchema.parse("purple"); // Throws ZodError
 * ```
 */
export const eyeColorSchema = z.enum([
  'black',
  'blue',
  'brown',
  'dichromatic',
  'grey',
  'green',
  'hazel',
  'maroon',
  'pink',
  'unknown',
]);

export type EyeColor = z.output<typeof eyeColorSchema>;
