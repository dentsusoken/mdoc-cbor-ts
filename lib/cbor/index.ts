import { Decoder, Encoder, Options } from 'cbor-x';

export * from './ByteString';
export * from './DateOnly';
export * from './DateTime';

/**
 * Default options for CBOR encoding
 * @description
 * Configuration options for the CBOR encoder that ensure compatibility
 * with the MDOC specification.
 */
const encoderDefaults: Options = {
  tagUint8Array: false,
  useRecords: false,
  mapsAsObjects: true,
  // @ts-ignore
  useTag259ForMaps: false,
};

/**
 * Encodes data to CBOR format
 * @description
 * Converts JavaScript data structures to CBOR-encoded binary data.
 * Uses default options that ensure compatibility with the MDOC specification.
 *
 * @param input - The data to encode
 * @param options - Optional encoding options to override defaults
 * @returns A Buffer containing the CBOR-encoded data
 */
export const encode = (
  input: unknown,
  options: Options = encoderDefaults
): Buffer => {
  const params = { ...encoderDefaults, ...options };
  const enc = new Encoder(params);
  return enc.encode(input);
};

/**
 * Decodes CBOR data to JavaScript values
 * @description
 * Converts CBOR-encoded binary data back to JavaScript data structures.
 * Uses default options that ensure compatibility with the MDOC specification.
 *
 * @param obj - The CBOR-encoded data to decode
 * @param options - Optional decoding options to override defaults
 * @returns The decoded JavaScript value
 */
export const decode = (
  obj: Uint8Array | Buffer,
  options: Options = encoderDefaults
): unknown => {
  const params = { ...encoderDefaults, ...options };
  const dec = new Decoder(params);
  return dec.decode(obj);
};
