import { z } from 'zod';

/**
 * Schema for error codes in MDOC
 * @description
 * Represents an integer value that indicates the type of error that occurred.
 * This schema validates that the error code is a valid integer.
 *
 * ```cddl
 * ErrorCode = int
 * ```
 *
 * @example
 * ```typescript
 * const code = 0;
 * const result = errorCodeSchema.parse(code); // Returns ErrorCode
 * ```
 */
export const errorCodeSchema = z
  .number({
    invalid_type_error:
      'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.',
    required_error:
      'ErrorCode: This field is required. Please provide a valid integer.',
  })
  .int({
    message: 'ErrorCode: Please provide an integer (no decimal places).',
  });

/**
 * Type definition for error codes
 * @description
 * Represents a validated error code value
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
