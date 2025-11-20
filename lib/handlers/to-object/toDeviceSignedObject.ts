import { Tag } from 'cbor-x';
import { DeviceAuth } from '@/schemas/mdoc/DeviceAuth';
import { DeviceSigned } from '@/schemas/mdoc/DeviceSigned';
import { MdocErrorCode } from '@/mdoc/types';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';

/**
 * Plain object representation for extracted device-signed document data.
 *
 * @description
 * This object type contains the essential extracted values from a `DeviceSigned` structure:
 * - `nameSpaces`: The device name spaces encoded as CBOR Tag 24 (DeviceNameSpacesBytes).
 * - `deviceAuth`: The device authentication structure containing device signature and device MAC.
 *
 * @property nameSpaces - The device name spaces, encoded as CBOR Tag 24.
 * @property deviceAuth - The device authentication structure (DeviceAuth Map) extracted from the DeviceSigned map.
 *
 * @see DeviceSigned
 * @see DeviceAuth
 */
export interface DeviceSignedObject {
  /** The device name spaces, encoded as CBOR Tag 24. */
  nameSpaces: Tag;
  /** The device authentication structure extracted from the DeviceSigned map. */
  deviceAuth: DeviceAuth;
}

/**
 * Converts a DeviceSigned Map structure to a plain object.
 *
 * @description
 * Extracts the `nameSpaces` and `deviceAuth` fields from a `DeviceSigned` Map
 * and returns them as a plain object. This function performs validation to ensure
 * both required fields are present in the input structure.
 *
 * @param deviceSigned - The DeviceSigned Map structure containing nameSpaces and deviceAuth.
 * @returns An object containing the extracted nameSpaces and deviceAuth.
 *
 * @throws {ErrorCodeError}
 * Throws an error if `nameSpaces` is missing with code {@link MdocErrorCode.DeviceNameSpacesMissing}.
 * Throws an error if `deviceAuth` is missing with code {@link MdocErrorCode.DeviceAuthMissing}.
 *
 * @see {@link DeviceSigned}
 * @see {@link DeviceAuth}
 * @see {@link ErrorCodeError}
 * @see {@link MdocErrorCode}
 *
 * @example
 * ```typescript
 * const deviceSigned: DeviceSigned = new Map([
 *   ['nameSpaces', createTag24(deviceNameSpacesMap)],
 *   ['deviceAuth', deviceAuthMap],
 * ]);
 * const result = toDeviceSignedObject(deviceSigned);
 * // result.nameSpaces and result.deviceAuth are now available as plain object properties
 * ```
 */
export const toDeviceSignedObject = (
  deviceSigned: DeviceSigned
): DeviceSignedObject => {
  const nameSpaces = deviceSigned.get('nameSpaces');
  if (!nameSpaces) {
    throw new ErrorCodeError(
      'The device name spaces are missing.',
      MdocErrorCode.DeviceNameSpacesMissing
    );
  }

  const deviceAuth = deviceSigned.get('deviceAuth');
  if (!deviceAuth) {
    throw new ErrorCodeError(
      'The device authentication is missing.',
      MdocErrorCode.DeviceAuthMissing
    );
  }

  return {
    nameSpaces,
    deviceAuth,
  };
};
