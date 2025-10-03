import { encodeCbor } from '@/cbor/codec';

/**
 * Encodes a COSE MAC0 structure for message authentication.
 *
 * @description
 * Creates the "ToMac_structure" for COSE_Mac0 as defined in RFC 8152 Section 5.3.
 * This structure is used as input to the MAC algorithm and follows the format:
 *
 * ```
 * ToMac_structure = [
 *   context: "MAC0",
 *   body_protected: bstr,
 *   external_aad: bstr,
 *   payload: bstr
 * ]
 * ```
 *
 * The resulting CBOR-encoded array serves as the "to-be-mac'd" data that gets
 * passed to the cryptographic MAC function.
 *
 * @param params - The parameters for encoding the MAC0 structure
 * @param params.protectedHeaders - The protected headers as CBOR-encoded bytes
 * @param params.externalAad - The optional external additional authenticated data (AAD)
 * @param params.payload - The payload bytes to be authenticated
 * @returns The CBOR-encoded MAC0 structure ready for MAC computation
 *
 * @example
 * ```typescript
 * const toBeMACed = encodeMAC0({
 *   protectedHeaders: encodedHeaders,
 *   externalAad: new Uint8Array(), // or undefined
 *   payload: payloadBytes
 * });
 *
 * // Use toBeMACed with your MAC algorithm
 * const mac = macAlgorithm.sign({ key, message: toBeMACed });
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc8152#section-5.3} RFC 8152 Section 5.3 - MACed Data
 */
type EncodeMAC0Params = {
  /** The protected headers as encoded bytes */
  protectedHeaders: Uint8Array;
  /** The external additional authenticated data as encoded bytes (optional) */
  externalAad?: Uint8Array;
  /** The payload to be authenticated */
  payload: Uint8Array;
};

/**
 * Encodes the ToMac_structure for COSE_Mac0.
 *
 * @param params - The parameters for encoding the MAC0 structure
 * @returns The CBOR-encoded ToMac_structure array
 */
export const encodeMAC0 = ({
  protectedHeaders,
  externalAad,
  payload,
}: EncodeMAC0Params): Uint8Array => {
  return encodeCbor([
    'MAC0',
    protectedHeaders,
    externalAad ?? new Uint8Array(),
    payload,
  ]);
};
