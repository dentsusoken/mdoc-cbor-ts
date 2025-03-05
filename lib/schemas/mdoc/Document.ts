import { z } from 'zod';
import { DocType, docTypeSchema } from '../common';
import { DeviceSigned, deviceSignedSchema } from './DeviceSigned';
import { Errors, errorsSchema } from './error';
import { IssuerSigned, issuerSignedSchema } from './IssuerSigned';

/**
 * Schema for mdoc document
 * @description
 * Represents a complete mdoc document containing issuer-signed and device-signed data.
 * This schema validates the structure of the document including its type, issuer-signed data,
 * device-signed data, and optional errors.
 *
 * @example
 * ```typescript
 * const document = {
 *   docType: "org.iso.18013.5.1.mDL",
 *   issuerSigned: {},
 *   deviceSigned: {},
 *   errors: []
 * };
 * const result = documentSchema.parse(document); // Returns Document
 * ```
 */
export const documentSchema = z.object({
  docType: docTypeSchema,
  issuerSigned: issuerSignedSchema,
  deviceSigned: deviceSignedSchema,
  errors: errorsSchema.optional(),
});

/**
 * Type definition for mdoc document
 * @description
 * Represents a validated mdoc document structure
 *
 * ```cddl
 * Document = {
 *  "docType": DocType,
 *  "issuerSigned": IssuerSigned,
 *  "deviceSigned": DeviceSigned,
 *  "errors": Errors?
 * }
 * ```
 * @see {@link DocType}
 * @see {@link IssuerSigned}
 * @see {@link DeviceSigned}
 * @see {@link Errors}
 */
export type Document = z.infer<typeof documentSchema>;
