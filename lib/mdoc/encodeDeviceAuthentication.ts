import { encodeCbor } from '@/cbor/codec';
import { createTag24 } from '@/cbor/createTag24';
import { decodeTag24 } from '@/cbor/decodeTag24';
import { isUint8Array } from 'u8a-utils';
import { Tag } from 'cbor-x';

/**
 * Parameters for encoding mdoc DeviceAuthentication.
 */
interface DeviceAuthenticationParams {
  /**
   * The session transcript, provided as a CBOR Tag 24 (Uint8Array) or as an already-decoded structure.
   * If provided as Uint8Array, it will be decoded using {@link decodeSessionTranscript}.
   */
  sessionTranscript: Uint8Array | [unknown, unknown, unknown];
  /** The document type string (docType) as per ISO/IEC 18013-5. */
  docType: string;
  /**
   * The device nameSpaces encoded as CBOR Tag 24 (DeviceNameSpacesBytes).
   * This represents the device-signed namespaces wrapped in Tag 24.
   */
  deviceNameSpacesBytes: Tag;
}

/**
 * Decodes the session transcript for mdoc device authentication.
 *
 * @description
 * If the input is a Uint8Array, it is assumed to be a CBOR Tag 24-encoded session transcript
 * and will be decoded using {@link decodeTag24}. Otherwise, the input is returned as-is.
 *
 * @param sessionTranscript - The session transcript provided as a CBOR Tag 24-encoded Uint8Array,
 *   or as a previously-decoded value.
 * @returns The decoded session transcript object or structure.
 *
 * @see {@link decodeTag24}
 */
export const decodeSessionTranscript = (
  sessionTranscript: Uint8Array | [unknown, unknown, unknown]
): [unknown, unknown, unknown] => {
  return isUint8Array(sessionTranscript)
    ? decodeTag24(sessionTranscript)
    : sessionTranscript;
};

/**
 * Encodes a mdoc DeviceAuthentication structure as CBOR Tag 24.
 *
 * @description
 * The encoding follows the ISO/IEC 18013-5 specification:
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
 * - sessionTranscript: CBOR Tag 24-wrapped transcript data (or decoded structure)
 * - docType: Document type string
 * - deviceNameSpacesBytes: Tag 24-wrapped Map mapping namespaces to element identifier/value maps
 *
 * @param params - The structure containing sessionTranscript, docType, and deviceNameSpacesBytes.
 * @param params.sessionTranscript - The session transcript, provided as a CBOR Tag 24 (Uint8Array) or as an already-decoded structure.
 * @param params.docType - The document type string (docType) as per ISO/IEC 18013-5.
 * @param params.deviceNameSpacesBytes - The device nameSpaces encoded as CBOR Tag 24 (DeviceNameSpacesBytes).
 * @returns The CBOR-encoded DeviceAuthentication structure as Tag 24 (Uint8Array).
 *
 * @see {@link createTag24}
 * @see {@link decodeSessionTranscript}
 * @see https://www.iso.org/standard/69084.html (ISO/IEC 18013-5)
 */
export const encodeDeviceAuthentication = ({
  sessionTranscript,
  docType,
  deviceNameSpacesBytes,
}: DeviceAuthenticationParams): Uint8Array => {
  return encodeCbor(
    createTag24([
      'DeviceAuthentication',
      decodeSessionTranscript(sessionTranscript),
      docType,
      deviceNameSpacesBytes,
    ])
  );
};
