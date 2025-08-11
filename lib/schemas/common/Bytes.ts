import { Buffer } from 'node:buffer';
import { z } from 'zod';

export const GENERIC_ERROR_MESSAGE =
  'Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.';
/**
 * Schema for handling binary data in the form of Uint8Array or Buffer
 * @description
 * This schema validates and transforms binary data into a Buffer format.
 * It accepts both Uint8Array and Buffer as input and ensures the output is always a Buffer.
 *
 * ```cddl
 * Bytes = bytes
 * ```
 *
 * @example
 * ```typescript
 * const validBytes = Buffer.from([1, 2, 3]);
 * const result = bytesSchema.parse(validBytes); // Returns Buffer
 * ```
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createBytesSchema = (errorMessage: string) =>
  z.union(
    [
      z.instanceof(Uint8Array),
      z
        .instanceof(Buffer)
        .transform((v) => new Uint8Array(v.buffer, v.byteOffset, v.byteLength)),
    ],
    {
      errorMap: () => ({ message: errorMessage }),
    }
  );

export const bytesSchema = createBytesSchema(`Bytes: ${GENERIC_ERROR_MESSAGE}`);

/**
 * Type definition for binary data
 * @description
 * Represents binary data that has been validated and transformed through the bytesSchema
 *
 * ```cddl
 * Bytes = bytes
 * ```
 */
export type Bytes = z.output<typeof bytesSchema>;
