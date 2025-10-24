import { z } from 'zod';
import { deviceSignedSchema } from './DeviceSigned';
import { errorsSchema } from './Errors';
import { issuerSignedSchema } from './IssuerSigned';
import { createStrictMapSchema } from '@/schemas/containers/StrictMap';
import { createStrictMap } from '@/strict-map';

/**
 * Entries definition for the Document schema in mdoc.
 * @description
 * Specifies the fields and their associated schemas for a Mobile Document (mdoc) structure.
 * These entries are used by a strict map or struct schema creator to enable validation and type inference
 * for Document objects or maps.
 *
 * Structure:
 * - "docType" (required): Validated as a non-empty string (the document type, e.g., "org.iso.18013.5.1.mDL").
 * - "issuerSigned" (required): Validated by {@link issuerSignedSchema}, representing the issuer-signed portion of the mdoc.
 * - "deviceSigned" (optional): Validated by {@link deviceSignedSchema}, representing the device-signed portion, if present.
 * - "errors" (optional): Validated by {@link errorsSchema}, holds error information if present.
 *
 * ```cddl
 * Document = {
 *   "docType": DocType,
 *   "issuerSigned": IssuerSigned,
 *   ? "deviceSigned": DeviceSigned,
 *   ? "errors": Errors?
 * }
 * ```
 *
 * @see {@link issuerSignedSchema}
 * @see {@link deviceSignedSchema}
 * @see {@link errorsSchema}
 * @see {@link DocType}
 */
export const documentEntries = [
  ['docType', z.string().min(1)], // DocType, required
  ['issuerSigned', issuerSignedSchema], // IssuerSigned, required
  ['deviceSigned', deviceSignedSchema.optional()], // DeviceSigned, optional
  ['errors', errorsSchema.optional()], // Errors, optional
] as const;

/**
 * Factory function for constructing a Document Map in mdoc format.
 * @description
 * Provides a type-safe way to create a Document structure as a strict Map,
 * ensuring it contains exactly the required "docType" and "issuerSigned" fields,
 * and optional "deviceSigned" and "errors" fields, all validated by their respective schemas.
 *
 * @example
 * ```typescript
 * const document = createDocument([
 *   ['docType', 'org.iso.18013.5.1.mDL'],
 *   ['issuerSigned', issuerSignedValue],
 *   // Optionally:
 *   ['deviceSigned', deviceSignedValue],
 *   ['errors', errorsValue],
 * ]);
 * ```
 *
 * @see {@link documentEntries}
 * @see {@link createStrictMap}
 */
export const createDocument = createStrictMap<typeof documentEntries>;

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
export const documentSchema = createStrictMapSchema({
  target: 'Document',
  entries: documentEntries,
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
