import { z } from 'zod';

/**
 * Error message for invalid version values.
 * Used when the version is not "1.0".
 */
export const VERSION_INVALID_VALUE_MESSAGE = 'Version: Version must be "1.0"';

/**
 * Zod schema for validating version values.
 * Only accepts the literal string "1.0".
 *
 * @example
 * ```typescript
 * const result = versionSchema.safeParse('1.0'); // Success
 * const result2 = versionSchema.safeParse('2.0'); // Error
 * ```
 */
export const versionSchema = z.literal('1.0', {
  errorMap: () => ({ message: VERSION_INVALID_VALUE_MESSAGE }),
});

/**
 * Type representing a valid version value.
 * This is the output type of the versionSchema.
 *
 * @example
 * ```typescript
 * const version: Version = '1.0'; // Valid
 * ```
 */
export type Version = z.output<typeof versionSchema>;
