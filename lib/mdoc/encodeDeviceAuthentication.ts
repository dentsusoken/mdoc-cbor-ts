import { encodeCbor } from '@/cbor/codec';
import { createTag24 } from '@/cbor/createTag24';
import { decodeTag24 } from '@/cbor/decodeTag24';
import { isUint8Array } from 'u8a-utils';

/**
 * Parameters for encoding mdoc DeviceAuthentication.
 *
 * @typedef {Object} DeviceAuthenticationParams
 * @property {unknown} sessionTranscript - The session transcript, provided as a CBOR Tag 24 (Uint8Array) or as an already-decoded structure.
 * @property {string} docType - The document type string (docType) as per ISO/IEC 18013-5.
 * @property {Map<string, Map<string, unknown>>} [nameSpaces] - Optional mapping for device nameSpaces.
 *   The outer key represents the namespace string; the inner Map holds data element identifiers and values.
 */
interface DeviceAuthenticationParams {
  sessionTranscript: unknown;
  docType: string;
  nameSpaces?: Map<string, Map<string, unknown>>;
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
  nameSpaces = new Map(),
}: DeviceAuthenticationParams): Uint8Array => {
  return encodeCbor(
    createTag24([
      'DeviceAuthentication',
      decodeSessionTranscript(sessionTranscript),
      docType,
      createTag24(nameSpaces),
    ])
  );
};
