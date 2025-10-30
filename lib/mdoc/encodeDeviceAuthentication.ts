import { encodeCbor } from '@/cbor/codec';
import { createTag24 } from '@/cbor/createTag24';
import { decodeTag24 } from '@/cbor/decodeTag24';
import { Tag } from 'cbor-x';
import { isUint8Array } from 'u8a-utils';

/**
 * Parameters for encoding the DeviceAuthentication structure.
 */
interface DeviceAuthenticationParams {
  /**
   * The session transcript, either as a CBOR Tag 24 (Uint8Array) or already-decoded structure.
   */
  sessionTranscript: unknown;
  /**
   * The document type (docType) string.
   */
  docType: string;
  /**
   * The nameSpaces object as a nested mapping.
   * Outer key: name space string; inner keys: element identifiers and values.
   */
  nameSpaces: Record<string, Record<string, unknown>>;
}

/**
 * Decodes the session transcript if it is a CBOR Tag 24 encoded as Uint8Array.
 * If already decoded, returns as-is.
 *
 * @param sessionTranscript - The session transcript, either Uint8Array or decoded value.
 * @returns The decoded sessionTranscript value.
 */
export const decodeSessionTranscript = (
  sessionTranscript: unknown
): unknown => {
  return isUint8Array(sessionTranscript)
    ? decodeTag24(sessionTranscript)
    : sessionTranscript;
};

/**
 * Converts a nameSpaces object to a CBOR Tag 24 wrapping a Map-of-Maps structure.
 *
 * @param nameSpaces - The nameSpaces object (outer mapping of namespace to elements).
 * @returns A Tag 24 instance suitable for inclusion in CBOR-encoded DeviceAuthentication.
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
 * Encodes the DeviceAuthentication structure into a CBOR Tag 24, following the
 * expected format for device authentication in mDL/mDoc.
 *
 * @param params - The parameters containing sessionTranscript, docType, and nameSpaces.
 * @returns A Uint8Array containing the CBOR-encoded DeviceAuthentication as Tag 24.
 */
export const encodeDeviceAuthentication = ({
  sessionTranscript,
  docType,
  nameSpaces,
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
