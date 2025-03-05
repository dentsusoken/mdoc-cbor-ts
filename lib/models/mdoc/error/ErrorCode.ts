import { z } from 'zod';

export const errorCodeSchema = z.number().int();

/**
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
export type ErrorCode = z.infer<typeof errorCodeSchema>;
