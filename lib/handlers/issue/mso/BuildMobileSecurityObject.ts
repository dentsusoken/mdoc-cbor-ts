import { MobileSecurityObject } from '@/schemas/mso/MobileSecurityObject';
import { buildValidityInfo } from './buildValidityInfo';
import { buildValueDigests } from './buildValueDigests';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { JwkPublicKey } from '@/jwk/types';
import { jwkToCosePublicKey } from '@/cose/jwkToCosePublicKey';
import { NameSpaceElements } from '@/schemas/record/NameSpaceElements';
import { buildIssuerNameSpaces } from '../mdoc/buildIssuerNameSpaces';
import { RandomBytes } from 'noble-curves-extended';

/**
 * Parameters for building a Mobile Security Object (MSO).
 */
export type BuildMobileSecurityObjectParams = {
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
};

/**
 * Builds a Mobile Security Object (MSO) for mDL (mobile driving license) issuance.
 *
 * This function creates a complete Mobile Security Object that contains all the necessary
 * information for document verification, including value digests, validity information,
 * and device key information. The MSO is a critical component in the mDL issuance process
 * that ensures document integrity and provides verification capabilities.
 *
 * The function internally converts the `nameSpaceElements` record into issuer namespaces
 * with CBOR Tag 24 wrapped issuer-signed items, then calculates value digests for each
 * element and assembles the complete MSO structure.
 *
 * @param params - The parameters for building the Mobile Security Object
 * @param params.docType - The document type identifier (e.g., 'org.iso.18013.5.1.mDL')
 * @param params.nameSpaceElements - The issuer namespaces and their elements as a record structure
 * @param params.randomBytes - A cryptographically secure random bytes generator function
 * @param params.deviceJwkPublicKey - The device's JWK public key used to derive the COSE public key
 * @param params.digestAlgorithm - The digest algorithm to use for calculating value digests
 * @param params.signed - The date and time when the MSO was signed
 * @param params.validFrom - The date and time when the document becomes valid
 * @param params.validUntil - The date and time when the document expires
 * @param params.expectedUpdate - Optional date and time when the document should be updated
 * @returns A complete MobileSecurityObject
 *
 * @example
 * ```typescript
 * import { randomBytes } from '@noble/hashes/utils';
 * import { createTag1004 } from '@/cbor/createTag1004';
 *
 * const mso = buildMobileSecurityObject({
 *   docType: 'org.iso.18013.5.1.mDL',
 *   nameSpaceElements: {
 *     'org.iso.18013.5.1': {
 *       given_name: 'John',
 *       family_name: 'Doe',
 *       birth_date: createTag1004(new Date('1990-01-01'))
 *     },
 *     'org.iso.18013.5.2': {
 *       license_number: 'D1234567'
 *     }
 *   },
 *   randomBytes,
 *   deviceJwkPublicKey,
 *   digestAlgorithm: 'SHA-256',
 *   signed: new Date('2025-01-01T00:00:00Z'),
 *   validFrom: new Date('2025-01-01T00:00:00Z'),
 *   validUntil: new Date('2025-01-02T00:00:00Z'), // +1 day
 *   expectedUpdate: new Date('2025-01-01T01:00:00Z') // +1 hour
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
 * import { randomBytes } from '@noble/hashes/utils';
 *
 * // Without expected update
 * const mso = buildMobileSecurityObject({
 *   docType: 'org.iso.18013.5.1.mDL',
 *   nameSpaceElements: {
 *     'org.iso.18013.5.1': {
 *       given_name: 'John',
 *       family_name: 'Doe'
 *     }
 *   },
 *   randomBytes,
 *   deviceJwkPublicKey,
 *   digestAlgorithm: 'SHA-256',
 *   signed: new Date('2025-01-01T00:00:00Z'),
 *   validFrom: new Date('2025-01-01T00:00:00Z'),
 *   validUntil: new Date('2025-01-02T00:00:00Z')
 * });
 * ```
 */
export const buildMobileSecurityObject = ({
  docType,
  nameSpaceElements,
  randomBytes,
  deviceJwkPublicKey,
  digestAlgorithm,
  signed,
  validFrom,
  validUntil,
  expectedUpdate,
}: BuildMobileSecurityObjectParams): MobileSecurityObject => {
  const nameSpaces = buildIssuerNameSpaces(nameSpaceElements, randomBytes);
  const deviceKey = jwkToCosePublicKey(deviceJwkPublicKey);
  const valueDigests = buildValueDigests({ nameSpaces, digestAlgorithm });
  const validityInfo = buildValidityInfo({
    signed,
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
