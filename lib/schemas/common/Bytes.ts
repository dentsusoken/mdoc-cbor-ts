import { Buffer } from 'node:buffer';
import { z } from 'zod';

export const BYTES_INVALID_TYPE_MESSAGE_SUFFIX =
  'Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.';
/**
 * Schema for handling binary data in the form of Uint8Array or Buffer
 * @description
 * This schema validates and transforms binary data into a Buffer format.
 * It accepts both Uint8Array and Buffer as input and ensures the output is always a Uint8Array.
 *
 * ```cddl
 * Bytes = bstr
 * ```
 *
 * @example
 * ```typescript
 * const validBytes = Buffer.from([1, 2, 3]);
 * const result = bytesSchema.parse(validBytes); // Returns Uint8Array
 * ```
 */
export const createBytesSchema = (target: string): z.ZodType<Uint8Array> =>
  z.union(
    [
      z.instanceof(Uint8Array),
      z
        .instanceof(Buffer)
        .transform((v) => new Uint8Array(v.buffer, v.byteOffset, v.byteLength)),
    ],
    {
      errorMap: () => ({
        message: `${target}: ${BYTES_INVALID_TYPE_MESSAGE_SUFFIX}`,
      }),
    }
  );
