import { Buffer } from 'node:buffer';
import { z } from 'zod';

/**
 * Schema for handling binary data in the form of Uint8Array or Buffer
 * @description
 * This schema validates and transforms binary data into a Buffer format.
 * It accepts both Uint8Array and Buffer as input and ensures the output is always a Buffer.
 *
 * @example
 * ```typescript
 * const validBytes = Buffer.from([1, 2, 3]);
 * const result = bytesSchema.parse(validBytes); // Returns Buffer
 * ```
 */
export const bytesSchema = z
  .custom<Uint8Array | Buffer>()
  .transform((bytes) => {
    return Buffer.from(bytes);
  });

/**
 * Type definition for binary data
 * @description
 * Represents binary data that has been validated and transformed through the bytesSchema
 */
export type Bytes = z.infer<typeof bytesSchema>;
