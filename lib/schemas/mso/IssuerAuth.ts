import { z } from 'zod';
import { createSign1Schema } from '@/schemas/cose/Sign1';

/**
 * Schema for issuer authentication in MSO (Mobile Security Object)
 *
 * @description
 * Represents a COSE_Sign1 signature created by the issuer for authenticating
 * the Mobile Security Object. This schema validates and transforms COSE_Sign1
 * objects while preserving their structure according to the ISO/IEC 18013-5 standard.
 *
 * The schema ensures that the issuer's signature is properly formatted and
 * contains all required components: protected headers, unprotected headers,
 * payload, and signature.
 *
 * ```cddl
 * IssuerAuth = COSE_Sign1
 * ```
 *
 * @example
 * ```typescript
 * const signData = [protectedHeaders, unprotectedHeaders, payload, signature];
 * const result = issuerAuthSchema.parse(signData); // Returns Sign1
 * ```
 *
 * @see {@link Sign1} - The underlying COSE_Sign1 schema
 * @see {@link createSign1Schema} - Function that creates the Sign1 schema
 */
export const issuerAuthSchema = createSign1Schema('IssuerAuth');

/**
 * Type definition for issuer authentication
 *
 * @description
 * Represents a validated COSE_Sign1 signature from the issuer that has been
 * successfully parsed and validated by the issuerAuthSchema. This type ensures
 * type safety when working with issuer authentication data throughout the
 * mdoc verification process.
 *
 * The type is automatically inferred from the issuerAuthSchema and provides
 * full TypeScript intellisense support for all COSE_Sign1 properties.
 *
 * @see {@link Sign1} - The underlying COSE_Sign1 type
 * @see {@link issuerAuthSchema} - The schema that validates this type
 */
export type IssuerAuth = z.output<typeof issuerAuthSchema>;
