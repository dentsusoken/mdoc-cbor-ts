import { z } from 'zod';
import { documentSchema, Document } from './Document';
import { documentErrorSchema, DocumentError } from './error';

export const deviceResponseSchema = z.object({
  version: z.string(),
  documents: z.array(documentSchema).optional(),
  documentErrors: z.array(documentErrorSchema).optional(),
  // TODO: define uint schema in common
  status: z.union([
    z.number().int().positive(),
    z
      .string()
      .regex(/^\d+$/)
      .transform((s) => Number(s)),
  ]),
});

/**
 * ```cddl
 * DeviceResponse = {
 *  "version": tstr,
 *  ? "documents": [+ Document],
 *  ? "documentErrors": [+ DocumentError],
 *  "status": uint
 * }
 * ```
 * @see {@link Document}
 * @see {@link DocumentError}
 */
export type DeviceResponse = z.infer<typeof deviceResponseSchema>;
