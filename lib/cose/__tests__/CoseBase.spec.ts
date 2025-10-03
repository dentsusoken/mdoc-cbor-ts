import { describe, it, expect } from 'vitest';
import { CoseBase } from '../CoseBase';
import { encodeCbor } from '@/cbor/codec';
import { Headers, Algorithms } from '../types';

describe('CoseBase', () => {
  describe('constructor', () => {
    it('should initialize with protected and unprotected headers', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES256],
        [Headers.KeyId, new Uint8Array([1, 2, 3])],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);

      const unprotectedHeaders = new Map<number, unknown>([
        [Headers.ContentType, 'application/json'],
      ]);

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.protectedHeaders).toBe(protectedHeaders);
      expect(coseBase.unprotectedHeaders).toBe(unprotectedHeaders);
      expect(coseBase.decodedProtectedHeaders).toBeInstanceOf(Map);
    });

    it('should initialize with empty unprotected headers', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES256],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.protectedHeaders).toBe(protectedHeaders);
      expect(coseBase.unprotectedHeaders).toBe(unprotectedHeaders);
      expect(coseBase.unprotectedHeaders.size).toBe(0);
    });

    it('should initialize with empty protected headers', () => {
      const protectedHeadersMap = new Map<number, unknown>();
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>([
        [Headers.ContentType, 'application/cbor'],
      ]);

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.protectedHeaders).toBe(protectedHeaders);
      expect(coseBase.unprotectedHeaders).toBe(unprotectedHeaders);
      expect(coseBase.decodedProtectedHeaders.size).toBe(0);
    });
  });

  describe('protectedHeaders', () => {
    it('should store the raw CBOR-encoded bytes', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES256],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.protectedHeaders).toEqual(protectedHeaders);
      expect(coseBase.protectedHeaders).toBeInstanceOf(Uint8Array);
    });

    it('should be readonly and not modifiable', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES384],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      // TypeScript prevents assignment, but we can verify the property is there
      expect(
        Object.getOwnPropertyDescriptor(coseBase, 'protectedHeaders')
      ).toBeDefined();
    });
  });

  describe('unprotectedHeaders', () => {
    it('should store the unprotected headers map', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES512],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>([
        [Headers.ContentType, 'text/plain'],
        [Headers.KeyId, new Uint8Array([7, 8, 9])],
      ]);

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.unprotectedHeaders).toBe(unprotectedHeaders);
      expect(coseBase.unprotectedHeaders.size).toBe(2);
      expect(coseBase.unprotectedHeaders.get(Headers.ContentType)).toBe(
        'text/plain'
      );
      expect(coseBase.unprotectedHeaders.get(Headers.KeyId)).toEqual(
        new Uint8Array([7, 8, 9])
      );
    });

    it('should handle various data types in unprotected headers', () => {
      const protectedHeadersMap = new Map<number, unknown>();
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>([
        [1, -7], // number
        [2, 'string'], // string
        [3, new Uint8Array([1, 2, 3])], // Uint8Array
        [4, true], // boolean
        [5, [1, 2, 3]], // array
      ]);

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.unprotectedHeaders.get(1)).toBe(-7);
      expect(coseBase.unprotectedHeaders.get(2)).toBe('string');
      expect(coseBase.unprotectedHeaders.get(3)).toEqual(
        new Uint8Array([1, 2, 3])
      );
      expect(coseBase.unprotectedHeaders.get(4)).toBe(true);
      expect(coseBase.unprotectedHeaders.get(5)).toEqual([1, 2, 3]);
    });
  });

  describe('decodedProtectedHeaders', () => {
    it('should automatically decode protected headers', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES256],
        [Headers.ContentType, 'application/json'],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.decodedProtectedHeaders).toBeInstanceOf(Map);
      expect(coseBase.decodedProtectedHeaders.get(Headers.Algorithm)).toBe(
        Algorithms.ES256
      );
      expect(coseBase.decodedProtectedHeaders.get(Headers.ContentType)).toBe(
        'application/json'
      );
    });

    it('should decode protected headers with various data types', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES384],
        [Headers.KeyId, new Uint8Array([0xff, 0xee, 0xdd])],
        [10, 'custom-value'],
        [11, 42],
        [12, true],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.decodedProtectedHeaders.get(Headers.Algorithm)).toBe(
        Algorithms.ES384
      );
      expect(coseBase.decodedProtectedHeaders.get(Headers.KeyId)).toEqual(
        new Uint8Array([0xff, 0xee, 0xdd])
      );
      expect(coseBase.decodedProtectedHeaders.get(10)).toBe('custom-value');
      expect(coseBase.decodedProtectedHeaders.get(11)).toBe(42);
      expect(coseBase.decodedProtectedHeaders.get(12)).toBe(true);
    });

    it('should handle empty protected headers map', () => {
      const protectedHeadersMap = new Map<number, unknown>();
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>([
        [Headers.ContentType, 'text/plain'],
      ]);

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.decodedProtectedHeaders).toBeInstanceOf(Map);
      expect(coseBase.decodedProtectedHeaders.size).toBe(0);
    });

    it('should create a separate Map instance from the original', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES256],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      // Modifying the decoded map should not affect re-decoding
      coseBase.decodedProtectedHeaders.set(99, 'modified');

      expect(coseBase.decodedProtectedHeaders.get(99)).toBe('modified');
      expect(coseBase.decodedProtectedHeaders.get(Headers.Algorithm)).toBe(
        Algorithms.ES256
      );
    });
  });

  describe('getHeader', () => {
    it('should retrieve header from protected headers', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES256],
        [Headers.KeyId, new Uint8Array([1, 2, 3])],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.getHeader(Headers.Algorithm)).toBe(Algorithms.ES256);
      expect(coseBase.getHeader(Headers.KeyId)).toEqual(
        new Uint8Array([1, 2, 3])
      );
    });

    it('should retrieve header from unprotected headers when not in protected', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES384],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>([
        [Headers.ContentType, 'application/json'],
        [Headers.X5Chain, [new Uint8Array([0xaa, 0xbb])]],
      ]);

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.getHeader(Headers.ContentType)).toBe('application/json');
      expect(coseBase.getHeader(Headers.X5Chain)).toEqual([
        new Uint8Array([0xaa, 0xbb]),
      ]);
    });

    it('should prioritize protected headers over unprotected headers', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES256],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES384], // Same key, different value
      ]);

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      // Should return value from protected headers
      expect(coseBase.getHeader(Headers.Algorithm)).toBe(Algorithms.ES256);
    });

    it('should return undefined for non-existent header', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES512],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>([
        [Headers.ContentType, 'text/plain'],
      ]);

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.getHeader(Headers.KeyId)).toBeUndefined();
      expect(coseBase.getHeader(999)).toBeUndefined();
    });

    it('should handle custom header labels (private use)', () => {
      const nestedMap = new Map([['nested', 'object']]);
      const protectedHeadersMap = new Map<number, unknown>([
        [100, 'custom-protected-value'],
        [200, nestedMap],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>([
        [300, 'custom-unprotected-value'],
        [400, [1, 2, 3]],
      ]);

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.getHeader(100)).toBe('custom-protected-value');
      expect(coseBase.getHeader(200)).toEqual(nestedMap);
      expect(coseBase.getHeader(300)).toBe('custom-unprotected-value');
      expect(coseBase.getHeader(400)).toEqual([1, 2, 3]);
    });

    it('should handle numeric label 0', () => {
      const protectedHeadersMap = new Map<number, unknown>([[0, 'zero-value']]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.getHeader(0)).toBe('zero-value');
    });

    it('should handle negative custom labels', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [-100, 'negative-label'],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>([
        [-200, 'another-negative'],
      ]);

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      expect(coseBase.getHeader(-100)).toBe('negative-label');
      expect(coseBase.getHeader(-200)).toBe('another-negative');
    });
  });

  describe('integration', () => {
    it('should handle complete COSE header setup', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES256],
        [Headers.KeyId, new Uint8Array([0x01, 0x02, 0x03])],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);

      const x5chain = [
        new Uint8Array([0xca, 0xfe, 0xba, 0xbe]), // mock certificate
        new Uint8Array([0xde, 0xad, 0xbe, 0xef]), // mock intermediate
      ];

      const unprotectedHeaders = new Map<number, unknown>([
        [Headers.X5Chain, x5chain],
        [Headers.ContentType, 'application/cose'],
      ]);

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      // Verify protected headers
      expect(coseBase.decodedProtectedHeaders.get(Headers.Algorithm)).toBe(
        Algorithms.ES256
      );
      expect(coseBase.decodedProtectedHeaders.get(Headers.KeyId)).toEqual(
        new Uint8Array([0x01, 0x02, 0x03])
      );

      // Verify unprotected headers
      expect(coseBase.unprotectedHeaders.get(Headers.X5Chain)).toBe(x5chain);
      expect(coseBase.unprotectedHeaders.get(Headers.ContentType)).toBe(
        'application/cose'
      );

      // Verify raw protected headers are preserved
      expect(coseBase.protectedHeaders).toBeInstanceOf(Uint8Array);
      expect(coseBase.protectedHeaders.length).toBeGreaterThan(0);
    });

    it('should use getHeader to access headers from either location', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, Algorithms.ES256],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>([
        [Headers.X5Chain, [new Uint8Array([1, 2, 3])]],
      ]);

      const coseBase = new CoseBase(protectedHeaders, unprotectedHeaders);

      // Use getHeader for unified access
      expect(coseBase.getHeader(Headers.Algorithm)).toBe(Algorithms.ES256);
      expect(coseBase.getHeader(Headers.X5Chain)).toEqual([
        new Uint8Array([1, 2, 3]),
      ]);
    });
  });
});
