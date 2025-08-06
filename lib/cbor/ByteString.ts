/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypedMap } from '@jfromaniello/typedmap';
import { addExtension } from 'cbor-x';
import { decodeCbor, encodeCbor } from './codec';

export class ByteString<T extends TypedMap<[string, any]>> {
  #data: T;
  #buffer: Uint8Array;

  constructor(data: T) {
    this.#data = data;
    this.#buffer = encodeCbor(this.#data.esMap);
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
  public static fromBuffer<T extends TypedMap<[string, any]>>(
    buffer: Uint8Array
  ): ByteString<T> {
    const data = decodeCbor(buffer) as Map<string, unknown>;
    const map = new TypedMap<[string, unknown]>(data);

    return new ByteString<T>(map as T);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encode: (instance: ByteString<any>, encode) => {
    return encode(instance.buffer);
  },
  decode: (buffer: Uint8Array) => {
    return ByteString.fromBuffer(buffer);
  },
});
