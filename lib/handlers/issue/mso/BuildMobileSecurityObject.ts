import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { MobileSecurityObject } from '@/schemas/mso/MobileSecurityObject';
import { buildValidityInfo } from './buildValidityInfo';
import { buildValueDigests } from './buildValueDigests';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { DeviceKey } from '@/schemas/mso/DeviceKey';

/**
 * Parameters for building a Mobile Security Object (MSO).
 */
export type BuildMobileSecurityObjectParams = {
  /** The document type identifier (e.g., 'org.iso.18013.5.1.mDL') */
  docType: string;
  /** The issuer namespaces containing issuer signed item tags */
  nameSpaces: IssuerNameSpaces;
  /** The device's public key for authentication */
  deviceKey: DeviceKey;
  /** The digest algorithm to use for calculating value digests */
  digestAlgorithm: DigestAlgorithm;
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
 * @param params.deviceKey - The device's public key for authentication
 * @param params.digestAlgorithm - The digest algorithm to use for calculating value digests
 * @param params.validFrom - The timestamp when the document becomes valid
 * @param params.validUntil - The timestamp when the document expires
 * @param params.expectedUpdate - Optional timestamp for expected document updates
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
 *   deviceKey: devicePublicKey.esMap,
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
 * //   validityInfo: { // validity information },
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
 *   deviceKey: devicePublicKey.esMap,
 *   digestAlgorithm: 'SHA-256',
 *   validFrom: 0,
 *   validUntil: 24 * 60 * 60 * 1000
 * });
 * ```
 */
export const buildMobileSecurityObject = async ({
  docType,
  nameSpaces,
  deviceKey,
  digestAlgorithm,
  validFrom,
  validUntil,
  expectedUpdate,
}: BuildMobileSecurityObjectParams): Promise<MobileSecurityObject> => {
  const mso: MobileSecurityObject = {
    version: '1.0',
    docType,
    digestAlgorithm,
    valueDigests: await buildValueDigests({ nameSpaces, digestAlgorithm }),
    validityInfo: buildValidityInfo({
      validFrom,
      validUntil,
      expectedUpdate,
    }),
    deviceKeyInfo: {
      deviceKey,
    },
  };

  return mso;
};
