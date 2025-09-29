import { Tag } from 'cbor-x';

/**
 * Content structure for CBOR Tag 18 (COSE_Sign1).
 * @description
 * Represents the 4-tuple structure of a COSE_Sign1 message:
 * [protected headers, unprotected headers, payload, signature]
 */
export type Tag18Content = [
  Uint8Array,
  Map<number, unknown>,
  Uint8Array | null,
  Uint8Array,
];

/**
 * Creates a CBOR Tag 18 for a COSE_Sign1 structure
 * @description
 * Produces a Tag(18, array) where the value is a 4-tuple representing a COSE_Sign1 message:
 * [protected headers, unprotected headers, payload, signature].
 * This matches CBOR Tag 18 usage for COSE_Sign1 structures as defined in RFC 8152.
 *
 * @param value - The COSE_Sign1 4-tuple structure to be wrapped in Tag 18
 * @returns A `Tag` instance with `tag === 18` and value as the COSE_Sign1 array
 *
 * @example
 * ```typescript
 * const protectedHeaders = new Uint8Array([0xa1, 0x01, 0x26]);
 * const unprotectedHeaders = new Map([[1, -7]]);
 * const payload = new Uint8Array([1, 2, 3, 4]);
 * const signature = new Uint8Array([0x30, 0x45, ...]);
 *
 * const tag18 = createTag18([protectedHeaders, unprotectedHeaders, payload, signature]);
 * console.log(tag18.tag); // 18
 * console.log(tag18.value); // [Uint8Array, Map, Uint8Array, Uint8Array]
 * ```
 */
export const createTag18 = (value: Tag18Content): Tag => {
  return new Tag(value, 18);
};
