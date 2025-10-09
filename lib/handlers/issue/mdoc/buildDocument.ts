import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { JwkPrivateKey, JwkPublicKey } from '@/jwk/types';
import { RandomBytes } from '@/types';
import { NameSpaceElements } from '@/schemas/record/NameSpaceElements';
import { buildIssuerSigned } from './buildIssuerSigned';
import { Document } from '@/schemas/mdoc/Document';

/**
 * Parameters for building a mobile document (mDoc)
 *
 * @description
 * Defines all the required and optional parameters needed to construct a complete
 * mobile document according to ISO/IEC 18013-5 specification.
 */
export type BuildDocumentParams = {
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
 * Builds a complete mobile document (mDoc) structure
 *
 * @description
 * Creates a mobile document by combining the document type identifier with
 * the issuer-signed data. This function orchestrates the creation of the
 * complete mDoc structure according to ISO/IEC 18013-5.
 *
 * The resulting document contains:
 * - Document type identifier (docType)
 * - Issuer-signed data (IssuerSigned) which includes:
 *   - Name-spaced data elements
 *   - Issuer authentication (COSE_Sign1 with MSO)
 *
 * @param params - The document building parameters
 * @param params.docType - The document type identifier (e.g., 'org.iso.18013.5.1.mDL')
 * @param params.nameSpaceElements - The issuer namespaces and their elements
 * @param params.randomBytes - Random bytes generator for salt generation
 * @param params.deviceJwkPublicKey - The device's public key
 * @param params.digestAlgorithm - The digest algorithm for value digests
 * @param params.signed - The date and time when the MSO was signed
 * @param params.validFrom - The date and time when the document becomes valid
 * @param params.validUntil - The date and time when the document expires
 * @param params.expectedUpdate - Optional date and time for document update
 * @param params.x5chain - The issuer's X.509 certificate chain
 * @param params.issuerJwkPrivateKey - The issuer's private key for signing
 *
 * @returns A complete Document structure with docType and issuerSigned
 *
 * @example
 * ```typescript
 * import { buildDocument } from '@/handlers/issue/mdoc/buildDocument';
 * import { webcrypto } from 'crypto';
 *
 * const document = buildDocument({
 *   docType: 'org.iso.18013.5.1.mDL',
 *   nameSpaceElements: {
 *     'org.iso.18013.5.1': {
 *       given_name: 'John',
 *       family_name: 'Doe',
 *       birth_date: '1990-01-01',
 *     },
 *   },
 *   randomBytes: (length) => {
 *     const bytes = new Uint8Array(length);
 *     webcrypto.getRandomValues(bytes);
 *     return bytes;
 *   },
 *   deviceJwkPublicKey: devicePublicKey,
 *   digestAlgorithm: 'SHA-256',
 *   signed: new Date(),
 *   validFrom: new Date(),
 *   validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
 *   x5chain: issuerCertificate,
 *   issuerJwkPrivateKey: issuerPrivateKey,
 * });
 * ```
 *
 * @see {@link buildIssuerSigned} - Function used internally to create IssuerSigned structure
 * @see {@link Document} - The return type schema
 */
export const buildDocument = ({
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
}: BuildDocumentParams): Document => {
  const issuerSigned = buildIssuerSigned({
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
  });

  return {
    docType,
    issuerSigned,
  };
};
