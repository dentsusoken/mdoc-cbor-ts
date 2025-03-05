import { z } from 'zod';
import { Document, documentSchema } from './Document';
import { DocumentError, documentErrorSchema } from './error';
import { statusSchema } from './Status';

export const deviceResponseSchema = z.object({
  version: z.string(),
  documents: z.array(documentSchema).optional(),
  documentErrors: z.array(documentErrorSchema).optional(),
  status: statusSchema,
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
 * @see {@link Status}
 */
export type DeviceResponse = z.infer<typeof deviceResponseSchema>;
