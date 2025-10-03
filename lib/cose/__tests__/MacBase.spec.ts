import { describe, it, expect } from 'vitest';
import { MacBase } from '../MacBase';
import { Headers, MacAlgorithms } from '../types';
import { encodeCbor } from '@/cbor/codec';
import { generateHmac } from '@/utils/generateHmac';
import { randomBytes } from '@noble/hashes/utils';
import { generateJwkOctKey } from '@/jwk/generateJwkOctKey';
import { JwkMacAlgorithms } from '@/jwk/types';

describe('MacBase', () => {
  describe('constructor', () => {
    it('should initialize with protected headers, unprotected headers, and tag', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, MacAlgorithms.HS256],
        [Headers.KeyId, new Uint8Array([1, 2, 3])],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);

      const unprotectedHeaders = new Map<number, unknown>([
        [Headers.ContentType, 'application/json'],
      ]);

      const tag = new Uint8Array(32); // 32 bytes for HS256

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      expect(macBase.protectedHeaders).toBe(protectedHeaders);
      expect(macBase.unprotectedHeaders).toBe(unprotectedHeaders);
      expect(macBase.tag).toBe(tag);
      expect(macBase.decodedProtectedHeaders).toBeInstanceOf(Map);
    });

    it('should initialize with empty unprotected headers', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, MacAlgorithms.HS384],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();
      const tag = new Uint8Array(48); // 48 bytes for HS384

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      expect(macBase.protectedHeaders).toBe(protectedHeaders);
      expect(macBase.unprotectedHeaders).toBe(unprotectedHeaders);
      expect(macBase.unprotectedHeaders.size).toBe(0);
      expect(macBase.tag).toBe(tag);
    });

    it('should properly extend CoseBase', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, MacAlgorithms.HS512],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();
      const tag = new Uint8Array(64); // 64 bytes for HS512

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      // Should have CoseBase functionality
      expect(macBase.getHeader(Headers.Algorithm)).toBe(MacAlgorithms.HS512);
    });
  });

  describe('tag property', () => {
    it('should store the MAC tag bytes', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, MacAlgorithms.HS256],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();
      const tag = new Uint8Array([
        0x3a, 0x5f, 0x1c, 0x89, 0x4e, 0x2f, 0x67, 0x8b, 0xcd, 0x12, 0x34, 0x56,
        0x78, 0x9a, 0xbc, 0xde, 0xf0, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77,
        0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff,
      ]);

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      expect(macBase.tag).toEqual(tag);
      expect(macBase.tag).toBeInstanceOf(Uint8Array);
      expect(macBase.tag.length).toBe(32);
    });

    it('should be readonly and not modifiable', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, MacAlgorithms.HS256],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();
      const tag = new Uint8Array(32);

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      // TypeScript prevents assignment, but we can verify the property is there
      expect(Object.getOwnPropertyDescriptor(macBase, 'tag')).toBeDefined();
    });

    it('should handle different tag lengths for different algorithms', () => {
      const algorithms = [
        { alg: MacAlgorithms.HS256, length: 32 },
        { alg: MacAlgorithms.HS384, length: 48 },
        { alg: MacAlgorithms.HS512, length: 64 },
      ];

      algorithms.forEach(({ alg, length }) => {
        const protectedHeadersMap = new Map<number, unknown>([
          [Headers.Algorithm, alg],
        ]);
        const protectedHeaders = encodeCbor(protectedHeadersMap);
        const tag = new Uint8Array(length);

        const macBase = new MacBase(
          protectedHeaders,
          new Map<number, unknown>(),
          tag
        );

        expect(macBase.tag.length).toBe(length);
      });
    });
  });

  describe('macAlgorithm getter', () => {
    it('should return HS256 from protected headers', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, MacAlgorithms.HS256],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();
      const tag = new Uint8Array(32);

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      expect(macBase.macAlgorithm).toBe(MacAlgorithms.HS256);
    });

    it('should return HS384 from protected headers', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, MacAlgorithms.HS384],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();
      const tag = new Uint8Array(48);

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      expect(macBase.macAlgorithm).toBe(MacAlgorithms.HS384);
    });

    it('should return HS512 from protected headers', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, MacAlgorithms.HS512],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();
      const tag = new Uint8Array(64);

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      expect(macBase.macAlgorithm).toBe(MacAlgorithms.HS512);
    });

    it('should return MAC algorithm from unprotected headers when not in protected', () => {
      const protectedHeadersMap = new Map<number, unknown>();
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>([
        [Headers.Algorithm, MacAlgorithms.HS256],
      ]);
      const tag = new Uint8Array(32);

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      expect(macBase.macAlgorithm).toBe(MacAlgorithms.HS256);
    });

    it('should prioritize protected headers over unprotected headers', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, MacAlgorithms.HS256],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>([
        [Headers.Algorithm, MacAlgorithms.HS384], // Different value
      ]);
      const tag = new Uint8Array(32);

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      // Should return value from protected headers
      expect(macBase.macAlgorithm).toBe(MacAlgorithms.HS256);
    });

    it('should throw error for missing algorithm header', () => {
      const protectedHeadersMap = new Map<number, unknown>();
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();
      const tag = new Uint8Array(32);

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      expect(() => macBase.macAlgorithm).toThrowError(
        'Invalid MAC algorithm: undefined'
      );
    });

    it('should throw error for invalid MAC algorithm (signature algorithm)', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, -7], // ES256 (signature algorithm, not MAC)
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();
      const tag = new Uint8Array(32);

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      expect(() => macBase.macAlgorithm).toThrowError(
        'Invalid MAC algorithm: -7'
      );
    });

    it('should throw error for invalid MAC algorithm (random number)', () => {
      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, 999],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);
      const unprotectedHeaders = new Map<number, unknown>();
      const tag = new Uint8Array(32);

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      expect(() => macBase.macAlgorithm).toThrowError(
        'Invalid MAC algorithm: 999'
      );
    });
  });

  describe('internalVerify', () => {
    describe('HS256', () => {
      it('should return true for valid MAC with HS256', () => {
        const key = randomBytes(32); // 256-bit key
        const message = new Uint8Array([1, 2, 3, 4, 5]);

        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS256,
          k: key,
        });

        const tag = generateHmac({
          digestAlgorithm: 'SHA-256',
          key,
          message,
        });

        const protectedHeadersMap = new Map<number, unknown>([
          [Headers.Algorithm, MacAlgorithms.HS256],
        ]);
        const protectedHeaders = encodeCbor(protectedHeadersMap);
        const unprotectedHeaders = new Map<number, unknown>();

        const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

        const isValid = macBase.internalVerify({
          jwkOctKey,
          toBeMaced: message,
        });

        expect(isValid).toBe(true);
      });

      it('should return false for invalid MAC with HS256 (wrong key)', () => {
        const key = randomBytes(32);
        const wrongKey = randomBytes(32);
        const message = new Uint8Array([1, 2, 3, 4, 5]);

        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS256,
          k: wrongKey,
        });

        const tag = generateHmac({
          digestAlgorithm: 'SHA-256',
          key,
          message,
        });

        const protectedHeadersMap = new Map<number, unknown>([
          [Headers.Algorithm, MacAlgorithms.HS256],
        ]);
        const protectedHeaders = encodeCbor(protectedHeadersMap);
        const unprotectedHeaders = new Map<number, unknown>();

        const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

        const isValid = macBase.internalVerify({
          jwkOctKey,
          toBeMaced: message,
        });

        expect(isValid).toBe(false);
      });

      it('should return false for invalid MAC with HS256 (wrong message)', () => {
        const key = randomBytes(32);
        const message = new Uint8Array([1, 2, 3, 4, 5]);
        const wrongMessage = new Uint8Array([1, 2, 3, 4, 6]); // Different

        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS256,
          k: key,
        });

        const tag = generateHmac({
          digestAlgorithm: 'SHA-256',
          key,
          message,
        });

        const protectedHeadersMap = new Map<number, unknown>([
          [Headers.Algorithm, MacAlgorithms.HS256],
        ]);
        const protectedHeaders = encodeCbor(protectedHeadersMap);
        const unprotectedHeaders = new Map<number, unknown>();

        const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

        const isValid = macBase.internalVerify({
          jwkOctKey,
          toBeMaced: wrongMessage,
        });

        expect(isValid).toBe(false);
      });
    });

    describe('HS384', () => {
      it('should return true for valid MAC with HS384', () => {
        const key = randomBytes(48); // 384-bit key
        const message = new Uint8Array([10, 20, 30, 40]);

        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS384,
          k: key,
        });

        const tag = generateHmac({
          digestAlgorithm: 'SHA-384',
          key,
          message,
        });

        const protectedHeadersMap = new Map<number, unknown>([
          [Headers.Algorithm, MacAlgorithms.HS384],
        ]);
        const protectedHeaders = encodeCbor(protectedHeadersMap);
        const unprotectedHeaders = new Map<number, unknown>();

        const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

        const isValid = macBase.internalVerify({
          jwkOctKey,
          toBeMaced: message,
        });

        expect(isValid).toBe(true);
      });

      it('should return false for invalid MAC with HS384', () => {
        const key = randomBytes(48);
        const wrongKey = randomBytes(48);
        const message = new Uint8Array([10, 20, 30, 40]);

        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS384,
          k: wrongKey,
        });

        const tag = generateHmac({
          digestAlgorithm: 'SHA-384',
          key,
          message,
        });

        const protectedHeadersMap = new Map<number, unknown>([
          [Headers.Algorithm, MacAlgorithms.HS384],
        ]);
        const protectedHeaders = encodeCbor(protectedHeadersMap);
        const unprotectedHeaders = new Map<number, unknown>();

        const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

        const isValid = macBase.internalVerify({
          jwkOctKey,
          toBeMaced: message,
        });

        expect(isValid).toBe(false);
      });
    });

    describe('HS512', () => {
      it('should return true for valid MAC with HS512', () => {
        const key = randomBytes(64); // 512-bit key
        const message = new Uint8Array([0xff, 0xee, 0xdd, 0xcc]);

        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS512,
          k: key,
        });

        const tag = generateHmac({
          digestAlgorithm: 'SHA-512',
          key,
          message,
        });

        const protectedHeadersMap = new Map<number, unknown>([
          [Headers.Algorithm, MacAlgorithms.HS512],
        ]);
        const protectedHeaders = encodeCbor(protectedHeadersMap);
        const unprotectedHeaders = new Map<number, unknown>();

        const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

        const isValid = macBase.internalVerify({
          jwkOctKey,
          toBeMaced: message,
        });

        expect(isValid).toBe(true);
      });

      it('should return false for invalid MAC with HS512', () => {
        const key = randomBytes(64);
        const wrongKey = randomBytes(64);
        const message = new Uint8Array([0xff, 0xee, 0xdd, 0xcc]);

        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS512,
          k: wrongKey,
        });

        const tag = generateHmac({
          digestAlgorithm: 'SHA-512',
          key,
          message,
        });

        const protectedHeadersMap = new Map<number, unknown>([
          [Headers.Algorithm, MacAlgorithms.HS512],
        ]);
        const protectedHeaders = encodeCbor(protectedHeadersMap);
        const unprotectedHeaders = new Map<number, unknown>();

        const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

        const isValid = macBase.internalVerify({
          jwkOctKey,
          toBeMaced: message,
        });

        expect(isValid).toBe(false);
      });
    });

    describe('algorithm mismatch', () => {
      it('should throw error when JWK algorithm does not match COSE algorithm (HS256 vs HS384)', () => {
        const key = randomBytes(32);
        const message = new Uint8Array([1, 2, 3, 4, 5]);

        // JWK has HS384
        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS384,
          k: key,
        });

        const tag = generateHmac({
          digestAlgorithm: 'SHA-256',
          key,
          message,
        });

        // COSE header has HS256
        const protectedHeadersMap = new Map<number, unknown>([
          [Headers.Algorithm, MacAlgorithms.HS256],
        ]);
        const protectedHeaders = encodeCbor(protectedHeadersMap);
        const unprotectedHeaders = new Map<number, unknown>();

        const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

        expect(() =>
          macBase.internalVerify({
            jwkOctKey,
            toBeMaced: message,
          })
        ).toThrowError('Algorithm mismatch: expected HS256, got HS384');
      });

      it('should throw error when JWK algorithm does not match COSE algorithm (HS512 vs HS256)', () => {
        const key = randomBytes(64);
        const message = new Uint8Array([1, 2, 3]);

        // JWK has HS256
        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS256,
          k: key,
        });

        const tag = generateHmac({
          digestAlgorithm: 'SHA-512',
          key,
          message,
        });

        // COSE header has HS512
        const protectedHeadersMap = new Map<number, unknown>([
          [Headers.Algorithm, MacAlgorithms.HS512],
        ]);
        const protectedHeaders = encodeCbor(protectedHeadersMap);
        const unprotectedHeaders = new Map<number, unknown>();

        const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

        expect(() =>
          macBase.internalVerify({
            jwkOctKey,
            toBeMaced: message,
          })
        ).toThrowError('Algorithm mismatch: expected HS512, got HS256');
      });
    });

    describe('edge cases', () => {
      it('should handle empty message', () => {
        const key = randomBytes(32);
        const message = new Uint8Array([]);

        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS256,
          k: key,
        });

        const tag = generateHmac({
          digestAlgorithm: 'SHA-256',
          key,
          message,
        });

        const protectedHeadersMap = new Map<number, unknown>([
          [Headers.Algorithm, MacAlgorithms.HS256],
        ]);
        const protectedHeaders = encodeCbor(protectedHeadersMap);
        const unprotectedHeaders = new Map<number, unknown>();

        const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

        const isValid = macBase.internalVerify({
          jwkOctKey,
          toBeMaced: message,
        });

        expect(isValid).toBe(true);
      });

      it('should handle large message', () => {
        const key = randomBytes(32);
        const message = randomBytes(10000); // 10KB message

        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS256,
          k: key,
        });

        const tag = generateHmac({
          digestAlgorithm: 'SHA-256',
          key,
          message,
        });

        const protectedHeadersMap = new Map<number, unknown>([
          [Headers.Algorithm, MacAlgorithms.HS256],
        ]);
        const protectedHeaders = encodeCbor(protectedHeadersMap);
        const unprotectedHeaders = new Map<number, unknown>();

        const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

        const isValid = macBase.internalVerify({
          jwkOctKey,
          toBeMaced: message,
        });

        expect(isValid).toBe(true);
      });

      it('should return false when tag is completely wrong', () => {
        const key = randomBytes(32);
        const message = new Uint8Array([1, 2, 3]);
        const wrongTag = new Uint8Array(32); // All zeros

        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS256,
          k: key,
        });

        const protectedHeadersMap = new Map<number, unknown>([
          [Headers.Algorithm, MacAlgorithms.HS256],
        ]);
        const protectedHeaders = encodeCbor(protectedHeadersMap);
        const unprotectedHeaders = new Map<number, unknown>();

        const macBase = new MacBase(
          protectedHeaders,
          unprotectedHeaders,
          wrongTag
        );

        const isValid = macBase.internalVerify({
          jwkOctKey,
          toBeMaced: message,
        });

        expect(isValid).toBe(false);
      });

      it('should return false when tag has single bit flipped', () => {
        const key = randomBytes(32);
        const message = new Uint8Array([1, 2, 3, 4, 5]);

        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS256,
          k: key,
        });

        const tag = generateHmac({
          digestAlgorithm: 'SHA-256',
          key,
          message,
        });

        // Flip one bit in the tag
        const corruptedTag = new Uint8Array(tag);
        corruptedTag[0] ^= 0x01;

        const protectedHeadersMap = new Map<number, unknown>([
          [Headers.Algorithm, MacAlgorithms.HS256],
        ]);
        const protectedHeaders = encodeCbor(protectedHeadersMap);
        const unprotectedHeaders = new Map<number, unknown>();

        const macBase = new MacBase(
          protectedHeaders,
          unprotectedHeaders,
          corruptedTag
        );

        const isValid = macBase.internalVerify({
          jwkOctKey,
          toBeMaced: message,
        });

        expect(isValid).toBe(false);
      });
    });
  });

  describe('integration', () => {
    it('should handle complete MAC structure setup', () => {
      const key = randomBytes(32);
      const message = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);

      const jwkOctKey = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key,
        kid: 'test-key-id',
      });

      const tag = generateHmac({
        digestAlgorithm: 'SHA-256',
        key,
        message,
      });

      const protectedHeadersMap = new Map<number, unknown>([
        [Headers.Algorithm, MacAlgorithms.HS256],
        [Headers.KeyId, new Uint8Array([0x01, 0x02, 0x03])],
      ]);
      const protectedHeaders = encodeCbor(protectedHeadersMap);

      const unprotectedHeaders = new Map<number, unknown>([
        [Headers.ContentType, 'application/cose'],
      ]);

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      // Verify properties
      expect(macBase.macAlgorithm).toBe(MacAlgorithms.HS256);
      expect(macBase.getHeader(Headers.Algorithm)).toBe(MacAlgorithms.HS256);
      expect(macBase.getHeader(Headers.KeyId)).toEqual(
        new Uint8Array([0x01, 0x02, 0x03])
      );
      expect(macBase.getHeader(Headers.ContentType)).toBe('application/cose');

      // Verify MAC
      const isValid = macBase.internalVerify({
        jwkOctKey,
        toBeMaced: message,
      });
      expect(isValid).toBe(true);
    });

    it('should verify MAC with algorithm from unprotected headers', () => {
      const key = randomBytes(48);
      const message = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

      const jwkOctKey = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS384,
        k: key,
      });

      const tag = generateHmac({
        digestAlgorithm: 'SHA-384',
        key,
        message,
      });

      const protectedHeadersMap = new Map<number, unknown>();
      const protectedHeaders = encodeCbor(protectedHeadersMap);

      const unprotectedHeaders = new Map<number, unknown>([
        [Headers.Algorithm, MacAlgorithms.HS384],
      ]);

      const macBase = new MacBase(protectedHeaders, unprotectedHeaders, tag);

      expect(macBase.macAlgorithm).toBe(MacAlgorithms.HS384);

      const isValid = macBase.internalVerify({
        jwkOctKey,
        toBeMaced: message,
      });
      expect(isValid).toBe(true);
    });
  });
});
