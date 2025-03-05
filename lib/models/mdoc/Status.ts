import { z } from 'zod';

export const statusSchema = z.union([
  z.literal(0),
  z.literal(10),
  z.literal(11),
  z.literal(12),
]);

/**
 * |Status code| Status Message | Description| Actions required|
 * |---|---|---|---|
 * |0|Success|Normal processing. This status message shall be returned if no other status is returned|No specific action required|
 * |10|General error|The mdoc returns an error without any given reason.|The mdoc reader may inspect the problem. The mdoc reader may continue the transaction.|
 * |11|CBOR decoding error|The mdoc indicates an error during CBOR decoding that the data received is not valid CBOR. Returning this status code is optional.|The mdoc reader may inspect the problem. The mdoc reader may continue the transaction.|
 * |12|CBOR validation error|The mdoc indicates an error during CBOR validation, e.g. wrong CBOR structures. Returning this status code is optional|The mdoc reader may inspect the problem. The mdoc reader may continue the transaction.|
 */
export type Status = z.infer<typeof statusSchema>;
