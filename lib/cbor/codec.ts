import { Decoder, Encoder, Options } from 'cbor-x';

/**
 * Extended options for CBOR encoding/decoding
 * @description
 * Extends the base CBOR options with additional MDOC-specific configurations.
 * This type adds support for custom map handling options.
 *
 * @template Options - Base CBOR options from cbor-x library
 */
export type AdvancedOptions = Options & {
  useTag259ForMaps?: boolean;
};

/**
 * Default options for CBOR encoding/decoding
 * @description
 * Configuration options that ensure compatibility with the MDOC specification.
 * These defaults are optimized for MDOC data structures and requirements.
 *
 * @example
 * ```typescript
 * const customOptions = {
 *   ...defaultOptions,
 *   useTag259ForMaps: true
 * };
 * ```
 */
export const defaultOptions: AdvancedOptions = {
  tagUint8Array: false,
  useRecords: false,
  mapsAsObjects: false,
  useTag259ForMaps: false,
  variableMapSize: true,
  structuredClone: false,
};

/**
 * Encodes data to CBOR format
 * @description
 * Converts JavaScript data structures to CBOR-encoded binary data.
 * Uses default options that ensure compatibility with the MDOC specification.
 * Additional options can be provided to override defaults for specific use cases.
 *
 * @param input - The data to encode (any JavaScript value)
 * @param additionalOptions - Optional encoding options to override defaults
 * @returns A Uint8Array containing the CBOR-encoded data
 *
 * @example
 * ```typescript
 * const data = { name: "John", age: 30 };
 * const encoded = encodeCbor(data);
 *
 * // With custom options
 * const encodedWithOptions = encodeCbor(data, { useTag259ForMaps: true });
 * ```
 */
export const encodeCbor = (
  input: unknown,
  additionalOptions: AdvancedOptions = {}
): Uint8Array => {
  const options = { ...defaultOptions, ...additionalOptions };
  const encoder = new Encoder(options);
  const buffer = encoder.encode(input);

  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};

/**
 * Decodes CBOR data to JavaScript values
 * @description
 * Converts CBOR-encoded binary data back to JavaScript data structures.
 * Uses default options that ensure compatibility with the MDOC specification.
 * Additional options can be provided to override defaults for specific use cases.
 *
 * @param obj - The CBOR-encoded data to decode (Uint8Array)
 * @param additionalOptions - Optional decoding options to override defaults
 * @returns The decoded JavaScript value
 *
 * @example
 * ```typescript
 * const encoded = new Uint8Array([...]); // CBOR-encoded data
 * const decoded = decodeCbor(encoded);
 *
 * // With custom options
 * const decodedWithOptions = decodeCbor(encoded, { useTag259ForMaps: true });
 * ```
 */
export const decodeCbor = (
  obj: Uint8Array,
  additionalOptions: AdvancedOptions = {}
): unknown => {
  const options = { ...defaultOptions, ...additionalOptions };
  const decoder = new Decoder(options);

  return decoder.decode(obj);
};
