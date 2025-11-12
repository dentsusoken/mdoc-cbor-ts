import { encodeCbor } from '@/cbor/codec';
import { createTag24 } from '@/cbor/createTag24';
import { Tag } from 'cbor-x';

/**
 * Parameters for encoding mdoc DeviceAuthentication.
 */
interface DeviceAuthenticationParams {
  /**
   * The session transcript for DeviceAuthentication.
   *
   * @description
   * A decoded session transcript tuple (structure): [DeviceEngagementBytes|null, EReaderKeyBytes|null, Handover].
   *
   * Each tuple entry:
   *   [DeviceEngagementBytes: Uint8Array|null, EReaderKeyBytes: Uint8Array|null, Handover: unknown]
   * where entries may be null if absent, per mdoc session transcript specification.
   */
  sessionTranscript: [Uint8Array | null, Uint8Array | null, unknown];
  /** The document type string (docType) as per ISO/IEC 18013-5. */
  docType: string;
  /**
   * The device nameSpaces encoded as CBOR Tag 24 (DeviceNameSpacesBytes).
   * This represents the device-signed namespaces wrapped in Tag 24.
   */
  nameSpacesBytes: Tag;
}

/**
 * Encodes a mdoc DeviceAuthentication structure as CBOR Tag 24 (Tag 24-wrapped array).
 *
 * @description
 * Serializes the mdoc DeviceAuthentication array according to ISO/IEC 18013-5, section 9.1.4.
 * The encoded structure is:
 *
 * ```cddl
 * DeviceAuthentication = [
 *   "DeviceAuthentication",
 *   SessionTranscript,
 *   DocType,
 *   DeviceNameSpacesBytes
 * ]
 * ```
 *
 * - "DeviceAuthentication": Constant string identifier.
 * - SessionTranscript: Tuple structure [DeviceEngagementBytes|null, EReaderKeyBytes|null, Handover].
 * - DocType: Document type string (e.g., "org.iso.18013.5.1.mDL").
 * - DeviceNameSpacesBytes: DeviceNameSpaces, encoded and wrapped as CBOR Tag 24 (see {@link createTag24}).
 *
 * @param params - Object with the following properties:
 * @param params.sessionTranscript The session transcript, as a tuple ([Uint8Array|null, Uint8Array|null, unknown]).
 * @param params.docType The mdoc document type string.
 * @param params.nameSpacesBytes The device nameSpaces, encoded as CBOR Tag 24 (contains a Map mapping NameSpaces to DeviceSignedItems).
 * @returns Uint8Array representing the Tag 24-wrapped DeviceAuthentication structure.
 *
 * @see {@link createTag24}
 * @see {@link decodeTag24} - Use this to decode a Tag 24-encoded session transcript if needed
 * @see https://www.iso.org/standard/69084.html (ISO/IEC 18013-5)
 *
 * @example
 * ```typescript
 * const sessionTranscript: [Uint8Array | null, Uint8Array | null, unknown] = [null, null, {}];
 * const docType = "org.iso.18013.5.1.mDL";
 * const nameSpacesBytes = createTag24(new Map([["org.iso.18013.5.1", new Map([["claim", 42]])]]));
 * const encoded = encodeDeviceAuthentication({
 *   sessionTranscript,
 *   docType,
 *   nameSpacesBytes,
 * });
 * ```
 */
export const encodeDeviceAuthentication = ({
  sessionTranscript,
  docType,
  nameSpacesBytes,
}: DeviceAuthenticationParams): Uint8Array => {
  return encodeCbor(
    createTag24([
      'DeviceAuthentication',
      sessionTranscript,
      docType,
      nameSpacesBytes,
    ])
  );
};
