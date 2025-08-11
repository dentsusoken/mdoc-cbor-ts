import { z } from 'zod';

/**
 * Schema for mdoc status codes
 * @description
 * Represents the status codes that can be returned by an mdoc.
 * This schema validates that the status code is one of the predefined values.
 *
 * ```cddl
 * Status = 0 / 10 / 11 / 12
 * ```
 *
 * @example
 * ```typescript
 * const status = 0;
 * const result = statusSchema.parse(status); // Returns 0
 * ```
 */
const allowedStatusCodes = [0, 10, 11, 12] as const;

export const statusSchema = z
  .number({
    invalid_type_error:
      'Status: Expected a status code number (0, 10, 11, 12).',
    required_error:
      'Status: This field is required. Please provide a status code.',
  })
  .refine((v) => (allowedStatusCodes as readonly number[]).includes(v), {
    message: 'Status: Invalid status code. Allowed values are 0, 10, 11, 12.',
  });

/**
 * Type definition for mdoc status codes
 * @description
 * Represents a validated status code from the mdoc
 *
 * @example
 * |Status code| Status Message | Description| Actions required|
 * |---|---|---|---|
 * |0|Success|Normal processing. This status message shall be returned if no other status is returned|No specific action required|
 * |10|General error|The mdoc returns an error without any given reason.|The mdoc reader may inspect the problem. The mdoc reader may continue the transaction.|
 * |11|CBOR decoding error|The mdoc indicates an error during CBOR decoding that the data received is not valid CBOR. Returning this status code is optional.|The mdoc reader may inspect the problem. The mdoc reader may continue the transaction.|
 * |12|CBOR validation error|The mdoc indicates an error during CBOR validation, e.g. wrong CBOR structures. Returning this status code is optional|The mdoc reader may inspect the problem. The mdoc reader may continue the transaction.|
 */
export type Status = (typeof allowedStatusCodes)[number];
