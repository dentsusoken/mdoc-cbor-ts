import { describe, it, expect } from 'vitest';
import { getShaHash } from '../getShaHash';
import { sha256 } from '@noble/hashes/sha256';
import { sha384, sha512 } from '@noble/hashes/sha512';

describe('getShaHash', () => {
  describe('function identity', () => {
    it('returns sha256 for SHA-256 algorithm', () => {
      const hash = getShaHash('SHA-256');
      expect(hash).toBe(sha256);
    });

    it('returns sha384 for SHA-384 algorithm', () => {
      const hash = getShaHash('SHA-384');
      expect(hash).toBe(sha384);
    });

    it('returns sha512 for SHA-512 algorithm', () => {
      const hash = getShaHash('SHA-512');
      expect(hash).toBe(sha512);
    });
  });

  describe('output length verification', () => {
    it('SHA-256 produces 32 bytes', () => {
      const hash = getShaHash('SHA-256');
      const input = new Uint8Array([0x01, 0x02, 0x03]);
      const result = hash(input);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(32);
    });

    it('SHA-384 produces 48 bytes', () => {
      const hash = getShaHash('SHA-384');
      const input = new Uint8Array([0x01, 0x02, 0x03]);
      const result = hash(input);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(48);
    });

    it('SHA-512 produces 64 bytes', () => {
      const hash = getShaHash('SHA-512');
      const input = new Uint8Array([0x01, 0x02, 0x03]);
      const result = hash(input);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(64);
    });
  });

  describe('hash correctness with test vectors', () => {
    it('SHA-256 produces correct hash for empty input', () => {
      const hash = getShaHash('SHA-256');
      const input = new Uint8Array([]);
      const result = hash(input);

      // SHA-256 of empty string
      const expected = new Uint8Array([
        0xe3, 0xb0, 0xc4, 0x42, 0x98, 0xfc, 0x1c, 0x14, 0x9a, 0xfb, 0xf4, 0xc8,
        0x99, 0x6f, 0xb9, 0x24, 0x27, 0xae, 0x41, 0xe4, 0x64, 0x9b, 0x93, 0x4c,
        0xa4, 0x95, 0x99, 0x1b, 0x78, 0x52, 0xb8, 0x55,
      ]);

      expect(result).toEqual(expected);
    });

    it('SHA-256 produces correct hash for "abc"', () => {
      const hash = getShaHash('SHA-256');
      const input = new Uint8Array([0x61, 0x62, 0x63]); // "abc"
      const result = hash(input);

      // SHA-256 of "abc"
      const expected = new Uint8Array([
        0xba, 0x78, 0x16, 0xbf, 0x8f, 0x01, 0xcf, 0xea, 0x41, 0x41, 0x40, 0xde,
        0x5d, 0xae, 0x22, 0x23, 0xb0, 0x03, 0x61, 0xa3, 0x96, 0x17, 0x7a, 0x9c,
        0xb4, 0x10, 0xff, 0x61, 0xf2, 0x00, 0x15, 0xad,
      ]);

      expect(result).toEqual(expected);
    });

    it('SHA-384 produces correct hash for empty input', () => {
      const hash = getShaHash('SHA-384');
      const input = new Uint8Array([]);
      const result = hash(input);

      // SHA-384 of empty string
      const expected = new Uint8Array([
        0x38, 0xb0, 0x60, 0xa7, 0x51, 0xac, 0x96, 0x38, 0x4c, 0xd9, 0x32, 0x7e,
        0xb1, 0xb1, 0xe3, 0x6a, 0x21, 0xfd, 0xb7, 0x11, 0x14, 0xbe, 0x07, 0x43,
        0x4c, 0x0c, 0xc7, 0xbf, 0x63, 0xf6, 0xe1, 0xda, 0x27, 0x4e, 0xde, 0xbf,
        0xe7, 0x6f, 0x65, 0xfb, 0xd5, 0x1a, 0xd2, 0xf1, 0x48, 0x98, 0xb9, 0x5b,
      ]);

      expect(result).toEqual(expected);
    });

    it('SHA-512 produces correct hash for empty input', () => {
      const hash = getShaHash('SHA-512');
      const input = new Uint8Array([]);
      const result = hash(input);

      // SHA-512 of empty string
      const expected = new Uint8Array([
        0xcf, 0x83, 0xe1, 0x35, 0x7e, 0xef, 0xb8, 0xbd, 0xf1, 0x54, 0x28, 0x50,
        0xd6, 0x6d, 0x80, 0x07, 0xd6, 0x20, 0xe4, 0x05, 0x0b, 0x57, 0x15, 0xdc,
        0x83, 0xf4, 0xa9, 0x21, 0xd3, 0x6c, 0xe9, 0xce, 0x47, 0xd0, 0xd1, 0x3c,
        0x5d, 0x85, 0xf2, 0xb0, 0xff, 0x83, 0x18, 0xd2, 0x87, 0x7e, 0xec, 0x2f,
        0x63, 0xb9, 0x31, 0xbd, 0x47, 0x41, 0x7a, 0x81, 0xa5, 0x38, 0x32, 0x7a,
        0xf9, 0x27, 0xda, 0x3e,
      ]);

      expect(result).toEqual(expected);
    });
  });

  describe('deterministic behavior', () => {
    it('produces consistent hash outputs for the same input', () => {
      const hash256 = getShaHash('SHA-256');
      const input = new Uint8Array([0xaa, 0xbb, 0xcc]);

      const result1 = hash256(input);
      const result2 = hash256(input);

      expect(result1).toEqual(result2);
    });

    it('produces different outputs for different inputs', () => {
      const hash256 = getShaHash('SHA-256');
      const input1 = new Uint8Array([0x01, 0x02, 0x03]);
      const input2 = new Uint8Array([0x04, 0x05, 0x06]);

      const result1 = hash256(input1);
      const result2 = hash256(input2);

      expect(result1).not.toEqual(result2);
    });
  });

  describe('error handling', () => {
    it('throws error for unsupported digest algorithm', () => {
      // @ts-expect-error Testing invalid input
      expect(() => getShaHash('SHA-1')).toThrow(
        'Unsupported digest algorithm: SHA-1'
      );
    });

    it('throws error for invalid input type', () => {
      // @ts-expect-error Testing invalid input
      expect(() => getShaHash(256)).toThrow();
    });
  });
});
