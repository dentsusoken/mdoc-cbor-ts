import { toSign1 } from '@/cose/toSign1';
import { toDeviceAuthObject, toDeviceSignedObject } from '@/handlers/to-object';
import { JwkPublicKey } from '@/jwk/types';
import { encodeDeviceAuthentication } from '@/mdoc/encodeDeviceAuthentication';
import { SessionTranscript } from '@/mdoc/types';
import { DeviceSigned } from '@/schemas/mdoc/DeviceSigned';

/**
 * Parameters for verifying a device-signed object.
 *
 * @property {DeviceSigned} deviceSigned - The device-signed object structure containing nameSpaces and deviceAuth.
 * @property {string} docType - The document type string (e.g., "org.iso.18013.5.1.mDL").
 * @property {SessionTranscript} sessionTranscript - The session transcript tuple [DeviceEngagementBytes|null, EReaderKeyBytes|null, Handover].
 * @property {JwkPublicKey} deviceJwkPublicKey - The JWK public key to use for signature verification.
 */
interface VerifyDeviceSignedParams {
  deviceSigned: DeviceSigned;
  docType: string;
  sessionTranscript: SessionTranscript;
  deviceJwkPublicKey: JwkPublicKey;
}

/**
 * Verifies a device-signed object's signature.
 *
 * @description
 * This function verifies the device signature of a {@link DeviceSigned} structure according to ISO/IEC 18013-5.
 * The verification process involves:
 * 1. Extracting `nameSpaces` and `deviceAuth` from the `DeviceSigned` structure using {@link toDeviceSignedObject}.
 * 2. Extracting `deviceSignature` from the `DeviceAuth` structure using {@link toDeviceAuthObject}.
 * 3. Converting the `deviceSignature` (CBOR Tag 18) to a {@link Sign1} instance using {@link toSign1}.
 * 4. Encoding the DeviceAuthentication structure using {@link encodeDeviceAuthentication}, which includes:
 *    - The session transcript
 *    - The document type
 *    - The device name spaces
 * 5. Verifying the COSE_Sign1 signature using the provided device public key and the detached payload.
 *
 * The function throws an error if any step fails, including missing required fields, invalid structures,
 * or signature verification failure.
 *
 * @param {VerifyDeviceSignedParams} params - The parameters for verification.
 * @param {DeviceSigned} params.deviceSigned - The device-signed object structure.
 * @param {string} params.docType - The document type string.
 * @param {SessionTranscript} params.sessionTranscript - The session transcript tuple.
 * @param {JwkPublicKey} params.deviceJwkPublicKey - The JWK public key for signature verification.
 *
 * @returns {void} This function does not return a value. It throws an error if verification fails.
 *
 * @throws {ErrorCodeError}
 * Throws an error with code {@link MdocErrorCode.DeviceNameSpacesMissing} if `nameSpaces` is missing.
 * Throws an error with code {@link MdocErrorCode.DeviceAuthMissing} if `deviceAuth` is missing.
 * Throws an error with code {@link MdocErrorCode.DeviceSignatureMissing} if `deviceSignature` is missing.
 * Throws an error with code {@link MdocErrorCode.DeviceMacNotSupported} if `deviceMac` is present (not supported).
 * Throws an error with code {@link MdocErrorCode.Sign1ConversionFailed} if the Tag 18 cannot be converted to Sign1.
 *
 * @throws {Error}
 * Throws an error if the detached payload is required but not provided.
 * Throws an error if signature verification fails.
 *
 * @see {@link toDeviceSignedObject} - For extracting device-signed structure.
 * @see {@link toDeviceAuthObject} - For extracting device authentication structure.
 * @see {@link toSign1} - For converting Tag 18 to Sign1 instance.
 * @see {@link encodeDeviceAuthentication} - For encoding DeviceAuthentication structure.
 * @see {@link Sign1.verify} - For signature verification details.
 * @see {@link ErrorCodeError}
 * @see {@link MdocErrorCode}
 *
 * @example
 * ```typescript
 * const deviceSigned: DeviceSigned = new Map([
 *   ['nameSpaces', createTag24(deviceNameSpacesMap)],
 *   ['deviceAuth', deviceAuthMap],
 * ]);
 * const sessionTranscript: SessionTranscript = [null, null, {}];
 * const docType = 'org.iso.18013.5.1.mDL';
 * const deviceJwkPublicKey: JwkPublicKey = {
 *   kty: 'EC',
 *   crv: 'P-256',
 *   x: '...',
 *   y: '...',
 * };
 *
 * try {
 *   verifyDeviceSigned({
 *     deviceSigned,
 *     docType,
 *     sessionTranscript,
 *     deviceJwkPublicKey,
 *   });
 *   console.log('Device signature verification successful');
 * } catch (error) {
 *   console.error('Device signature verification failed:', error);
 * }
 * ```
 */
export const verifyDeviceSigned = ({
  deviceSigned,
  docType,
  sessionTranscript,
  deviceJwkPublicKey,
}: VerifyDeviceSignedParams): void => {
  const { nameSpaces, deviceAuth } = toDeviceSignedObject(deviceSigned);
  const { deviceSignature } = toDeviceAuthObject(deviceAuth);
  const sign1 = toSign1(deviceSignature);
  const detachedPayload = encodeDeviceAuthentication({
    sessionTranscript,
    docType,
    nameSpacesBytes: nameSpaces,
  });
  sign1.verify(deviceJwkPublicKey, { detachedPayload });
};
