import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { MobileSecurityObject } from '@/schemas/mso/MobileSecurityObject';
import { buildValidityInfo } from './buildValidityInfo';
import { buildValueDigests } from './buildValueDigests';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { JwkPublicKey } from '@/jwk/types';
import { jwkToCosePublicKey } from '@/cose/jwkToCosePublicKey';

/**
 * Parameters for building a Mobile Security Object (MSO).
 */
export type BuildMobileSecurityObjectParams = {
  /** The document type identifier (e.g., 'org.iso.18013.5.1.mDL') */
  docType: string;
  /** The issuer namespaces containing issuer signed item tags */
  nameSpaces: IssuerNameSpaces;
  /** The device's public key for authentication */
  deviceJwkPublicKey: JwkPublicKey;
  /** The digest algorithm to use for calculating value digests */
  digestAlgorithm: DigestAlgorithm;
  /** The base date to use for calculations */
  baseDate?: Date;
  /** Duration in milliseconds from now until the document becomes valid */
  validFrom: number;
  /** Duration in milliseconds from now until the document expires */
  validUntil: number;
  /** Optional duration in milliseconds from now until the document should be updated */
  expectedUpdate?: number;
};

/**
 * Builds a Mobile Security Object (MSO) for mDL (mobile driving license) issuance.
 *
 * This function creates a complete Mobile Security Object that contains all the necessary
 * information for document verification, including value digests, validity information,
 * and device key information. The MSO is a critical component in the mDL issuance process
 * that ensures document integrity and provides verification capabilities.
 *
 * @param params - The parameters for building the Mobile Security Object
 * @param params.docType - The document type identifier
 * @param params.nameSpaces - The issuer namespaces containing issuer signed item tags
 * @param params.deviceJwkPublicKey - The device's JWK public key used to derive the COSE public key
 * @param params.digestAlgorithm - The digest algorithm to use for calculating value digests
 * @param params.baseDate - The base date to use for calculations
 * @param params.validFrom - Duration in milliseconds from the base date until the document becomes valid
 * @param params.validUntil - Duration in milliseconds from the base date until the document expires
 * @param params.expectedUpdate - Optional duration in milliseconds from the base date until the document should be updated
 * @returns A Promise that resolves to a complete MobileSecurityObject
 *
 * @example
 * ```typescript
 * const mso = await buildMobileSecurityObject({
 *   docType: 'org.iso.18013.5.1.mDL',
 *   nameSpaces: new Map([
 *     ['org.iso.18013.5.1', [tag1, tag2]],
 *     ['org.iso.18013.5.2', [tag3]]
 *   ]),
 *   deviceJwkPublicKey,
 *   digestAlgorithm: 'SHA-256',
 *   validFrom: 0,
 *   validUntil: 24 * 60 * 60 * 1000, // +1 day
 *   expectedUpdate: 60 * 60 * 1000 // +1 hour
 * });
 *
 * // Result structure:
 * // {
 * //   version: '1.0',
 * //   docType: 'org.iso.18013.5.1.mDL',
 * //   digestAlgorithm: 'SHA-256',
 * //   valueDigests: Map { // calculated digests },
 * //   validityInfo: {
 * //     // All fields are Tag(0) (tdate) with normalized 'YYYY-MM-DDTHH:MM:SSZ' values
 * //     signed: new Tag('2025-01-01T00:00:00Z', 0),
 * //     validFrom: new Tag('2025-01-01T00:00:00Z', 0),
 * //     validUntil: new Tag('2025-01-02T00:00:00Z', 0),
 * //     expectedUpdate?: new Tag('2025-01-01T01:00:00Z', 0)
 * //   },
 * //   deviceKeyInfo: { deviceKey: // device public key }
 * // }
 * ```
 *
 * @example
 * ```typescript
 * // Without expected update
 * const mso = await buildMobileSecurityObject({
 *   docType: 'org.iso.18013.5.1.mDL',
 *   nameSpaces: new Map([['org.iso.18013.5.1', [tag1]]]),
 *   deviceJwkPublicKey,
 *   digestAlgorithm: 'SHA-256',
 *   validFrom: 0,
 *   validUntil: 24 * 60 * 60 * 1000
 * });
 * ```
 */
export const buildMobileSecurityObject = async ({
  docType,
  nameSpaces,
  deviceJwkPublicKey,
  digestAlgorithm,
  baseDate,
  validFrom,
  validUntil,
  expectedUpdate,
}: BuildMobileSecurityObjectParams): Promise<MobileSecurityObject> => {
  const deviceKey = jwkToCosePublicKey(deviceJwkPublicKey);
  const valueDigests = await buildValueDigests({ nameSpaces, digestAlgorithm });
  const validityInfo = buildValidityInfo({
    baseDate,
    validFrom,
    validUntil,
    expectedUpdate,
  });
  const mso: MobileSecurityObject = {
    version: '1.0',
    docType,
    digestAlgorithm,
    valueDigests,
    validityInfo,
    deviceKeyInfo: {
      deviceKey,
    },
  };

  return mso;
};
