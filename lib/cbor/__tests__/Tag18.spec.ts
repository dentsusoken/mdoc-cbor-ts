import { describe, expect, it } from 'vitest';
import { encodeCbor, decodeCbor } from '../codec';
import { Tag18 } from '../Tag18';
import { Tag } from 'cbor-x';

const u8 = (...values: number[]): Uint8Array => new Uint8Array(values);

const sampleTuple = (): [
  Uint8Array,
  Map<number, unknown>,
  Uint8Array,
  Uint8Array,
] => {
  const protectedHeaders = u8(0x01, 0x02); // already-encoded map bytes in real use
  const unprotected = new Map<number, unknown>([[33, [u8(0xaa, 0xbb)]]]); // x5c-like array
  const payload = u8(0x10, 0x20, 0x30);
  const signature = u8(0x9a, 0xbc);
  return [protectedHeaders, unprotected, payload, signature];
};

describe('Tag18', () => {
  describe('constructor', () => {
    it('should create a Tag18 instance from a 4-tuple', () => {
      const tuple = sampleTuple();
      const tag = new Tag18(tuple);
      expect(tag).toBeInstanceOf(Tag18);
      expect(tag.value).toBe(tuple);
      expect(tag.value[0]).toBeInstanceOf(Uint8Array);
      expect(tag.value[1]).toBeInstanceOf(Map);
      expect(tag.value[2]).toBeInstanceOf(Uint8Array);
      expect(tag.value[3]).toBeInstanceOf(Uint8Array);
    });
  });

  describe('CBOR encoding/decoding', () => {
    it('should encode and decode Tag18 correctly', () => {
      const tuple = sampleTuple();
      const original = new Tag18(tuple);
      const encoded = encodeCbor(original);
      const decoded = decodeCbor(encoded) as Tag18;

      expect(decoded).toBeInstanceOf(Tag18);
      const [ph, uh, pl, sig] = decoded.value;
      expect(ph).toEqual(tuple[0]);
      expect(uh).toBeInstanceOf(Map);
      expect(Array.from(uh.entries())).toEqual(Array.from(tuple[1].entries()));
      expect(pl).toEqual(tuple[2]);
      expect(sig).toEqual(tuple[3]);
    });

    it('should handle Tag18 nested in an object', () => {
      const data = { cose: new Tag18(sampleTuple()) };
      const encoded = encodeCbor(data);
      const decoded = decodeCbor(encoded) as Map<string, Tag18>;
      const value = decoded.get('cose') as Tag18;
      expect(value).toBeInstanceOf(Tag18);
      const [ph, uh, pl, sig] = value.value;
      expect(ph).toBeInstanceOf(Uint8Array);
      expect(uh).toBeInstanceOf(Map);
      expect(pl).toBeInstanceOf(Uint8Array);
      expect(sig).toBeInstanceOf(Uint8Array);
    });

    it('should handle Tag18 in arrays', () => {
      const tags = [new Tag18(sampleTuple()), new Tag18(sampleTuple())];
      const encoded = encodeCbor(tags);
      const decoded = decodeCbor(encoded) as Tag18[];
      expect(decoded).toHaveLength(2);
      expect(decoded[0]).toBeInstanceOf(Tag18);
      expect(decoded[1]).toBeInstanceOf(Tag18);
    });

    it('decodes a cbor-x Tag(18) into Tag18', () => {
      const tuple = sampleTuple();
      const encoded = encodeCbor(new Tag(tuple, 18));
      const decoded = decodeCbor(encoded) as Tag18;
      expect(decoded).toBeInstanceOf(Tag18);
      expect(decoded.value).toEqual(tuple);
    });
  });

  describe('edge cases', () => {
    it('should support empty headers and payload/signature', () => {
      const tuple: [Uint8Array, Map<number, unknown>, Uint8Array, Uint8Array] =
        [new Uint8Array(), new Map(), new Uint8Array(), new Uint8Array()];
      const tag = new Tag18(tuple);
      const encoded = encodeCbor(tag);
      const decoded = decodeCbor(encoded) as Tag18;
      const [ph, uh, pl, sig] = decoded.value;
      expect(ph).toEqual(new Uint8Array());
      expect(uh).toBeInstanceOf(Map);
      expect(pl).toEqual(new Uint8Array());
      expect(sig).toEqual(new Uint8Array());
    });
  });
});
