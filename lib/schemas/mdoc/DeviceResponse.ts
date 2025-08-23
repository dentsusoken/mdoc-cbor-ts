import { z } from 'zod';
import { documentSchema } from './Document';
import { documentErrorSchema } from '@/schemas/error';
import { statusSchema } from './Status';
import { versionSchema } from '@/schemas/common/Version';
import { createArraySchema } from '@/schemas/common/Array';
import { createStructSchema } from '@/schemas/common/Struct';

/**
 * Error message for device response validation
 * @description
 * Message used when a device response doesn't contain at least one document or documentError.
 * This constant ensures consistent error messaging across the validation process.
 */
export const DEVICE_RESPONSE_AT_LEAST_ONE_MESSAGE =
  'DeviceResponse: At least one document or documentError must be provided.';

/**
 * Object schema for device response structure
 * @description
 * Defines the object structure for validating device response objects with required
 * version and status fields, and optional documents and documentErrors arrays.
 *
 * ```cddl
 * DeviceResponseObject = {
 *  "version": tstr,
 *  ? "documents": [+ Document],
 *  ? "documentErrors": [+ DocumentError],
 *  "status": uint
 * }
 * ```
 *
 * @example
 * ```typescript
 * const responseObject = {
 *   version: "1.0",
 *   documents: [validDocument],
 *   documentErrors: [validDocumentError],
 *   status: 0
 * };
 * const result = deviceResponseObjectSchema.parse(responseObject);
 * ```
 */
export const deviceResponseObjectSchema = z
  .object({
    version: versionSchema,
    documents: createArraySchema({
      target: 'documents',
      itemSchema: documentSchema,
    }).optional(),
    documentErrors: createArraySchema({
      target: 'documentErrors',
      itemSchema: documentErrorSchema,
    }).optional(),
    status: statusSchema,
  })
  .refine((obj) => obj.documents || obj.documentErrors, {
    message: DEVICE_RESPONSE_AT_LEAST_ONE_MESSAGE,
  });

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
export const deviceResponseSchema = createStructSchema({
  target: 'DeviceResponse',
  objectSchema: deviceResponseObjectSchema,
});

/**
 * Type definition for device response
 * @description
 * Represents a validated device response structure
 *
 * @see {@link Document}
 * @see {@link DocumentError}
 * @see {@link Status}
 */
export type DeviceResponse = z.infer<typeof deviceResponseSchema>;
