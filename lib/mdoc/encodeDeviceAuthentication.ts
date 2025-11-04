import { encodeCbor } from '@/cbor/codec';
import { createTag24 } from '@/cbor/createTag24';
import { decodeTag24 } from '@/cbor/decodeTag24';
import { Tag } from 'cbor-x';
import { isUint8Array } from 'u8a-utils';

/**
 * Parameters for encoding a mdoc DeviceAuthentication structure.
 *
 * @property sessionTranscript
 *   The session transcript, provided either as a CBOR Tag 24-encoded Uint8Array (as per ISO/IEC 18013-5)
 *   or as a decoded session transcript structure. This represents the cryptographically bound
 *   session data exchanged between device and reader.
 *
 * @property docType
 *   The document type string (docType), e.g., 'org.iso.18013.5.1.mDL'.
 *
 * @property nameSpaces
 *   (Optional) An object mapping namespace strings to their device-signed attribute maps.
 *   Keys are namespace names; values are objects whose key/value entries represent
 *   attribute identifiers and their associated values under device control.
 */
interface DeviceAuthenticationParams {
  /**
   * The session transcript, as CBOR Tag 24 (Uint8Array) or already-decoded structure.
   */
  sessionTranscript: unknown;
  /**
   * The document type (docType) string.
   */
  docType: string;
  /**
   * The device nameSpaces mapping (optional).
   * Outer key: namespace string; inner keys: attribute identifiers and values.
   */
  nameSpaces?: Record<string, Record<string, unknown>>;
}

/**
 * Decodes the session transcript for mdoc device authentication.
 *
 * @param sessionTranscript - The session transcript provided as a CBOR Tag 24-encoded Uint8Array,
 *   or as a previously-decoded value.
 * @returns The decoded session transcript object or structure.
 *
 * If the input is a Uint8Array, it is CBOR-decoded (removing the Tag 24 wrapper).
 * Otherwise, the input is returned as-is.
 */
export const decodeSessionTranscript = (
  sessionTranscript: unknown
): unknown => {
  return isUint8Array(sessionTranscript)
    ? decodeTag24(sessionTranscript)
    : sessionTranscript;
};

/**
 * Converts a device nameSpaces mapping to a CBOR Tag 24-wrapped Map-of-Maps.
 *
 * @param nameSpaces - An object mapping namespace strings to device element attribute maps.
 *   The outer object key is the namespace; each value is an object whose key/value entries
 *   are DataElementIdentifier/DataElementValue pairs.
 * @returns A Tag 24 instance wrapping a Map<string, Map<string, unknown>> suitable for embedding in DeviceAuthentication.
 */
export const toNameSpacesTag = (
  nameSpaces: Record<string, Record<string, unknown>>
): Tag => {
  const nameSpacesAsMap = new Map(
    Object.entries(nameSpaces).map(([ns, items]) => [
      ns,
      new Map(Object.entries(items)),
    ])
  );
  return createTag24(nameSpacesAsMap);
};

/**
 * Encodes a mdoc DeviceAuthentication structure as CBOR Tag 24.
 *
 * The encoding follows the ISO/IEC 18013-5 specification:
 *
 * ```
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
 * - nameSpaces: Tag 24-wrapped Map mapping namespaces to element identifier/value maps
 *
 * @param params - The structure containing sessionTranscript, docType, and optionally nameSpaces.
 * @returns The CBOR-encoded DeviceAuthentication structure as Tag 24 (Uint8Array).
 *
 * @see https://www.iso.org/standard/69084.html (ISO/IEC 18013-5)
 */
export const encodeDeviceAuthentication = ({
  sessionTranscript,
  docType,
  nameSpaces = {},
}: DeviceAuthenticationParams): Uint8Array => {
  return encodeCbor(
    createTag24([
      'DeviceAuthentication',
      decodeSessionTranscript(sessionTranscript),
      docType,
      toNameSpacesTag(nameSpaces),
    ])
  );
};
