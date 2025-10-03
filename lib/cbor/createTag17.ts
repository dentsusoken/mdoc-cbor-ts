import { Tag } from 'cbor-x';

/**
 * Content structure for CBOR Tag 17 (COSE_Mac0).
 * @description
 * Represents the 4-tuple structure of a COSE_Mac0 message:
 * [protected headers, unprotected headers, payload, tag]
 */
export type Tag17Content = [
  Uint8Array,
  Map<number, unknown>,
  Uint8Array | null,
  Uint8Array,
];

/**
 * Creates a CBOR Tag 17 for a COSE_Mac0 structure.
 * @description
 * Produces a Tag(17, array) where the value is a 4-tuple representing a COSE_Mac0 message:
 * [protected headers, unprotected headers, payload, tag].
 * This matches CBOR Tag 17 usage for COSE_Mac0 structures as defined in RFC 8152.
 *
 * @param value - The COSE_Mac0 4-tuple structure to be wrapped in Tag 17
 * @returns A `Tag` instance with `tag === 17` and value as the COSE_Mac0 array
 *
 * @example
 * ```typescript
 * const protectedHeaders = new Uint8Array([0xa1, 0x01, 0x26]);
 * const unprotectedHeaders = new Map([[1, 5]]);
 * const payload = new Uint8Array([1, 2, 3, 4]);
 * const tag = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
 *
 * const tag17 = createTag17([protectedHeaders, unprotectedHeaders, payload, tag]);
 * console.log(tag17.tag); // 17
 * console.log(tag17.value); // [Uint8Array, Map, Uint8Array, Uint8Array]
 * ```
 */
export const createTag17 = (value: Tag17Content): Tag => {
  return new Tag(value, 17);
};
