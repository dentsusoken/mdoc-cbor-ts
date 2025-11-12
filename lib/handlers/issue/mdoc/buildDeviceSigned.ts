import { JwkPrivateKey } from '@/jwk/types';
import { buildDeviceSignature } from './buildDeviceSignature';
import { DeviceSigned } from '@/schemas/mdoc/DeviceSigned';
import { createDeviceAuth } from '@/schemas/mdoc/DeviceAuth';
import { createDeviceSigned } from '@/schemas/mdoc/DeviceSigned';
import { SessionTranscript } from '@/mdoc/types';
import { Tag } from 'cbor-x';

/**
 * Parameters for building a DeviceSigned structure for mdoc.
 */
interface BuildDeviceSignedParams {
  /**
   * The session transcript tuple structure for DeviceAuthentication.
   *
   * @description
   * A tuple structure: [DeviceEngagementBytes|null, EReaderKeyBytes|null, Handover].
   * Each entry may be null if absent, per mdoc session transcript specification.
   *
   * @see {@link SessionTranscript}
   */
  sessionTranscript: SessionTranscript;
  /** The document type string (docType) as per ISO/IEC 18013-5. */
  docType: string;
  /**
   * The device nameSpaces encoded as CBOR Tag 24 (DeviceNameSpacesBytes).
   * This represents the device-signed namespaces wrapped in Tag 24.
   *
   * @see {@link createTag24}
   */
  deviceNameSpacesBytes: Tag;
  /** The device's private JWK for signing the DeviceAuthentication. */
  deviceJwkPrivateKey: JwkPrivateKey;
}

/**
 * Builds a DeviceSigned structure for mdoc.
 *
 * @description
 * Constructs a complete DeviceSigned structure, which includes both the device-signed namespaces
 * and the device authentication (DeviceAuth). This function orchestrates the creation of:
 * 1. A device signature via {@link buildDeviceSignature}
 * 2. A DeviceAuth container containing the device signature
 * 3. A DeviceSigned structure combining nameSpaces and deviceAuth
 *
 * The resulting structure adheres to ISO/IEC 18013-5 specifications for mdoc device-signed data.
 *
 * @param params - The parameters for constructing the DeviceSigned structure.
 * @param params.sessionTranscript The session transcript tuple structure for DeviceAuthentication.
 * @param params.docType The mdoc document type string.
 * @param params.deviceNameSpacesBytes The device nameSpaces, encoded as CBOR Tag 24.
 * @param params.deviceJwkPrivateKey The device's private JWK (EC, P-256, etc) for signing.
 * @returns The complete DeviceSigned structure containing nameSpaces and deviceAuth.
 *
 * @see {@link buildDeviceSignature}
 * @see {@link createDeviceAuth}
 * @see {@link createDeviceSigned}
 * @see {@link SessionTranscript}
 * @see https://www.iso.org/standard/69084.html (ISO/IEC 18013-5)
 *
 * @example
 * ```typescript
 * const sessionTranscript: SessionTranscript = [null, null, handoverData];
 * const docType = "org.iso.18013.5.1.mDL";
 * const deviceNameSpacesBytes = createTag24(new Map([["org.iso.18013.5.1", new Map([["claim", 42]])]]));
 * const deviceSigned = buildDeviceSigned({
 *   sessionTranscript,
 *   docType,
 *   deviceNameSpacesBytes,
 *   deviceJwkPrivateKey,
 * });
 * ```
 */
export const buildDeviceSigned = ({
  sessionTranscript,
  docType,
  deviceNameSpacesBytes,
  deviceJwkPrivateKey,
}: BuildDeviceSignedParams): DeviceSigned => {
  const deviceSignature = buildDeviceSignature({
    sessionTranscript,
    docType,
    deviceNameSpacesBytes,
    deviceJwkPrivateKey,
  });
  const deviceAuth = createDeviceAuth([['deviceSignature', deviceSignature]]);

  return createDeviceSigned([
    ['nameSpaces', deviceNameSpacesBytes],
    ['deviceAuth', deviceAuth],
  ]);
};
