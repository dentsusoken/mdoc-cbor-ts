import { DigestAlgorithm } from '@/cose/types';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { DeviceKeyInfo } from '@/schemas/mso/DeviceKeyInfo';
import { MobileSecurityObject } from '@/schemas/mso/MobileSecurityObject';
import { ValidityInfo } from '@/schemas/mso/ValidityInfo';
import { ValueDigests } from '@/schemas/mso/ValueDigests';

/**
 * Plain object representation of a Mobile Security Object (MSO).
 *
 * @description
 * This interface represents the MSO as a plain JavaScript object, converted from
 * the Map-based {@link MobileSecurityObject} structure. It contains all the
 * required fields for document verification and integrity checking.
 *
 * @property {string} version - The MSO version (typically "1.0").
 * @property {DigestAlgorithm} digestAlgorithm - The digest algorithm used for value digests.
 * @property {ValueDigests} valueDigests - Map of namespace to digest IDs for integrity verification.
 * @property {DeviceKeyInfo} deviceKeyInfo - Information about the device's public key.
 * @property {string} docType - The document type identifier (e.g., 'org.iso.18013.5.1.mDL').
 * @property {ValidityInfo} validityInfo - Validity information including signed, validFrom, and validUntil dates.
 */
export interface MobileSecurityObjectObject {
  version: string;
  digestAlgorithm: DigestAlgorithm;
  valueDigests: ValueDigests;
  deviceKeyInfo: DeviceKeyInfo;
  docType: string;
  validityInfo: ValidityInfo;
}

/**
 * Converts a Map-based Mobile Security Object to a plain object representation.
 *
 * @description
 * This function extracts all required fields from a {@link MobileSecurityObject} Map
 * and converts them into a plain JavaScript object. It validates that all required
 * fields are present and throws specific errors if any field is missing.
 *
 * @param {MobileSecurityObject} mobileSecurityObject - The Map-based Mobile Security Object to convert.
 * @returns {MobileSecurityObjectObject} A plain object representation of the Mobile Security Object.
 *
 * @throws {ErrorCodeError} If the version field is missing (error code: {@link MdocErrorCode.VersionMissing}).
 * @throws {ErrorCodeError} If the digestAlgorithm field is missing (error code: {@link MdocErrorCode.DigestAlgorithmMissing}).
 * @throws {ErrorCodeError} If the valueDigests field is missing (error code: {@link MdocErrorCode.ValueDigestsMissing}).
 * @throws {ErrorCodeError} If the deviceKeyInfo field is missing (error code: {@link MdocErrorCode.DeviceKeyInfoMissing}).
 * @throws {ErrorCodeError} If the docType field is missing (error code: {@link MdocErrorCode.DocTypeMissing}).
 * @throws {ErrorCodeError} If the validityInfo field is missing (error code: {@link MdocErrorCode.ValidityInfoMissing}).
 *
 * @example
 * ```typescript
 * const msoMap = new Map([
 *   ['version', '1.0'],
 *   ['digestAlgorithm', DigestAlgorithm.SHA256],
 *   ['valueDigests', valueDigestsMap],
 *   ['deviceKeyInfo', deviceKeyInfo],
 *   ['docType', 'org.iso.18013.5.1.mDL'],
 *   ['validityInfo', validityInfoMap]
 * ]);
 *
 * const msoObject = toMobileSecurityObjectObject(msoMap);
 * // Returns: {
 * //   version: '1.0',
 * //   digestAlgorithm: 'SHA-256',
 * //   valueDigests: ...,
 * //   deviceKeyInfo: ...,
 * //   docType: 'org.iso.18013.5.1.mDL',
 * //   validityInfo: ...
 * // }
 * ```
 */
export const toMobileSecurityObjectObject = (
  mobileSecurityObject: MobileSecurityObject
): MobileSecurityObjectObject => {
  const version = mobileSecurityObject.get('version');
  if (!version) {
    throw new ErrorCodeError(
      'Version is missing',
      MdocErrorCode.VersionMissing
    );
  }

  const digestAlgorithm = mobileSecurityObject.get('digestAlgorithm');
  if (!digestAlgorithm) {
    throw new ErrorCodeError(
      'Digest algorithm is missing',
      MdocErrorCode.DigestAlgorithmMissing
    );
  }

  const valueDigests = mobileSecurityObject.get('valueDigests');
  if (!valueDigests) {
    throw new ErrorCodeError(
      'Value digests are missing',
      MdocErrorCode.ValueDigestsMissing
    );
  }

  const deviceKeyInfo = mobileSecurityObject.get('deviceKeyInfo');
  if (!deviceKeyInfo) {
    throw new ErrorCodeError(
      'Device key info is missing',
      MdocErrorCode.DeviceKeyInfoMissing
    );
  }

  const docType = mobileSecurityObject.get('docType');
  if (!docType) {
    throw new ErrorCodeError(
      'Doc type is missing',
      MdocErrorCode.DocTypeMissing
    );
  }

  const validityInfo = mobileSecurityObject.get('validityInfo');
  if (!validityInfo) {
    throw new ErrorCodeError(
      'Validity info is missing',
      MdocErrorCode.ValidityInfoMissing
    );
  }

  return {
    version,
    digestAlgorithm,
    valueDigests,
    deviceKeyInfo,
    docType,
    validityInfo,
  };
};
