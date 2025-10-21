import { describe, it, expect } from 'vitest';
import { generateJwkOctKey } from '../generateJwkOctKey';
import { JwkKeyType, JwkMacAlgorithm, JwkMacKeyOp, JwkOctKey } from '../types';
import { decodeBase64Url } from 'u8a-utils';

describe('generateJwkOctKey', () => {
  describe('basic generation', () => {
    it('should generate JWK with HS256 algorithm', () => {
      const key = new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
      ]);

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
      });

      expect(jwk).toBeDefined();
      expect(jwk.kty).toBe(JwkKeyType.oct);
      expect(jwk.alg).toBe(JwkMacAlgorithm.HS256);
      expect(jwk.k).toBeDefined();
      expect(typeof jwk.k).toBe('string');
    });

    it('should generate JWK with HS384 algorithm', () => {
      const key = new Uint8Array(48); // 384-bit key

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS384,
        k: key,
      });

      expect(jwk.kty).toBe(JwkKeyType.oct);
      expect(jwk.alg).toBe(JwkMacAlgorithm.HS384);
      expect(jwk.k).toBeDefined();
    });

    it('should generate JWK with HS512 algorithm', () => {
      const key = new Uint8Array(64); // 512-bit key

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS512,
        k: key,
      });

      expect(jwk.kty).toBe(JwkKeyType.oct);
      expect(jwk.alg).toBe(JwkMacAlgorithm.HS512);
      expect(jwk.k).toBeDefined();
    });
  });

  describe('key encoding', () => {
    it('should Base64URL encode the key value', () => {
      const key = new Uint8Array([1, 2, 3, 4, 5]);

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
      });

      const decodedKey = decodeBase64Url(jwk.k);
      expect(decodedKey).toEqual(key);
    });

    it('should correctly encode empty key', () => {
      const key = new Uint8Array([]);

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
      });

      const decodedKey = decodeBase64Url(jwk.k);
      expect(decodedKey).toEqual(key);
      expect(decodedKey.length).toBe(0);
    });

    it('should correctly encode key with all zero bytes', () => {
      const key = new Uint8Array(32); // All zeros

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
      });

      const decodedKey = decodeBase64Url(jwk.k);
      expect(decodedKey).toEqual(key);
      expect(decodedKey.every((b) => b === 0)).toBe(true);
    });

    it('should correctly encode key with all 0xFF bytes', () => {
      const key = new Uint8Array(32).fill(0xff);

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
      });

      const decodedKey = decodeBase64Url(jwk.k);
      expect(decodedKey).toEqual(key);
      expect(decodedKey.every((b) => b === 0xff)).toBe(true);
    });

    it('should handle various key lengths', () => {
      const keySizes = [16, 24, 32, 48, 64, 128];

      keySizes.forEach((size) => {
        const key = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
          key[i] = i % 256;
        }

        const jwk = generateJwkOctKey({
          alg: JwkMacAlgorithm.HS256,
          k: key,
        });

        const decodedKey = decodeBase64Url(jwk.k);
        expect(decodedKey).toEqual(key);
        expect(decodedKey.length).toBe(size);
      });
    });
  });

  describe('optional kid parameter', () => {
    it('should include kid when provided', () => {
      const key = new Uint8Array(32);
      const kid = 'my-key-id';

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
        kid,
      });

      expect(jwk.kid).toBe(kid);
    });

    it('should not include kid when not provided', () => {
      const key = new Uint8Array(32);

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
      });

      expect(jwk.kid).toBeUndefined();
    });

    it('should handle various kid formats', () => {
      const key = new Uint8Array(32);
      const kidFormats = [
        'simple-id',
        'complex-id-with-dashes',
        'id_with_underscores',
        '123456',
        'base64encodedId==',
        'urn:uuid:550e8400-e29b-41d4-a716-446655440000',
      ];

      kidFormats.forEach((kid) => {
        const jwk = generateJwkOctKey({
          alg: JwkMacAlgorithm.HS256,
          k: key,
          kid,
        });

        expect(jwk.kid).toBe(kid);
      });
    });

    it('should handle empty string as kid', () => {
      const key = new Uint8Array(32);

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
        kid: '',
      });

      expect(jwk.kid).toBe('');
    });
  });

  describe('optional key_ops parameter', () => {
    it('should include key_ops when provided with MACCreate', () => {
      const key = new Uint8Array(32);

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
        key_ops: [JwkMacKeyOp.MACCreate],
      });

      expect(jwk.key_ops).toEqual([JwkMacKeyOp.MACCreate]);
    });

    it('should include key_ops when provided with MACVerify', () => {
      const key = new Uint8Array(32);

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
        key_ops: [JwkMacKeyOp.MACVerify],
      });

      expect(jwk.key_ops).toEqual([JwkMacKeyOp.MACVerify]);
    });

    it('should include key_ops with both MACCreate and MACVerify', () => {
      const key = new Uint8Array(32);

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
        key_ops: [JwkMacKeyOp.MACCreate, JwkMacKeyOp.MACVerify],
      });

      expect(jwk.key_ops).toEqual([
        JwkMacKeyOp.MACCreate,
        JwkMacKeyOp.MACVerify,
      ]);
      expect(jwk.key_ops).toContain(JwkMacKeyOp.MACCreate);
      expect(jwk.key_ops).toContain(JwkMacKeyOp.MACVerify);
    });

    it('should not include key_ops when not provided', () => {
      const key = new Uint8Array(32);

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
      });

      expect(jwk.key_ops).toBeUndefined();
    });

    it('should handle empty key_ops array', () => {
      const key = new Uint8Array(32);

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
        key_ops: [],
      });

      expect(jwk.key_ops).toEqual([]);
      expect(jwk.key_ops?.length).toBe(0);
    });
  });

  describe('complete JWK generation', () => {
    it('should generate complete JWK with all parameters', () => {
      const key = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        key[i] = i;
      }

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
        kid: 'complete-key-id',
        key_ops: [JwkMacKeyOp.MACCreate, JwkMacKeyOp.MACVerify],
      });

      expect(jwk.kty).toBe(JwkKeyType.oct);
      expect(jwk.alg).toBe(JwkMacAlgorithm.HS256);
      expect(jwk.k).toBeDefined();
      expect(jwk.kid).toBe('complete-key-id');
      expect(jwk.key_ops).toEqual([
        JwkMacKeyOp.MACCreate,
        JwkMacKeyOp.MACVerify,
      ]);

      // Verify key can be decoded
      const decodedKey = decodeBase64Url(jwk.k);
      expect(decodedKey).toEqual(key);
    });

    it('should generate minimal JWK with only required parameters', () => {
      const key = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS384,
        k: key,
      });

      expect(jwk.kty).toBe(JwkKeyType.oct);
      expect(jwk.alg).toBe(JwkMacAlgorithm.HS384);
      expect(jwk.k).toBeDefined();
      expect(jwk.kid).toBeUndefined();
      expect(jwk.key_ops).toBeUndefined();
    });

    it('should return valid JwkOctKey type', () => {
      const key = new Uint8Array(32);

      const jwk: JwkOctKey = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS512,
        k: key,
        kid: 'test-key',
        key_ops: [JwkMacKeyOp.MACCreate],
      });

      expect(jwk).toBeDefined();
      expect(typeof jwk.kty).toBe('string');
      expect(typeof jwk.alg).toBe('string');
      expect(typeof jwk.k).toBe('string');
      expect(typeof jwk.kid).toBe('string');
      expect(Array.isArray(jwk.key_ops)).toBe(true);
    });
  });

  describe('different algorithm scenarios', () => {
    it('should generate JWK for HS256 with appropriate key size', () => {
      const key = new Uint8Array(32); // Recommended: 256 bits = 32 bytes

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
      });

      expect(jwk.alg).toBe(JwkMacAlgorithm.HS256);
      const decodedKey = decodeBase64Url(jwk.k);
      expect(decodedKey.length).toBe(32);
    });

    it('should generate JWK for HS384 with appropriate key size', () => {
      const key = new Uint8Array(48); // Recommended: 384 bits = 48 bytes

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS384,
        k: key,
      });

      expect(jwk.alg).toBe(JwkMacAlgorithm.HS384);
      const decodedKey = decodeBase64Url(jwk.k);
      expect(decodedKey.length).toBe(48);
    });

    it('should generate JWK for HS512 with appropriate key size', () => {
      const key = new Uint8Array(64); // Recommended: 512 bits = 64 bytes

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS512,
        k: key,
      });

      expect(jwk.alg).toBe(JwkMacAlgorithm.HS512);
      const decodedKey = decodeBase64Url(jwk.k);
      expect(decodedKey.length).toBe(64);
    });
  });

  describe('edge cases', () => {
    it('should handle key with single byte', () => {
      const key = new Uint8Array([0x42]);

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
      });

      const decodedKey = decodeBase64Url(jwk.k);
      expect(decodedKey).toEqual(key);
      expect(decodedKey.length).toBe(1);
    });

    it('should handle very long key', () => {
      const key = new Uint8Array(256); // Very long key
      for (let i = 0; i < 256; i++) {
        key[i] = i;
      }

      const jwk = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS512,
        k: key,
      });

      const decodedKey = decodeBase64Url(jwk.k);
      expect(decodedKey).toEqual(key);
      expect(decodedKey.length).toBe(256);
    });

    it('should produce different Base64URL strings for different keys', () => {
      const key1 = new Uint8Array([1, 2, 3]);
      const key2 = new Uint8Array([1, 2, 4]);

      const jwk1 = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key1,
      });

      const jwk2 = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key2,
      });

      expect(jwk1.k).not.toBe(jwk2.k);
    });

    it('should produce identical JWKs for identical inputs', () => {
      const key = new Uint8Array([1, 2, 3, 4, 5]);

      const jwk1 = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
        kid: 'same-id',
      });

      const jwk2 = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
        kid: 'same-id',
      });

      expect(jwk1).toEqual(jwk2);
    });
  });

  describe('type consistency', () => {
    it('should always set kty to "oct"', () => {
      const key = new Uint8Array(32);
      const algorithms = [
        JwkMacAlgorithm.HS256,
        JwkMacAlgorithm.HS384,
        JwkMacAlgorithm.HS512,
      ];

      algorithms.forEach((alg) => {
        const jwk = generateJwkOctKey({ alg, k: key });
        expect(jwk.kty).toBe(JwkKeyType.oct);
        expect(jwk.kty).toBe('oct');
      });
    });

    it('should preserve algorithm value exactly', () => {
      const key = new Uint8Array(32);

      const jwkHS256 = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS256,
        k: key,
      });
      expect(jwkHS256.alg).toBe('HS256');

      const jwkHS384 = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS384,
        k: key,
      });
      expect(jwkHS384.alg).toBe('HS384');

      const jwkHS512 = generateJwkOctKey({
        alg: JwkMacAlgorithm.HS512,
        k: key,
      });
      expect(jwkHS512.alg).toBe('HS512');
    });
  });
});
