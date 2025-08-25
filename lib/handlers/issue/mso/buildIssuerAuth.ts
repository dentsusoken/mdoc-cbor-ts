import { COSEKey, Sign1 } from '@auth0/cose';
import { encodeCbor } from '@/cbor/codec';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { IssuerAuth, issuerAuthSchema } from '@/schemas/mso/IssuerAuth';
import { createTag24 } from '@/cbor/createTag24';
import { buildValueDigests } from './buildValueDigests';
import { buildValidityInfo } from './buildValidityInfo';
import { buildProtectedHeaders } from '../cose/buildProtectedHeaders';
import { buildUnprotectedHeaders } from '../cose/buildUnprotectedHeaders';

export type BuildIssuerAuthtParams = {
  /** The document type identifier (e.g., 'org.iso.18013.5.1.mDL') */
  docType: string;
  /** The issuer namespaces containing issuer signed item tags */
  nameSpaces: IssuerNameSpaces;
  /** The device's public key for authentication */
  deviceKey: COSEKey;
  /** The digest algorithm to use for calculating value digests */
  digestAlgorithm: DigestAlgorithm;
  /** Duration in milliseconds from now until the document becomes valid */
  validFrom: number;
  /** Duration in milliseconds from now until the document expires */
  validUntil: number;
  /** Optional duration in milliseconds from now until the document should be updated */
  expectedUpdate?: number;
  /** The issuer's private key for signing */
  issuerPrivateKey: COSEKey;
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
 * @param params.deviceKey - The device's public key for authentication
 * @param params.digestAlgorithm - The digest algorithm to use for calculating value digests
 * @param params.validFrom - Duration in milliseconds from now until the document becomes valid
 * @param params.validUntil - Duration in milliseconds from now until the document expires
 * @param params.expectedUpdate - Optional duration in milliseconds from now until the document should be updated
 * @param params.issuerPrivateKey - The issuer's private key for signing
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
 *   deviceKey: devicePublicKey,
 *   digestAlgorithm: 'SHA-256',
 *   validFrom: 0,
 *   validUntil: 24 * 60 * 60 * 1000, // +1 day
 *   expectedUpdate: 60 * 60 * 1000, // +1 hour
 *   issuerPrivateKey: privateKey,
 *   x5c: [certificateBytes]
 * });
 * ```
 */
export const buildIssuerAuth = async ({
  docType,
  nameSpaces,
  deviceKey,
  digestAlgorithm,
  validFrom,
  validUntil,
  expectedUpdate,
  issuerPrivateKey,
  x5c,
}: BuildIssuerAuthtParams): Promise<IssuerAuth> => {
  const mso = new Map<string, unknown>();
  mso.set('version', '1.0');
  mso.set('docType', docType);
  mso.set('digestAlgorithm', digestAlgorithm);
  mso.set(
    'valueDigests',
    await buildValueDigests({ nameSpaces, digestAlgorithm })
  );
  mso.set(
    'validityInfo',
    buildValidityInfo({
      validFrom,
      validUntil,
      expectedUpdate,
    })
  );
  mso.set('deviceKeyInfo', { deviceKey });

  const msoTag24 = createTag24(mso);

  const protectedHeaders = buildProtectedHeaders(issuerPrivateKey);
  const unprotectedHeaders = buildUnprotectedHeaders(x5c);

  const sign1 = await Sign1.sign(
    protectedHeaders,
    unprotectedHeaders,
    encodeCbor(msoTag24),
    await issuerPrivateKey.toKeyLike()
  );

  return issuerAuthSchema.parse(sign1.getContentForEncoding());
};
