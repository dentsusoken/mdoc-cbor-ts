import { TypedMap } from '@jfromaniello/typedmap';
import { addExtension } from 'cbor-x';
import { KVMap } from '../types';
import { decode, encode } from './index';

/**
 * Class representing a CBOR byte string
 * @description
 * A class that wraps data and its CBOR-encoded buffer representation.
 * This class is used for CBOR encoding/decoding of byte strings with tag 24.
 *
 * @example
 * ```typescript
 * const data = { key: 'value' };
 * const byteString = new ByteString(data);
 * console.log(byteString.buffer); // Uint8Array containing CBOR-encoded data
 * ```
 */
export class ByteString<T extends TypedMap<KVMap<any>>> {
  #data: T;
  #buffer: Uint8Array;

  /**
   * Creates a new ByteString instance
   * @param data - The data to be encoded as a byte string
   */
  constructor(data: T) {
    this.#data = data;
    this.#buffer = encode(this.#data.esMap);
  }

  /**
   * Gets the original data
   * @returns The original data of type T
   */
  public get data(): T {
    return this.#data;
  }

  /**
   * Gets the CBOR-encoded buffer
   * @returns The Uint8Array containing the CBOR-encoded data
   */
  public get buffer(): Uint8Array {
    return this.#buffer;
  }

  /**
   * Creates a ByteString instance from a buffer
   * @param buffer - The Uint8Array containing CBOR-encoded data
   * @returns A new ByteString instance containing the decoded data
   */
  public static fromBuffer(buffer: Uint8Array): ByteString<any> {
    const map = decode(buffer) as Map<any, any>;
    const tMap = new TypedMap<[any, any]>(map);
    return new ByteString(tMap);
  }
}

/**
 * CBOR extension for ByteString values
 * @description
 * Registers a CBOR extension for ByteString values with tag 24.
 * The extension handles encoding and decoding of byte strings.
 */
addExtension({
  Class: ByteString,
  tag: 24,
  encode: (instance: ByteString<any>, encode) => {
    return encode(instance.buffer);
  },
  decode: (buffer: Uint8Array) => {
    return ByteString.fromBuffer(buffer);
  },
});
