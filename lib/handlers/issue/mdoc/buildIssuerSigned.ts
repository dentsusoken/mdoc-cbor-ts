import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { JwkPrivateKey, JwkPublicKey } from '@/jwk/types';
import { RandomBytes } from '@/types';
import { NameSpaceElements } from '@/schemas/record/NameSpaceElements';
import { IssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { buildIssuerAuth } from '../mso/buildIssuerAuth';
import { buildIssuerNameSpaces } from './buildIssuerNameSpaces';

/**
 * Parameters for building an IssuerSigned structure.
 *
 * @description
 * These parameters are required to construct a complete IssuerSigned structure, which includes
 * both the issuer namespaces (with CBOR Tag 24 wrapped items) and the IssuerAuth (COSE_Sign1
 * signature over the Mobile Security Object).
 */
export type BuildIssuerSignedParams = {
  /** The document type identifier (e.g., 'org.iso.18013.5.1.mDL') */
  docType: string;
  /** The issuer namespaces and their associated elements as a record structure */
  nameSpaceElements: NameSpaceElements;
  /** A cryptographically secure random bytes generator function */
  randomBytes: RandomBytes;
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
  /** The issuer's X.509 certificate chain (single certificate or array) for COSE x5chain header */
  x5chain: Uint8Array | Uint8Array[];
  /** The issuer's private key (JWK) for signing COSE_Sign1 */
  issuerJwkPrivateKey: JwkPrivateKey;
};

/**
 * Builds a complete IssuerSigned structure for mobile document issuance.
 *
 * @description
 * Constructs an {@link IssuerSigned} structure by combining two operations:
 * 1. Building issuer namespaces via {@link buildIssuerNameSpaces}, which wraps each data element
 *    in CBOR Tag 24 with a digest ID, random value, and element identifier/value
 * 2. Building and signing IssuerAuth via {@link buildIssuerAuth}, which creates a Mobile Security
 *    Object (MSO) with value digests and validity info, then signs it using COSE_Sign1
 *
 * This is a high-level convenience function that orchestrates the complete issuer signing process
 * for mobile documents (mDocs). The resulting structure contains both the signed data elements
 * (nameSpaces) and the cryptographic proof (issuerAuth) that can be verified by relying parties.
 *
 * @param params - The parameters for building the IssuerSigned structure
 * @param params.docType - The document type identifier (e.g., 'org.iso.18013.5.1.mDL')
 * @param params.nameSpaceElements - The data elements grouped by namespace as a record structure
 * @param params.randomBytes - A function that generates cryptographically secure random bytes
 * @param params.deviceJwkPublicKey - The device's JWK public key for authentication
 * @param params.digestAlgorithm - The digest algorithm to use for calculating value digests
 * @param params.signed - The date and time when the MSO was signed
 * @param params.validFrom - The date and time when the document becomes valid
 * @param params.validUntil - The date and time when the document expires
 * @param params.expectedUpdate - Optional date and time when the document should be updated
 * @param params.x5chain - The issuer's X.509 certificate chain (single certificate or array)
 * @param params.issuerJwkPrivateKey - The issuer's private key (JWK) for signing
 * @returns A complete {@link IssuerSigned} structure containing nameSpaces and issuerAuth
 *
 * @example
 * ```typescript
 * import { randomBytes } from '@noble/hashes/utils';
 * import { createTag1004 } from '@/cbor/createTag1004';
 * import { certificatePemToDerBytes } from '@/x509/certificatePemToDerBytes';
 *
 * const issuerCertPem = '-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----';
 * const x5chain = certificatePemToDerBytes(issuerCertPem);
 *
 * const issuerSigned = buildIssuerSigned({
 *   docType: 'org.iso.18013.5.1.mDL',
 *   nameSpaceElements: {
 *     'org.iso.18013.5.1': {
 *       given_name: 'John',
 *       family_name: 'Doe',
 *       birth_date: createTag1004(new Date('1990-01-01')),
 *       issue_date: createTag1004(new Date('2024-01-01')),
 *       expiry_date: createTag1004(new Date('2034-01-01'))
 *     }
 *   },
 *   randomBytes,
 *   deviceJwkPublicKey: {
 *     kty: 'EC',
 *     crv: 'P-256',
 *     x: 'base64url...',
 *     y: 'base64url...'
 *   },
 *   digestAlgorithm: 'SHA-256',
 *   signed: new Date('2024-01-01T00:00:00Z'),
 *   validFrom: new Date('2024-01-01T00:00:00Z'),
 *   validUntil: new Date('2034-01-01T00:00:00Z'),
 *   x5chain,
 *   issuerJwkPrivateKey: {
 *     kty: 'EC',
 *     crv: 'P-256',
 *     x: 'base64url...',
 *     y: 'base64url...',
 *     d: 'base64url...'
 *   }
 * });
 *
 * // issuerSigned contains:
 * // - nameSpaces: Map with CBOR Tag 24 wrapped issuer-signed items
 * // - issuerAuth: COSE_Sign1 signature over the MSO
 * ```
 */
export const buildIssuerSigned = ({
  docType,
  nameSpaceElements,
  randomBytes,
  deviceJwkPublicKey,
  digestAlgorithm,
  signed,
  validFrom,
  validUntil,
  expectedUpdate,
  x5chain,
  issuerJwkPrivateKey,
}: BuildIssuerSignedParams): IssuerSigned => {
  const nameSpaces = buildIssuerNameSpaces(nameSpaceElements, randomBytes);
  const issuerAuth = buildIssuerAuth({
    docType,
    nameSpaces,
    deviceJwkPublicKey,
    digestAlgorithm,
    signed,
    validFrom,
    validUntil,
    expectedUpdate,
    x5chain,
    issuerJwkPrivateKey,
  });

  return { nameSpaces, issuerAuth };
};
