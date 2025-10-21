import { Buffer } from 'node:buffer';
import { z } from 'zod';
import { valueInvalidTypeMessage } from '@/schemas/messages';
import { getTypeName } from '@/utils/getTypeName';

/**
 * Zod schema for binary data interchange between Node.js and browser environments.
 *
 * Accepts a `Buffer` (Node.js) or `Uint8Array` (browser/standard), and returns a `Uint8Array`
 * for downstream code. If given a `Buffer`, it creates a view-backed `Uint8Array` on its underlying buffer.
 *
 * Add a validation error if the input is not `Buffer` or `Uint8Array`.
 *
 * @example
 * bytesSchema.parse(Buffer.from([1, 2, 3])); // Uint8Array [1, 2, 3]
 * bytesSchema.parse(new Uint8Array([4, 5, 6])); // Uint8Array [4, 5, 6]
 * bytesSchema.safeParse('foo').success; // false with error message
 */
export const bytesSchema: z.ZodType<Uint8Array> = z
  .any()
  .transform((v, ctx) => {
    if (v instanceof Buffer) {
      // Create a Uint8Array view over the Buffer's memory
      return new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
    }

    if (v instanceof Uint8Array) {
      return v;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: valueInvalidTypeMessage({
        expected: 'Uint8Array or Buffer',
        received: getTypeName(v),
      }),
    });

    return z.NEVER;
  });
