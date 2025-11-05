import { JwkPrivateKey } from '@/jwk/types';
import { buildDeviceSignature } from './buildDeviceSignature';
import { DeviceSigned } from '@/schemas/mdoc/DeviceSigned';
import { createDeviceAuth } from '@/schemas/mdoc/DeviceAuth';
import { createDeviceSigned } from '@/schemas/mdoc/DeviceSigned';

/**
 * Parameters for constructing the device-signed portion of an mdoc.
 *
 * @typedef {Object} BuildDeviceSignedParams
 * @property {Uint8Array} sessionTranscriptBytes - The CBOR-encoded session transcript (typically Tag 24 wrapped).
 * @property {string} docType - The document type string as defined in ISO/IEC 18013-5.
 * @property {Map<string, Map<string, unknown>>} [nameSpaces] - Optional mapping of namespace identifiers to data element maps. The outer map's key is the namespace, and the value is a map of element identifiers to values.
 * @property {JwkPrivateKey} deviceJwkPrivateKey - The device's private JWK for creating the COSE_Sign1 signature (device signature).
 */
interface BuildDeviceSignedParams {
  sessionTranscriptBytes: Uint8Array;
  docType: string;
  nameSpaces?: Map<string, Map<string, unknown>>;
  deviceJwkPrivateKey: JwkPrivateKey;
}

/**
 * Constructs a device-signed mdoc structure compliant with ISO/IEC 18013-5.
 *
 * Produces a `DeviceSigned` map with:
 *   - "nameSpaces" set to the provided map (can be empty)
 *   - "deviceAuth" containing the device signature as a COSE_Sign1 structure ("deviceSignature")
 *
 * Steps:
 *   1. Builds a COSE_Sign1 signature using {@link buildDeviceSignature}, covering the session transcript, docType, and nameSpaces.
 *   2. Wraps the signature into the DeviceAuth structure as "deviceSignature".
 *   3. Returns a DeviceSigned map containing both the nameSpaces and deviceAuth entries.
 *
 * @param {BuildDeviceSignedParams} params - The parameters required for constructing the DeviceSigned structure.
 * @param {Uint8Array} params.sessionTranscriptBytes - CBOR Tag 24-encoded session transcript.
 * @param {string} params.docType - mdoc document type.
 * @param {Map<string, Map<string, unknown>>} [params.nameSpaces] - NameSpaces map for mdoc.
 * @param {JwkPrivateKey} params.deviceJwkPrivateKey - The device's private signing key (JWK).
 * @returns {DeviceSigned} The constructed DeviceSigned structure for the mdoc.
 *
 * @see {@link buildDeviceSignature}
 * @see {@link createDeviceAuth}
 * @see {@link createDeviceSigned}
 */
export const buildDeviceSigned = ({
  sessionTranscriptBytes,
  docType,
  nameSpaces = new Map(),
  deviceJwkPrivateKey,
}: BuildDeviceSignedParams): DeviceSigned => {
  const deviceSignature = buildDeviceSignature({
    sessionTranscriptBytes,
    docType,
    nameSpaces,
    deviceJwkPrivateKey,
  });
  const deviceAuth = createDeviceAuth([['deviceSignature', deviceSignature]]);

  return createDeviceSigned([
    ['nameSpaces', nameSpaces],
    ['deviceAuth', deviceAuth],
  ]);
};
