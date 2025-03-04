import { z } from 'zod';

export const digestIDSchema = z.union([
  z.number().int().positive(),
  z
    .string()
    .regex(/^\d+$/)
    .transform((s) => Number(s)),
]);

/**
 * ```cddl
 * DigestID = uint
 * ```
 */
export type DigestID = z.infer<typeof digestIDSchema>;
