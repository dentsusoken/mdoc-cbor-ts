import { COSEKey, Sign1 } from '@auth0/cose';
import { encodeCbor } from '@/cbor/codec';
import { DeviceSigned } from '@/schemas/mdoc/DeviceSigned';
import { buildProtectedHeaders } from '@/handlers/issue/cose';
import { createTag24 } from '@/cbor/createTag24';

/**
 * Builds a DeviceSigned structure for mDL (mobile Driver's License) documents
 * @description
 * Creates a DeviceSigned object containing empty namespaces and a device authentication
 * signature. The device signature is created using COSE_Sign1 with a detached payload
 * (null payload) and the provided device private key.
 *
 * The resulting structure follows the ISO/IEC 18013-5 standard for mDL DeviceSigned:
 * ```cddl
 * DeviceSigned = {
 *   "nameSpaces" : DeviceNameSpaces,
 *   "deviceAuth" : DeviceAuth
 * }
 * ```
 *
 * @param devicePrivateKey - The COSE private key used to sign the device authentication
 * @returns Promise resolving to a DeviceSigned object with empty namespaces and device signature
 *
 * @example
 * ```typescript
 * const deviceKey = await COSEKey.generate(Algorithms.ES256, { crv: 'P-256' });
 * const deviceSigned = await buildDeviceSigned(deviceKey.privateKey);
 * // deviceSigned.nameSpaces contains empty CBOR Tag 24 Map
 * // deviceSigned.deviceAuth.deviceSignature contains COSE_Sign1 4-tuple
 * ```
 */
export const buildDeviceSigned = async (devicePrivateKey: COSEKey) => {
  const protectedHeaders = buildProtectedHeaders(devicePrivateKey);
  const unprotectedHeaders = new Map();
  const payload = null!;
  const keyList = await devicePrivateKey.toKeyLike();

  const { signature } = await Sign1.sign(
    protectedHeaders,
    unprotectedHeaders,
    payload,
    keyList
  );

  const deviceSigned: DeviceSigned = {
    nameSpaces: createTag24(new Map()),
    deviceAuth: {
      deviceSignature: [
        encodeCbor(protectedHeaders),
        unprotectedHeaders,
        payload,
        new Uint8Array(
          signature.buffer,
          signature.byteOffset,
          signature.byteLength
        ),
      ],
    },
  };

  return deviceSigned;
};
