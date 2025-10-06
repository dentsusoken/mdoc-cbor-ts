import { encodeCbor } from '@/cbor/codec';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { IssuerAuth, issuerAuthSchema } from '@/schemas/mso/IssuerAuth';
import { createTag24 } from '@/cbor/createTag24';
import { buildMobileSecurityObject } from '@/handlers/issue/mso/buildMobileSecurityObject';
import { JwkPrivateKey, JwkPublicKey } from '@/jwk/types';
import { Sign1 } from '@/cose/Sign1';

/**
 * Parameters to build IssuerAuth using COSE_Sign1
 * @description
 * Inputs required to construct a Mobile Security Object (MSO), embed it as
 * CBOR Tag 24, and sign it with COSE_Sign1.
 */
export type BuildIssuerAuthtParams = {
  /** The document type identifier (e.g., 'org.iso.18013.5.1.mDL') */
  docType: string;
  /** The issuer namespaces containing issuer signed item tags */
  nameSpaces: IssuerNameSpaces;
  /** The device's public key for authentication */
  deviceJwkPublicKey: JwkPublicKey;
  /** The digest algorithm to use for calculating value digests */
  digestAlgorithm: DigestAlgorithm;
  /** The date and time when the MSO was signed */
  signed: Date;
  /** The date and time when the document becomes valid */
  validFrom: Date;
  /** The date and time when the document expires */
  validUntil: Date;
  /** Optional date and time when the document should be updated */
  expectedUpdate?: Date;
  /** The protected headers for the COSE_Sign1 structure */
  protectedHeaders: Uint8Array;
  /** The unprotected headers for the COSE_Sign1 structure */
  unprotectedHeaders: Map<number, unknown>;
  /** The issuer's private key (JWK) for signing COSE_Sign1 */
  issuerJwkPrivateKey: JwkPrivateKey;
};

/**
 * Builds and signs an IssuerAuth structure for mobile document authentication.
 *
 * @description
 * Synchronously creates a complete Mobile Security Object (MSO) with value digests, validity info,
 * and device key info, embeds it as CBOR Tag 24 via {@link createTag24}, then signs
 * it using COSE_Sign1 via {@link Sign1.sign}. The resulting COSE_Sign1 content is
 * validated using {@link issuerAuthSchema} and returned as an {@link IssuerAuth}.
 *
 * @param params - Parameters to build and sign the IssuerAuth
 * @param params.docType - The document type identifier (e.g., 'org.iso.18013.5.1.mDL')
 * @param params.nameSpaces - The issuer namespaces containing issuer signed item tags
 * @param params.deviceJwkPublicKey - The device's JWK public key used to derive the COSE public key
 * @param params.digestAlgorithm - The digest algorithm to use for calculating value digests
 * @param params.validFrom - Duration in milliseconds from now until the document becomes valid
 * @param params.validUntil - Duration in milliseconds from now until the document expires
 * @param params.expectedUpdate - Optional duration in milliseconds from now until the document should be updated
 * @param params.protectedHeaders - Protected headers for the COSE_Sign1 structure
 * @param params.unprotectedHeaders - Unprotected headers for the COSE_Sign1 structure
 * @param params.issuerJwkPrivateKey - The issuer's private key (JWK) for signing
 * @returns A validated {@link IssuerAuth} (COSE_Sign1)
 *
 * @example
 * ```typescript
 * const issuerAuth = buildIssuerAuth({
 *   docType: 'org.iso.18013.5.1.mDL',
 *   nameSpaces: new Map([
 *     ['org.iso.18013.5.1', [tag1, tag2]],
 *     ['org.iso.18013.5.2', [tag3]]
 *   ]),
 *   deviceJwkPublicKey,
 *   digestAlgorithm: 'SHA-256',
 *   validFrom: 0,
 *   validUntil: 24 * 60 * 60 * 1000,
 *   expectedUpdate: 60 * 60 * 1000,
 *   protectedHeaders,
 *   unprotectedHeaders,
 *   issuerJwkPrivateKey,
 * });
 * // MSO is embedded as Tag(24, bstr) and signed with COSE_Sign1.
 * ```
 *
 * @see {@link buildMobileSecurityObject}
 * @see {@link createTag24}
 * @see {@link Sign1}
 * @see {@link issuerAuthSchema}
 */
export const buildIssuerAuth = ({
  docType,
  nameSpaces,
  deviceJwkPublicKey,
  digestAlgorithm,
  signed,
  validFrom,
  validUntil,
  expectedUpdate,
  protectedHeaders,
  unprotectedHeaders,
  issuerJwkPrivateKey,
}: BuildIssuerAuthtParams): IssuerAuth => {
  const mso = buildMobileSecurityObject({
    docType,
    nameSpaces,
    deviceJwkPublicKey,
    digestAlgorithm,
    signed,
    validFrom,
    validUntil,
    expectedUpdate,
  });

  const msoTag24 = createTag24(mso);

  const sign1 = Sign1.sign({
    protectedHeaders,
    unprotectedHeaders,
    payload: encodeCbor(msoTag24),
    jwkPrivateKey: issuerJwkPrivateKey,
  });

  return issuerAuthSchema.parse(sign1.getContentForEncoding());
};
