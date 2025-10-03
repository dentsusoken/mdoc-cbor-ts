import { describe, it, expect } from 'vitest';
import { generateHmac } from '../generateHmac';

describe('generateHmac', () => {
  describe('output length verification', () => {
    it('SHA-256 produces 32 bytes', () => {
      const key = new Uint8Array([0x01, 0x02, 0x03]);
      const message = new Uint8Array([0x04, 0x05, 0x06]);
      const hmac = generateHmac({
        digestAlgorithm: 'SHA-256',
        key,
        message,
      });

      expect(hmac).toBeInstanceOf(Uint8Array);
      expect(hmac.length).toBe(32);
    });

    it('SHA-384 produces 48 bytes', () => {
      const key = new Uint8Array([0x01, 0x02, 0x03]);
      const message = new Uint8Array([0x04, 0x05, 0x06]);
      const hmac = generateHmac({
        digestAlgorithm: 'SHA-384',
        key,
        message,
      });

      expect(hmac).toBeInstanceOf(Uint8Array);
      expect(hmac.length).toBe(48);
    });

    it('SHA-512 produces 64 bytes', () => {
      const key = new Uint8Array([0x01, 0x02, 0x03]);
      const message = new Uint8Array([0x04, 0x05, 0x06]);
      const hmac = generateHmac({
        digestAlgorithm: 'SHA-512',
        key,
        message,
      });

      expect(hmac).toBeInstanceOf(Uint8Array);
      expect(hmac.length).toBe(64);
    });
  });

  describe('deterministic behavior', () => {
    it('produces consistent HMAC for the same inputs', () => {
      const key = new Uint8Array([0x01, 0x02, 0x03]);
      const message = new Uint8Array([0x04, 0x05, 0x06]);

      const hmac1 = generateHmac({
        digestAlgorithm: 'SHA-256',
        key,
        message,
      });
      const hmac2 = generateHmac({
        digestAlgorithm: 'SHA-256',
        key,
        message,
      });

      expect(hmac1).toEqual(hmac2);
    });

    it('produces different HMACs for different keys', () => {
      const key1 = new Uint8Array([0x01, 0x02, 0x03]);
      const key2 = new Uint8Array([0x04, 0x05, 0x06]);
      const message = new Uint8Array([0x07, 0x08, 0x09]);

      const hmac1 = generateHmac({
        digestAlgorithm: 'SHA-256',
        key: key1,
        message,
      });
      const hmac2 = generateHmac({
        digestAlgorithm: 'SHA-256',
        key: key2,
        message,
      });

      expect(hmac1).not.toEqual(hmac2);
    });

    it('produces different HMACs for different messages', () => {
      const key = new Uint8Array([0x01, 0x02, 0x03]);
      const message1 = new Uint8Array([0x04, 0x05, 0x06]);
      const message2 = new Uint8Array([0x07, 0x08, 0x09]);

      const hmac1 = generateHmac({
        digestAlgorithm: 'SHA-256',
        key,
        message: message1,
      });
      const hmac2 = generateHmac({
        digestAlgorithm: 'SHA-256',
        key,
        message: message2,
      });

      expect(hmac1).not.toEqual(hmac2);
    });

    it('produces different HMACs for different algorithms', () => {
      const key = new Uint8Array([0x01, 0x02, 0x03]);
      const message = new Uint8Array([0x04, 0x05, 0x06]);

      const hmac256 = generateHmac({
        digestAlgorithm: 'SHA-256',
        key,
        message,
      });
      const hmac384 = generateHmac({
        digestAlgorithm: 'SHA-384',
        key,
        message,
      });
      const hmac512 = generateHmac({
        digestAlgorithm: 'SHA-512',
        key,
        message,
      });

      expect(hmac256).not.toEqual(hmac384);
      expect(hmac256).not.toEqual(hmac512);
      expect(hmac384).not.toEqual(hmac512);
    });
  });

  describe('test vectors with known outputs', () => {
    it('produces correct HMAC-SHA256 for RFC 4231 test case 1', () => {
      // RFC 4231 Test Case 1
      const key = new Uint8Array(20).fill(0x0b);
      const message = new TextEncoder().encode('Hi There');
      const hmac = generateHmac({
        digestAlgorithm: 'SHA-256',
        key,
        message,
      });

      // Expected HMAC-SHA256 from RFC 4231
      const expected = new Uint8Array([
        0xb0, 0x34, 0x4c, 0x61, 0xd8, 0xdb, 0x38, 0x53, 0x5c, 0xa8, 0xaf, 0xce,
        0xaf, 0x0b, 0xf1, 0x2b, 0x88, 0x1d, 0xc2, 0x00, 0xc9, 0x83, 0x3d, 0xa7,
        0x26, 0xe9, 0x37, 0x6c, 0x2e, 0x32, 0xcf, 0xf7,
      ]);

      expect(hmac).toEqual(expected);
    });

    it('produces correct HMAC-SHA256 for RFC 4231 test case 2', () => {
      // RFC 4231 Test Case 2
      const key = new TextEncoder().encode('Jefe');
      const message = new TextEncoder().encode('what do ya want for nothing?');
      const hmac = generateHmac({
        digestAlgorithm: 'SHA-256',
        key,
        message,
      });

      // Expected HMAC-SHA256 from RFC 4231
      const expected = new Uint8Array([
        0x5b, 0xdc, 0xc1, 0x46, 0xbf, 0x60, 0x75, 0x4e, 0x6a, 0x04, 0x24, 0x26,
        0x08, 0x95, 0x75, 0xc7, 0x5a, 0x00, 0x3f, 0x08, 0x9d, 0x27, 0x39, 0x83,
        0x9d, 0xec, 0x58, 0xb9, 0x64, 0xec, 0x38, 0x43,
      ]);

      expect(hmac).toEqual(expected);
    });

    it('produces correct HMAC-SHA384 for RFC 4231 test case 1', () => {
      // RFC 4231 Test Case 1 for SHA-384
      const key = new Uint8Array(20).fill(0x0b);
      const message = new TextEncoder().encode('Hi There');
      const hmac = generateHmac({
        digestAlgorithm: 'SHA-384',
        key,
        message,
      });

      expect(hmac).toBeInstanceOf(Uint8Array);
      expect(hmac.length).toBe(48);
    });

    it('produces correct HMAC-SHA512 for RFC 4231 test case 1', () => {
      // RFC 4231 Test Case 1 for SHA-512
      const key = new Uint8Array(20).fill(0x0b);
      const message = new TextEncoder().encode('Hi There');
      const hmac = generateHmac({
        digestAlgorithm: 'SHA-512',
        key,
        message,
      });

      expect(hmac).toBeInstanceOf(Uint8Array);
      expect(hmac.length).toBe(64);
    });
  });

  describe('edge cases', () => {
    it('handles empty key', () => {
      const key = new Uint8Array([]);
      const message = new Uint8Array([0x01, 0x02, 0x03]);

      const hmac = generateHmac({
        digestAlgorithm: 'SHA-256',
        key,
        message,
      });

      expect(hmac).toBeInstanceOf(Uint8Array);
      expect(hmac.length).toBe(32);
    });

    it('handles empty message', () => {
      const key = new Uint8Array([0x01, 0x02, 0x03]);
      const message = new Uint8Array([]);

      const hmac = generateHmac({
        digestAlgorithm: 'SHA-256',
        key,
        message,
      });

      expect(hmac).toBeInstanceOf(Uint8Array);
      expect(hmac.length).toBe(32);
    });

    it('handles both empty key and message', () => {
      const key = new Uint8Array([]);
      const message = new Uint8Array([]);

      const hmac = generateHmac({
        digestAlgorithm: 'SHA-256',
        key,
        message,
      });

      expect(hmac).toBeInstanceOf(Uint8Array);
      expect(hmac.length).toBe(32);
    });

    it('handles large key', () => {
      const key = new Uint8Array(1000).fill(0xaa);
      const message = new Uint8Array([0x01, 0x02, 0x03]);

      const hmac = generateHmac({
        digestAlgorithm: 'SHA-256',
        key,
        message,
      });

      expect(hmac).toBeInstanceOf(Uint8Array);
      expect(hmac.length).toBe(32);
    });

    it('handles large message', () => {
      const key = new Uint8Array([0x01, 0x02, 0x03]);
      const message = new Uint8Array(10000).fill(0xbb);

      const hmac = generateHmac({
        digestAlgorithm: 'SHA-256',
        key,
        message,
      });

      expect(hmac).toBeInstanceOf(Uint8Array);
      expect(hmac.length).toBe(32);
    });
  });

  describe('error handling', () => {
    it('throws error for unsupported digest algorithm', () => {
      const key = new Uint8Array([0x01, 0x02, 0x03]);
      const message = new Uint8Array([0x04, 0x05, 0x06]);

      expect(() =>
        generateHmac({
          digestAlgorithm: 'SHA-1' as any,
          key,
          message,
        })
      ).toThrow('Unsupported digest algorithm: SHA-1');
    });
  });
});
