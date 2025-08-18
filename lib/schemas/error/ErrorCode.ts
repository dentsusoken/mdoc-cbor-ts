import { z } from 'zod';
import { createIntSchema } from '@/schemas/common/Int';

/**
 * Schema for error codes in MDOC
 * @description
 * Validates a required integer (`int`) value indicating the type of error that
 * occurred. Error messages are prefixed with `ErrorCode: ...` and follow the
 * standardized integer validation provided by the common `Int` schema.
 *
 * Validation rules:
 * - Requires a number type
 * - Requires an integer (no decimal places)
 *
 * ```cddl
 * ErrorCode = int
 * ```
 *
 * @example
 * ```typescript
 * const code = -1;
 * const result = errorCodeSchema.parse(code); // number (integers: negative/zero/positive)
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (not an integer)
 * // Message: "ErrorCode: Please provide an integer (no decimal places)"
 * errorCodeSchema.parse(1.5);
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid type)
 * // Message: "ErrorCode: Expected a number, but received a different type. Please provide an integer."
 * // @ts-expect-error
 * errorCodeSchema.parse('1');
 * ```
 *
 * @see createIntSchema
 */
export const errorCodeSchema = createIntSchema('ErrorCode');

/**
 * Type definition for error codes
 * @description
 * Represents a validated integer error code value
 *
 * ```cddl
 * ErrorCode = int
 * ```
 *
 * | Error code | Error code message | Description |
 * | --- | --- | --- |
 * | 0 | Data not returned | The mdoc does not provide the requested document or data element without any given reason. This element may be used in all cases. |
 * | Other positive integers | See description | RFU |
 * | Negative integers | See description | These error codes may be used for application-specific purposes. |
 */
export type ErrorCode = z.output<typeof errorCodeSchema>;
