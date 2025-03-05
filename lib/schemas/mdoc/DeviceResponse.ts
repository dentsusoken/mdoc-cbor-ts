import { z } from 'zod';
import { Document, documentSchema } from './Document';
import { DocumentError, documentErrorSchema } from './error';
import { statusSchema } from './Status';

/**
 * Schema for device response in mdoc
 * @description
 * Represents the response from a device containing documents, errors, and status.
 * This schema validates the structure of the device response including optional documents
 * and document errors.
 *
 * @example
 * ```typescript
 * const response = {
 *   version: "1.0",
 *   documents: [],
 *   status: 0
 * };
 * const result = deviceResponseSchema.parse(response); // Returns DeviceResponse
 * ```
 */
export const deviceResponseSchema = z.object({
  version: z.string(),
  documents: z.array(documentSchema).nonempty().optional(),
  documentErrors: z.array(documentErrorSchema).nonempty().optional(),
  status: statusSchema,
});

/**
 * Type definition for device response
 * @description
 * Represents a validated device response structure
 *
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
