import { z } from 'zod';
import { docTypeSchema } from '../common';
import { deviceSignedSchema } from './DeviceSigned';
import { errorsSchema } from '@/schemas/error';
import { issuerSignedSchema } from './IssuerSigned';
import { createStructSchema } from '../common/Struct';

/**
 * Object schema for mdoc document structure
 * @description
 * Defines the object structure for validating mdoc documents with required
 * docType and issuerSigned fields, and optional deviceSigned and errors fields.
 *
 * ```cddl
 * Document = {
 *  "docType": DocType,
 *  "issuerSigned": IssuerSigned,
 *  ? "deviceSigned": DeviceSigned,
 *  ? "errors": Errors?
 * }
 * ```
 *
 * @example
 * ```typescript
 * const documentObject = {
 *   docType: "org.iso.18013.5.1.mDL",
 *   issuerSigned: validIssuerSignedData,
 *   deviceSigned: validDeviceSignedData, // optional
 *   errors: [] // optional
 * };
 * const result = documentObjectSchema.parse(documentObject);
 * ```
 */
export const documentObjectSchema = z.object({
  docType: docTypeSchema,
  issuerSigned: issuerSignedSchema,
  deviceSigned: deviceSignedSchema.optional(), // TODO - is optional correct?
  errors: errorsSchema.optional(),
});

/**
 * Creates a schema for validating mdoc document structures
 * @description
 * Generates a Zod schema that validates mdoc document objects and transforms them into Document instances.
 * The schema enforces the structure required for mdoc documents: an object containing
 * docType, issuerSigned, and optional deviceSigned and errors fields.
 *
 * Validation rules:
 * - Must be an object
 * - docType: Required document type string
 * - issuerSigned: Required issuer-signed data
 * - deviceSigned: Optional device-signed data
 * - errors: Optional error array
 *
 * @returns A Zod schema that validates mdoc document objects and returns Document instances
 *
 * @example
 * ```typescript
 * const document = {
 *   docType: "org.iso.18013.5.1.mDL",
 *   issuerSigned: validIssuerSignedData,
 *   deviceSigned: validDeviceSignedData,
 *   errors: []
 * };
 * const result = documentSchema.parse(document); // Returns Document instance
 * ```
 */
export const documentSchema = createStructSchema({
  target: 'Document',
  objectSchema: documentObjectSchema,
});

/**
 * Type definition for mdoc document
 * @description
 * Represents a validated mdoc document structure containing issuer-signed and device-signed data.
 * This type is inferred from the document schema and ensures type safety for mdoc document operations.
 *
 * @see {@link DocType} - Document type identifier
 * @see {@link IssuerSigned} - Issuer-signed data structure
 * @see {@link DeviceSigned} - Device-signed data structure
 * @see {@link Errors} - Error information array
 */
export type Document = z.output<typeof documentSchema>;
