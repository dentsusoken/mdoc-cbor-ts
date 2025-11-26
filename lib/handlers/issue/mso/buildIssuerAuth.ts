import { encodeCbor } from '@/cbor/codec';
import { IssuerAuth, issuerAuthSchema } from '@/schemas/mso/IssuerAuth';
import { createTag24 } from '@/cbor/createTag24';
import { buildMobileSecurityObject } from './buildMobileSecurityObject';
import { JwkPrivateKey, JwkPublicKey } from '@/jwk/types';
import { resolveJwkAlgorithmName } from '@/jwk/resolveJwkAlgorithmName';
import { Sign1 } from '@/cose/Sign1';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { jwkToCoseAlgorithm } from '@/jwk-to-cose/jwkToCoseAlgorithm';
import { Header } from '@/cose/types';

/**
 * Parameters for building an IssuerAuth structure using COSE_Sign1.
 *
 * @description
 * These parameters are required to construct a Mobile Security Object (MSO), embed it as
 * CBOR Tag 24, and sign it with COSE_Sign1 for issuer authentication.
 */
export type BuildIssuerAuthtParams = {
  /** The document type identifier (e.g., 'org.iso.18013.5.1.mDL') */
  docType: string;
  /** The issuer namespaces containing CBOR Tag 24 wrapped issuer-signed items */
  nameSpaces: IssuerNameSpaces;
  /** The device's public key (JWK) for authentication */
  deviceJwkPublicKey: JwkPublicKey;
  /** The digest algorithm to use for calculating value digests */
  digestAlgorithm: string;
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
 * Builds and signs an IssuerAuth structure for mobile document authentication.
 *
 * @description
 * Synchronously creates a complete Mobile Security Object (MSO) with value digests, validity info,
 * and device key info, embeds it as CBOR Tag 24 via {@link createTag24}, then signs
 * it using COSE_Sign1 via {@link Sign1.sign}. The function automatically constructs the COSE
 * protected headers (with algorithm derived from the issuer's private key) and unprotected headers
 * (with x5chain). The resulting COSE_Sign1 content is validated using {@link issuerAuthSchema}
 * and returned as an {@link IssuerAuth}.
 *
 * @param params - The parameters for building and signing the IssuerAuth
 * @param params.docType - The document type identifier (e.g., 'org.iso.18013.5.1.mDL')
 * @param params.nameSpaces - The issuer namespaces (Map) containing CBOR Tag 24 wrapped issuer-signed items
 * @param params.deviceJwkPublicKey - The device's JWK public key used to derive the COSE public key
 * @param params.digestAlgorithm - The digest algorithm to use for calculating value digests
 * @param params.signed - The date and time when the MSO was signed
 * @param params.validFrom - The date and time when the document becomes valid
 * @param params.validUntil - The date and time when the document expires
 * @param params.expectedUpdate - Optional date and time when the document should be updated
 * @param params.x5chain - The issuer's X.509 certificate chain (single certificate or array)
 * @param params.issuerJwkPrivateKey - The issuer's private key (JWK) for signing
 * @returns A validated {@link IssuerAuth} (COSE_Sign1)
 *
 * @example
 * ```typescript
 * import { buildIssuerNameSpaces } from '../mdoc/buildIssuerNameSpaces';
 * import { randomBytes } from '@noble/hashes/utils';
 * import { createTag1004 } from '@/cbor/createTag1004';
 * import { certificateToDerBytes } from '@/x509/certificateToDerBytes';
 *
 * // First, build issuer namespaces with issuer-signed items
 * const nameSpaces = buildIssuerNameSpaces({
 *   'org.iso.18013.5.1': {
 *     given_name: 'John',
 *     family_name: 'Doe',
 *     birth_date: createTag1004(new Date('1990-01-01'))
 *   },
 *   'org.iso.18013.5.2': {
 *     license_number: 'D1234567'
 *   }
 * }, randomBytes);
 *
 * // Prepare certificate chain
 * const x5chain = [certificateToDerBytes(issuerCertificate)];
 *
 * // Build and sign the IssuerAuth
 * const issuerAuth = buildIssuerAuth({
 *   docType: 'org.iso.18013.5.1.mDL',
 *   nameSpaces,
 *   deviceJwkPublicKey,
 *   digestAlgorithm: 'SHA-256',
 *   signed: new Date('2025-01-01T00:00:00Z'),
 *   validFrom: new Date('2025-01-01T00:00:00Z'),
 *   validUntil: new Date('2025-01-02T00:00:00Z'),
 *   expectedUpdate: new Date('2025-01-01T01:00:00Z'),
 *   x5chain,
 *   issuerJwkPrivateKey,
 * });
 * // MSO is embedded as Tag(24, bstr) and signed with COSE_Sign1.
 * ```
 *
 * @see {@link buildMobileSecurityObject}
 * @see {@link buildIssuerNameSpaces}
 * @see {@link createTag24}
 * @see {@link Sign1}
 * @see {@link issuerAuthSchema}
 * @see {@link jwkToCoseCurveAlgorithm}
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
  x5chain,
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
  const jwkAlg = resolveJwkAlgorithmName({
    algorithmName: issuerJwkPrivateKey.alg,
    curveName: issuerJwkPrivateKey.crv,
  });
  const algorithm = jwkToCoseAlgorithm(jwkAlg);
  const protectedHeaders = encodeCbor(
    new Map<number, unknown>([[Header.Algorithm, algorithm]])
  );
  const unprotectedHeaders = new Map<number, unknown>([
    [Header.X5Chain, x5chain],
  ]);

  const sign1 = Sign1.sign({
    protectedHeaders,
    unprotectedHeaders,
    payload: encodeCbor(msoTag24),
    jwkPrivateKey: issuerJwkPrivateKey,
  });

  return issuerAuthSchema.parse(sign1.getContentForEncoding());
};
