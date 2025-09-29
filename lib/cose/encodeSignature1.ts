import { encodeCbor } from '@/cbor/codec';

/**
 * Parameters for encoding a COSE Signature1 structure.
 */
type EncodeSignature1Params = {
  /** The protected headers as encoded bytes */
  protectedHeaders: Uint8Array;
  /** The external additional authenticated data as encoded bytes (optional) */
  externalAad?: Uint8Array;
  /** The payload to be signed */
  payload: Uint8Array;
};

/**
 * Encodes a COSE Signature1 structure for signing.
 *
 * @description
 * Creates the "Sig_structure" for COSE_Sign1 as defined in RFC 8152 Section 4.4.
 * This structure is used as input to the signing algorithm and follows the format:
 *
 * ```
 * Sig_structure = [
 *   context: "Signature1",
 *   body_protected: bstr,
 *   external_aad: bstr,
 *   payload: bstr
 * ]
 * ```
 *
 * The resulting CBOR-encoded array serves as the "to-be-signed" data that gets
 * passed to the cryptographic signing function.
 *
 * @param params - The parameters for encoding the signature structure
 * @param params.protectedHeaders - The protected headers as CBOR-encoded bytes
 * @param params.externalAad - The optional external additional authenticated data (AAD)
 * @param params.payload - The payload bytes to be signed
 * @returns The CBOR-encoded Signature1 structure ready for signing
 *
 * @example
 * ```typescript
 * const toBeSigned = encodeSignature1({
 *   protectedHeaders: encodedHeaders,
 *   externalAad: new Uint8Array(), // or undefined
 *   payload: payloadBytes
 * });
 *
 * // Use toBeSigned with your signing algorithm
 * const signature = curve.sign({ privateKey, message: toBeSigned });
 * ```
 *
 * @see {@link https://tools.ietf.org/html/rfc8152#section-4.4} RFC 8152 Section 4.4 - Signing Objects
 */
export const encodeSignature1 = ({
  protectedHeaders,
  externalAad,
  payload,
}: EncodeSignature1Params): Uint8Array => {
  return encodeCbor([
    'Signature1',
    protectedHeaders,
    externalAad ?? new Uint8Array(),
    payload,
  ]);
};
