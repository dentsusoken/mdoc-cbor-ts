import { Tag } from 'cbor-x';
import { decodeCbor } from './codec';
import { isUint8Array } from 'u8a-utils';

/**
 * Decodes a CBOR Tag 24 value and returns the embedded decoded value.
 *
 * @template T The expected type of the decoded embedded CBOR value.
 * @param {Uint8Array | Tag} value - A CBOR Tag 24, or its CBOR-encoded bytes.
 * @returns {T} The value embedded within the Tag 24, decoded via CBOR.
 * @throws {Error} If the decoded value is not a Tag, or if its tag number is not 24.
 *
 * @example
 * // Encode data in a Tag 24, then decode
 * import { createTag24 } from './createTag24';
 * const tag = createTag24({ foo: 123 });
 * const inner = decodeTag24<{ foo: number }>(tag);
 * // inner = { foo: 123 }
 */
export const decodeTag24 = <T = unknown>(value: Uint8Array | Tag): T => {
  const decoded = isUint8Array(value) ? decodeCbor(value) : value;

  if (!(decoded instanceof Tag)) {
    throw new Error('Decoded value is not a Tag');
  }

  if (decoded.tag !== 24) {
    throw new Error('Tag number is not 24');
  }

  return decodeCbor(decoded.value as Uint8Array) as T;
};
