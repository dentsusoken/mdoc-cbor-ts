import { Tag } from 'cbor-x';
import { DeviceAuth } from '@/schemas/mdoc/DeviceAuth';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';

/**
 * Plain object representation for extracted device authentication data.
 *
 * @description
 * This object type contains the extracted values from a `DeviceAuth` structure.
 * Currently, only `deviceSignature` is supported; `deviceMac` is not supported
 * and will always be `undefined`.
 *
 * @property deviceSignature - The device signature, encoded as CBOR Tag 18 (COSE_Sign1).
 * @property deviceMac - Always `undefined` as device MAC is not currently supported.
 *
 * @see DeviceAuth
 */
export interface DeviceAuthObject {
  /** The device signature, encoded as CBOR Tag 18 (COSE_Sign1). */
  deviceSignature: Tag;
  /** Always `undefined` as device MAC is not currently supported. */
  deviceMac: undefined;
}

/**
 * Converts a DeviceAuth Map structure to a plain object.
 *
 * @description
 * Extracts the `deviceSignature` field from a `DeviceAuth` Map and returns it
 * as a plain object. This function performs validation to ensure that:
 * - `deviceSignature` is present (required).
 * - `deviceMac` is not present (not currently supported).
 *
 * Currently, only device signature authentication is supported. If `deviceMac`
 * is present in the input, an error is thrown indicating that device MAC is
 * not supported.
 *
 * @param deviceAuth - The DeviceAuth Map structure containing deviceSignature and optionally deviceMac.
 * @returns An object containing the extracted deviceSignature and deviceMac (always undefined).
 *
 * @throws {ErrorCodeError}
 * Throws an error if `deviceSignature` is missing with code {@link MdocErrorCode.DeviceSignatureMissing}.
 * Throws an error if `deviceMac` is present with code {@link MdocErrorCode.DeviceMacNotSupported}.
 *
 * @see {@link DeviceAuth}
 * @see {@link ErrorCodeError}
 * @see {@link MdocErrorCode}
 *
 * @example
 * ```typescript
 * const deviceAuth: DeviceAuth = new Map([
 *   ['deviceSignature', createTag18(sign1Tuple)],
 * ]);
 * const result = toDeviceAuthObject(deviceAuth);
 * // result.deviceSignature is now available as a plain object property
 * // result.deviceMac is undefined
 * ```
 */
export const toDeviceAuthObject = (
  deviceAuth: DeviceAuth
): DeviceAuthObject => {
  const deviceSignature = deviceAuth.get('deviceSignature');
  if (!deviceSignature) {
    throw new ErrorCodeError(
      'The device signature is missing.',
      MdocErrorCode.DeviceSignatureMissing
    );
  }

  const deviceMac = deviceAuth.get('deviceMac');
  if (deviceMac) {
    throw new ErrorCodeError(
      'The device MAC is not supported.',
      MdocErrorCode.DeviceMacNotSupported
    );
  }

  return {
    deviceSignature,
    deviceMac: undefined,
  };
};
