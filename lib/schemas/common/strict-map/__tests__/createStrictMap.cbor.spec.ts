import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { decodeCbor, encodeCbor } from '../../../../cbor/codec';
import { createStrictMap } from '../createStrictMap';

/**
 * Check if CBOR encoded data has Map major type (type 5)
 * @description
 * CBOR major type 5 (Map) is indicated by the upper 3 bits being 101 (0xa0-0xbf)
 * - 0xa0-0xb7: Map with 0-23 entries
 * - 0xb8: Map with 1-byte length
 * - 0xb9: Map with 2-byte length
 * - 0xba: Map with 4-byte length
 * - 0xbb: Map with 8-byte length
 * - 0xbf: Indefinite-length Map
 */
const isCborMap = (encoded: Uint8Array): boolean => {
  return (encoded[0] & 0xe0) === 0xa0;
};

describe('createStrictMap - cbor-x compatibility', () => {
  it('should encode and decode with encodeCbor/decodeCbor (string keys)', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>();
    map.set('name', 'Alice');
    map.set('age', 25);

    // Encode to CBOR
    const encoded = encodeCbor(map);
    expect(encoded).toBeInstanceOf(Uint8Array);

    // Verify CBOR major type is Map (type 5)
    expect(isCborMap(encoded)).toBe(true);

    // Decode from CBOR
    const decoded = decodeCbor(encoded) as Map<string, unknown>;
    expect(decoded).toBeInstanceOf(Map);
    expect(decoded.get('name')).toBe('Alice');
    expect(decoded.get('age')).toBe(25);
  });

  it('should encode and decode with encodeCbor/decodeCbor (number keys)', () => {
    const entries = [
      [1, z.number()], // Algorithm
      [4, z.string()], // Key ID
    ] as const;

    const map = createStrictMap<typeof entries>();
    map.set(1, -7);
    map.set(4, 'key-123');

    // Encode to CBOR
    const encoded = encodeCbor(map);
    expect(encoded).toBeInstanceOf(Uint8Array);

    // Verify CBOR major type is Map (type 5)
    expect(isCborMap(encoded)).toBe(true);

    // Decode from CBOR
    const decoded = decodeCbor(encoded) as Map<number, unknown>;
    expect(decoded).toBeInstanceOf(Map);
    expect(decoded.get(1)).toBe(-7);
    expect(decoded.get(4)).toBe('key-123');
  });

  it('should preserve Map structure through encode/decode cycle', () => {
    const entries = [
      ['x', z.number()],
      ['y', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>();
    map.set('x', 10);
    map.set('y', 20);

    // Encode to CBOR
    const encoded = encodeCbor(map);
    expect(encoded).toBeInstanceOf(Uint8Array);

    // Verify CBOR major type is Map (type 5)
    expect(isCborMap(encoded)).toBe(true);

    // Decode and verify structure is preserved
    const decoded = decodeCbor(encoded) as Map<string, number>;
    expect(decoded).toBeInstanceOf(Map);
    expect(decoded.size).toBe(2);
    expect(decoded.get('x')).toBe(10);
    expect(decoded.get('y')).toBe(20);
  });

  it('should handle empty map', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>();

    // Encode empty map
    const encoded = encodeCbor(map);
    expect(encoded).toBeInstanceOf(Uint8Array);

    // Verify CBOR major type is Map (type 5)
    expect(isCborMap(encoded)).toBe(true);

    // Decode empty map
    const decoded = decodeCbor(encoded) as Map<string, unknown>;
    expect(decoded).toBeInstanceOf(Map);
    expect(decoded.size).toBe(0);
  });

  it('should handle nested structures', () => {
    const entries = [
      ['metadata', z.object({ version: z.number() })],
      ['tags', z.array(z.string())],
    ] as const;

    const map = createStrictMap<typeof entries>();
    map.set('metadata', { version: 1 });
    map.set('tags', ['foo', 'bar']);

    // Encode to CBOR
    const encoded = encodeCbor(map);
    expect(encoded).toBeInstanceOf(Uint8Array);

    // Verify CBOR major type is Map (type 5)
    expect(isCborMap(encoded)).toBe(true);

    // Decode and verify nested structures
    // Note: With mapsAsObjects: false (default), nested objects are decoded as Maps
    const decoded = decodeCbor(encoded) as Map<string, unknown>;
    expect(decoded).toBeInstanceOf(Map);

    const metadata = decoded.get('metadata');
    expect(metadata).toBeInstanceOf(Map);
    expect((metadata as Map<string, number>).get('version')).toBe(1);

    expect(decoded.get('tags')).toEqual(['foo', 'bar']);
  });
});
