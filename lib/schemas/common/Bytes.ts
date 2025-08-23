import { Buffer } from 'node:buffer';
import { z } from 'zod';
import { createRequiredSchema } from './Required';

/**
 * Creates an error message for invalid bytes types
 * @description
 * Generates a standardized error message when a bytes validation fails due to invalid type.
 * The message indicates the expected target name and that the value should be a Buffer or Uint8Array.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = bytesInvalidTypeMessage('Signature');
 * // Returns: "Signature: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid."
 * ```
 */
export const bytesInvalidTypeMessage = (target: string): string =>
  `${target}: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.`;

const createBytesInnerSchema = (target: string): z.ZodType<Uint8Array> =>
  z.union(
    [
      z
        .instanceof(Buffer)
        .transform((v) => new Uint8Array(v.buffer, v.byteOffset, v.byteLength)),
      z.instanceof(Uint8Array),
    ],
    {
      errorMap: () => ({
        message: bytesInvalidTypeMessage(target),
      }),
    }
  );
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
  createRequiredSchema(target).pipe(createBytesInnerSchema(target));
