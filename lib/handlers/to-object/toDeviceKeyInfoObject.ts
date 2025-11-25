import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { DeviceKey } from '@/schemas/mso/DeviceKey';
import { DeviceKeyInfo } from '@/schemas/mso/DeviceKeyInfo';
import { KeyAuthorizations } from '@/schemas/mso/KeyAuthorizations';
import { KeyInfo } from '@/schemas/mso/KeyInfo';

/**
 * Plain object representation for extracted device key information.
 *
 * @description
 * This object type contains the essential extracted values from a `DeviceKeyInfo` structure:
 * - `deviceKey`: The device's public key (COSE_Key) used for device authentication (required).
 * - `keyAuthorizations`: Optional authorization information specifying permitted key usages.
 * - `keyInfo`: Optional arbitrary metadata or informational values about the key.
 *
 * @property {DeviceKey} deviceKey - The device's public key (COSE_Key) for device authentication.
 * @property {KeyAuthorizations} [keyAuthorizations] - Optional authorization information for the key.
 * @property {KeyInfo} [keyInfo] - Optional arbitrary metadata or informational values.
 *
 * @see DeviceKeyInfo
 * @see DeviceKey
 * @see KeyAuthorizations
 * @see KeyInfo
 */
export interface DeviceKeyInfoObject {
  /** The device's public key (COSE_Key) for device authentication. */
  deviceKey: DeviceKey;
  /** Optional authorization information specifying permitted key usages. */
  keyAuthorizations?: KeyAuthorizations;
  /** Optional arbitrary metadata or informational values about the key. */
  keyInfo?: KeyInfo;
}

/**
 * Converts a DeviceKeyInfo Map structure to a plain object.
 *
 * @description
 * Extracts the `deviceKey`, `keyAuthorizations`, and `keyInfo` fields from a `DeviceKeyInfo` Map
 * and returns them as a plain object. This function performs validation to ensure
 * the required `deviceKey` field is present in the input structure.
 *
 * @param deviceKeyInfo - The DeviceKeyInfo Map structure containing deviceKey and optional fields.
 * @returns An object containing the extracted deviceKey and optional keyAuthorizations and keyInfo.
 *
 * @throws {ErrorCodeError}
 * Throws an error if `deviceKey` is missing with code {@link MdocErrorCode.DeviceKeyMissing}.
 *
 * @see {@link DeviceKeyInfo}
 * @see {@link DeviceKey}
 * @see {@link KeyAuthorizations}
 * @see {@link KeyInfo}
 * @see {@link ErrorCodeError}
 * @see {@link MdocErrorCode}
 *
 * @example
 * ```typescript
 * const deviceKeyInfo: DeviceKeyInfo = new Map([
 *   ['deviceKey', deviceKeyMap],
 *   ['keyAuthorizations', keyAuthorizationsMap], // optional
 *   ['keyInfo', keyInfoMap],                     // optional
 * ]);
 * const result = toDeviceKeyInfoObject(deviceKeyInfo);
 * // result.deviceKey, result.keyAuthorizations, and result.keyInfo are now available as plain objects
 * ```
 */
export const toDeviceKeyInfoObject = (
  deviceKeyInfo: DeviceKeyInfo
): DeviceKeyInfoObject => {
  const deviceKey = deviceKeyInfo.get('deviceKey');
  if (!deviceKey) {
    throw new ErrorCodeError(
      'Device key is missing',
      MdocErrorCode.DeviceKeyMissing
    );
  }
  return {
    deviceKey,
    keyAuthorizations: deviceKeyInfo.get('keyAuthorizations'),
    keyInfo: deviceKeyInfo.get('keyInfo'),
  };
};
