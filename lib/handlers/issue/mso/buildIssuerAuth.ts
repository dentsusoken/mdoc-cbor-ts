import { encodeCbor } from '@/cbor/codec';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { IssuerAuth, issuerAuthSchema } from '@/schemas/mso/IssuerAuth';
import { createTag24 } from '@/cbor/createTag24';
import { buildProtectedHeaders } from '../cose/buildProtectedHeaders';
import { buildUnprotectedHeaders } from '../cose/buildUnprotectedHeaders';
import { buildMobileSecurityObject } from './buildMobileSecurityObject';
import { JwkPrivateKey, JwkPublicKey } from '@/jwk/types';
import { Sign1 } from '@/cose/Sign1';

export type BuildIssuerAuthtParams = {
  /** The document type identifier (e.g., 'org.iso.18013.5.1.mDL') */
  docType: string;
  /** The issuer namespaces containing issuer signed item tags */
  nameSpaces: IssuerNameSpaces;
  /** The device's public key for authentication */
  deviceJwkPublicKey: JwkPublicKey;
  /** The digest algorithm to use for calculating value digests */
  digestAlgorithm: DigestAlgorithm;
  /** Duration in milliseconds from now until the document becomes valid */
  validFrom: number;
  /** Duration in milliseconds from now until the document expires */
  validUntil: number;
  /** Optional duration in milliseconds from now until the document should be updated */
  expectedUpdate?: number;
  /** The issuer's private key for signing */
  issuerJwkPrivateKey: JwkPrivateKey;
  /** The X.509 certificate chain for the issuer */
  x5c: Uint8Array[];
};

/**
 * Builds and signs an IssuerAuth structure for mobile document authentication.
 *
 * This function creates a complete Mobile Security Object (MSO) with all required fields,
 * wraps it in a CBOR Tag 24, and signs it using COSE_Sign1 to produce an IssuerAuth
 * structure. The MSO contains value digests, validity information, and device key info,
 * all cryptographically signed by the issuer's private key.
 *
 * @param params - The parameters for building the IssuerAuth
 * @param params.docType - The document type identifier (e.g., 'org.iso.18013.5.1.mDL')
 * @param params.nameSpaces - The issuer namespaces containing issuer signed item tags
 * @param params.deviceJwkPublicKey - The device's JWK public key used to derive the COSE public key
 * @param params.digestAlgorithm - The digest algorithm to use for calculating value digests
 * @param params.validFrom - Duration in milliseconds from now until the document becomes valid
 * @param params.validUntil - Duration in milliseconds from now until the document expires
 * @param params.expectedUpdate - Optional duration in milliseconds from now until the document should be updated
 * @param params.issuerJwkPrivateKey - The issuer's private key (JWK) for signing
 * @param params.x5c - The X.509 certificate chain for the issuer
 * @returns A Promise that resolves to the signed IssuerAuth structure
 *
 * @example
 * ```typescript
 * const issuerAuth = await buildIssuerAuth({
 *   docType: 'org.iso.18013.5.1.mDL',
 *   nameSpaces: new Map([
 *     ['org.iso.18013.5.1', [tag1, tag2]],
 *     ['org.iso.18013.5.2', [tag3]]
 *   ]),
 *   deviceJwkPublicKey,
 *   digestAlgorithm: 'SHA-256',
 *   validFrom: 0,
 *   validUntil: 24 * 60 * 60 * 1000, // +1 day
 *   expectedUpdate: 60 * 60 * 1000, // +1 hour
 *   issuerJwkPrivateKey,
 *   x5c: [certificateBytes]
 * });
 *
 * // The MSO is wrapped as new Tag(mso, 24) and signed via COSE_Sign1.
 * // MSO.validityInfo fields are Tag(0) (tdate) with normalized 'YYYY-MM-DDTHH:MM:SSZ' values.
 * ```
 */
export const buildIssuerAuth = async ({
  docType,
  nameSpaces,
  deviceJwkPublicKey,
  digestAlgorithm,
  validFrom,
  validUntil,
  expectedUpdate,
  issuerJwkPrivateKey,
  x5c,
}: BuildIssuerAuthtParams): Promise<IssuerAuth> => {
  const mso = await buildMobileSecurityObject({
    docType,
    nameSpaces,
    deviceJwkPublicKey,
    digestAlgorithm,
    validFrom,
    validUntil,
    expectedUpdate,
  });

  const msoTag24 = createTag24(mso);

  const protectedHeaders = buildProtectedHeaders(issuerJwkPrivateKey);
  const unprotectedHeaders = buildUnprotectedHeaders(x5c);

  const sign1 = await Sign1.sign({
    protectedHeaders,
    unprotectedHeaders,
    payload: encodeCbor(msoTag24),
    jwkPrivateKey: issuerJwkPrivateKey,
  });

  console.log('sign1.getContentForEncoding', sign1.getContentForEncoding());

  return issuerAuthSchema.parse(sign1.getContentForEncoding());
};
