import { z } from 'zod';

// TODO: define uint schema in common
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
