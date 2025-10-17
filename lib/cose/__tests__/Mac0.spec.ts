import { describe, it, expect } from 'vitest';
import { Mac0 } from '../Mac0';
import { Header, MacAlgorithm } from '../types';
import { encodeCbor } from '@/cbor/codec';
import { generateJwkOctKey } from '@/jwk/generateJwkOctKey';
import { JwkMacAlgorithms } from '@/jwk/types';
import { randomBytes } from '@noble/hashes/utils';

describe('Mac0', () => {
  describe('create method', () => {
    describe('HS256', () => {
      it('should create Mac0 with HS256 algorithm', () => {
        const key = randomBytes(32);
        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS256,
          k: key,
        });

        const ph = new Map<number, unknown>([
          [Header.Algorithm, MacAlgorithm.HS256],
        ]);
        const protectedHeaders = encodeCbor(ph);
        const payload = new Uint8Array([1, 2, 3, 4, 5]);

        const mac0 = Mac0.create({
          protectedHeaders,
          payload,
          jwkOctKey,
        });

        expect(mac0).toBeInstanceOf(Mac0);
        expect(mac0.payload).toEqual(payload);
        expect(mac0.tag).toBeInstanceOf(Uint8Array);
        expect(mac0.tag.length).toBe(32); // HS256 produces 32-byte tag
      });

      it('should verify Mac0 created with HS256', () => {
        const key = randomBytes(32);
        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS256,
          k: key,
        });

        const ph = new Map<number, unknown>([
          [Header.Algorithm, MacAlgorithm.HS256],
        ]);
        const protectedHeaders = encodeCbor(ph);
        const payload = new Uint8Array([1, 2, 3, 4, 5]);

        const mac0 = Mac0.create({
          protectedHeaders,
          payload,
          jwkOctKey,
        });

        expect(() => mac0.verify(jwkOctKey)).not.toThrow();
      });
    });

    describe('HS384', () => {
      it('should create Mac0 with HS384 algorithm', () => {
        const key = randomBytes(48);
        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS384,
          k: key,
        });

        const ph = new Map<number, unknown>([
          [Header.Algorithm, MacAlgorithm.HS384],
        ]);
        const protectedHeaders = encodeCbor(ph);
        const payload = new Uint8Array([10, 20, 30, 40]);

        const mac0 = Mac0.create({
          protectedHeaders,
          payload,
          jwkOctKey,
        });

        expect(mac0).toBeInstanceOf(Mac0);
        expect(mac0.payload).toEqual(payload);
        expect(mac0.tag).toBeInstanceOf(Uint8Array);
        expect(mac0.tag.length).toBe(48); // HS384 produces 48-byte tag
      });

      it('should verify Mac0 created with HS384', () => {
        const key = randomBytes(48);
        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS384,
          k: key,
        });

        const ph = new Map<number, unknown>([
          [Header.Algorithm, MacAlgorithm.HS384],
        ]);
        const protectedHeaders = encodeCbor(ph);
        const payload = new Uint8Array([10, 20, 30, 40]);

        const mac0 = Mac0.create({
          protectedHeaders,
          payload,
          jwkOctKey,
        });

        expect(() => mac0.verify(jwkOctKey)).not.toThrow();
      });
    });

    describe('HS512', () => {
      it('should create Mac0 with HS512 algorithm', () => {
        const key = randomBytes(64);
        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS512,
          k: key,
        });

        const ph = new Map<number, unknown>([
          [Header.Algorithm, MacAlgorithm.HS512],
        ]);
        const protectedHeaders = encodeCbor(ph);
        const payload = new Uint8Array([0xff, 0xee, 0xdd]);

        const mac0 = Mac0.create({
          protectedHeaders,
          payload,
          jwkOctKey,
        });

        expect(mac0).toBeInstanceOf(Mac0);
        expect(mac0.payload).toEqual(payload);
        expect(mac0.tag).toBeInstanceOf(Uint8Array);
        expect(mac0.tag.length).toBe(64); // HS512 produces 64-byte tag
      });

      it('should verify Mac0 created with HS512', () => {
        const key = randomBytes(64);
        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS512,
          k: key,
        });

        const ph = new Map<number, unknown>([
          [Header.Algorithm, MacAlgorithm.HS512],
        ]);
        const protectedHeaders = encodeCbor(ph);
        const payload = new Uint8Array([0xff, 0xee, 0xdd]);

        const mac0 = Mac0.create({
          protectedHeaders,
          payload,
          jwkOctKey,
        });

        expect(() => mac0.verify(jwkOctKey)).not.toThrow();
      });
    });

    describe('with unprotected headers', () => {
      it('should create Mac0 with unprotected headers', () => {
        const key = randomBytes(32);
        const jwkOctKey = generateJwkOctKey({
          alg: JwkMacAlgorithms.HS256,
          k: key,
          kid: 'test-key-id',
        });

        const ph = new Map<number, unknown>([
          [Header.Algorithm, MacAlgorithm.HS256],
        ]);
        const uh = new Map<number, unknown>([
          [Header.KeyId, new Uint8Array([0x01, 0x02])],
        ]);
        const protectedHeaders = encodeCbor(ph);
        const payload = new Uint8Array([1, 2, 3]);

        const mac0 = Mac0.create({
          protectedHeaders,
          unprotectedHeaders: uh,
          payload,
          jwkOctKey,
        });

        expect(mac0.unprotectedHeaders).toBe(uh);
        expect(mac0.unprotectedHeaders.get(Header.KeyId)).toEqual(
          new Uint8Array([0x01, 0x02])
        );
      });
    });
  });

  describe('with externalAad', () => {
    it('should create and verify Mac0 with externalAad', () => {
      const key = randomBytes(32);
      const jwkOctKey = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key,
      });

      const ph = new Map<number, unknown>([
        [Header.Algorithm, MacAlgorithm.HS256],
      ]);
      const protectedHeaders = encodeCbor(ph);
      const payload = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
      const externalAad = new Uint8Array([0xaa, 0xbb, 0xcc]);

      const mac0 = Mac0.create({
        protectedHeaders,
        payload,
        externalAad,
        jwkOctKey,
      });

      // Verify must use the same externalAad
      expect(() => mac0.verify(jwkOctKey, { externalAad })).not.toThrow();
    });

    it('should fail verification without matching externalAad', () => {
      const key = randomBytes(32);
      const jwkOctKey = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key,
      });

      const ph = new Map<number, unknown>([
        [Header.Algorithm, MacAlgorithm.HS256],
      ]);
      const protectedHeaders = encodeCbor(ph);
      const payload = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
      const externalAad = new Uint8Array([0xaa, 0xbb, 0xcc]);

      const mac0 = Mac0.create({
        protectedHeaders,
        payload,
        externalAad,
        jwkOctKey,
      });

      // Verify without externalAad should fail
      expect(() => mac0.verify(jwkOctKey)).toThrow(
        'Failed to verify COSE_Mac0 tag'
      );
    });
  });

  describe('with detached payload', () => {
    it('should create Mac0 with detached payload', () => {
      const key = randomBytes(32);
      const jwkOctKey = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key,
      });

      const ph = new Map<number, unknown>([
        [Header.Algorithm, MacAlgorithm.HS256],
      ]);
      const protectedHeaders = encodeCbor(ph);
      const detachedPayload = new Uint8Array([1, 1, 2, 3, 5, 8]);

      const mac0 = Mac0.create({
        protectedHeaders,
        payload: null,
        detachedPayload,
        jwkOctKey,
      });

      expect(mac0.payload).toBeNull();
    });

    it('should verify Mac0 with detached payload', () => {
      const key = randomBytes(32);
      const jwkOctKey = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key,
      });

      const ph = new Map<number, unknown>([
        [Header.Algorithm, MacAlgorithm.HS256],
      ]);
      const protectedHeaders = encodeCbor(ph);
      const detachedPayload = new Uint8Array([1, 1, 2, 3, 5, 8]);

      const mac0 = Mac0.create({
        protectedHeaders,
        payload: null,
        detachedPayload,
        jwkOctKey,
      });

      // Must supply detachedPayload at verify time
      expect(() => mac0.verify(jwkOctKey, { detachedPayload })).not.toThrow();
    });

    it('should throw error if detachedPayload not provided during verification', () => {
      const key = randomBytes(32);
      const jwkOctKey = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key,
      });

      const ph = new Map<number, unknown>([
        [Header.Algorithm, MacAlgorithm.HS256],
      ]);
      const protectedHeaders = encodeCbor(ph);
      const detachedPayload = new Uint8Array([1, 1, 2, 3, 5, 8]);

      const mac0 = Mac0.create({
        protectedHeaders,
        payload: null,
        detachedPayload,
        jwkOctKey,
      });

      expect(() => mac0.verify(jwkOctKey)).toThrow(
        'Detached payload is required when payload is null'
      );
    });

    it('should create and verify with both externalAad and detached payload', () => {
      const key = randomBytes(32);
      const jwkOctKey = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key,
      });

      const ph = new Map<number, unknown>([
        [Header.Algorithm, MacAlgorithm.HS256],
      ]);
      const protectedHeaders = encodeCbor(ph);
      const detachedPayload = new Uint8Array([0xff, 0xee]);
      const externalAad = new Uint8Array([0x11, 0x22]);

      const mac0 = Mac0.create({
        protectedHeaders,
        payload: null,
        detachedPayload,
        externalAad,
        jwkOctKey,
      });

      expect(() =>
        mac0.verify(jwkOctKey, { detachedPayload, externalAad })
      ).not.toThrow();
    });
  });

  describe('error cases', () => {
    it('should throw error if neither payload nor detachedPayload is provided', () => {
      const key = randomBytes(32);
      const jwkOctKey = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key,
      });

      const ph = new Map<number, unknown>([
        [Header.Algorithm, MacAlgorithm.HS256],
      ]);
      const protectedHeaders = encodeCbor(ph);

      expect(() =>
        Mac0.create({
          protectedHeaders,
          payload: null,
          jwkOctKey,
        })
      ).toThrow(
        "Either 'payload' (embedded) or 'detachedPayload' must be provided"
      );
    });

    it('should throw error if both payload and detachedPayload are provided', () => {
      const key = randomBytes(32);
      const jwkOctKey = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key,
      });

      const ph = new Map<number, unknown>([
        [Header.Algorithm, MacAlgorithm.HS256],
      ]);
      const protectedHeaders = encodeCbor(ph);
      const payload = new Uint8Array([1, 2, 3]);
      const detachedPayload = new Uint8Array([4, 5, 6]);

      expect(() =>
        Mac0.create({
          protectedHeaders,
          payload,
          detachedPayload,
          jwkOctKey,
        })
      ).toThrow("Only one of 'payload' or 'detachedPayload' can be provided");
    });

    it('should throw error for invalid JWK MAC algorithm', () => {
      const key = randomBytes(32);
      const jwkOctKey = {
        kty: 'oct',
        alg: 'INVALID',
        k: 'base64url-encoded-key',
      };

      const ph = new Map<number, unknown>([
        [Header.Algorithm, MacAlgorithm.HS256],
      ]);
      const protectedHeaders = encodeCbor(ph);
      const payload = new Uint8Array([1, 2, 3]);

      expect(() =>
        Mac0.create({
          protectedHeaders,
          payload,
          jwkOctKey: jwkOctKey as any,
        })
      ).toThrow('Invalid JWK MAC algorithm: INVALID');
    });

    it('should fail verification with wrong key', () => {
      const key1 = randomBytes(32);
      const key2 = randomBytes(32);

      const jwkOctKey1 = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key1,
      });

      const jwkOctKey2 = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key2,
      });

      const ph = new Map<number, unknown>([
        [Header.Algorithm, MacAlgorithm.HS256],
      ]);
      const protectedHeaders = encodeCbor(ph);
      const payload = new Uint8Array([1, 2, 3, 4, 5]);

      const mac0 = Mac0.create({
        protectedHeaders,
        payload,
        jwkOctKey: jwkOctKey1,
      });

      expect(() => mac0.verify(jwkOctKey2)).toThrow(
        'Failed to verify COSE_Mac0 tag'
      );
    });

    it('should fail verification with wrong algorithm', () => {
      const key = randomBytes(32);
      const jwkOctKey256 = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key,
      });

      const jwkOctKey384 = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS384,
        k: key,
      });

      const ph = new Map<number, unknown>([
        [Header.Algorithm, MacAlgorithm.HS256],
      ]);
      const protectedHeaders = encodeCbor(ph);
      const payload = new Uint8Array([1, 2, 3, 4, 5]);

      const mac0 = Mac0.create({
        protectedHeaders,
        payload,
        jwkOctKey: jwkOctKey256,
      });

      expect(() => mac0.verify(jwkOctKey384)).toThrow(
        'Algorithm mismatch: expected HS256, got HS384'
      );
    });
  });

  describe('getContentForEncoding', () => {
    it('should return correct tuple for encoding', () => {
      const key = randomBytes(32);
      const jwkOctKey = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key,
      });

      const ph = new Map<number, unknown>([
        [Header.Algorithm, MacAlgorithm.HS256],
      ]);
      const uh = new Map<number, unknown>([
        [Header.KeyId, new Uint8Array([0x01])],
      ]);
      const protectedHeaders = encodeCbor(ph);
      const payload = new Uint8Array([1, 2, 3, 4]);

      const mac0 = Mac0.create({
        protectedHeaders,
        unprotectedHeaders: uh,
        payload,
        jwkOctKey,
      });

      const content = mac0.getContentForEncoding();

      expect(Array.isArray(content)).toBe(true);
      expect(content.length).toBe(4);
      expect(content[0]).toEqual(protectedHeaders);
      expect(content[1]).toBe(uh);
      expect(content[2]).toEqual(payload);
      expect(content[3]).toBeInstanceOf(Uint8Array);
      expect(content[3].length).toBe(32); // HS256 tag
    });

    it('should return null payload for detached payload', () => {
      const key = randomBytes(32);
      const jwkOctKey = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key,
      });

      const ph = new Map<number, unknown>([
        [Header.Algorithm, MacAlgorithm.HS256],
      ]);
      const protectedHeaders = encodeCbor(ph);
      const detachedPayload = new Uint8Array([1, 2, 3, 4]);

      const mac0 = Mac0.create({
        protectedHeaders,
        payload: null,
        detachedPayload,
        jwkOctKey,
      });

      const content = mac0.getContentForEncoding();

      expect(content[2]).toBeNull();
    });
  });

  describe('integration', () => {
    it('should handle complete Mac0 workflow', () => {
      const key = randomBytes(32);
      const jwkOctKey = generateJwkOctKey({
        alg: JwkMacAlgorithms.HS256,
        k: key,
        kid: 'mac-key-1',
      });

      const ph = new Map<number, unknown>([
        [Header.Algorithm, MacAlgorithm.HS256],
      ]);
      const uh = new Map<number, unknown>([
        [Header.ContentType, 'application/json'],
      ]);
      const protectedHeaders = encodeCbor(ph);
      const payload = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);

      // Create
      const mac0 = Mac0.create({
        protectedHeaders,
        unprotectedHeaders: uh,
        payload,
        jwkOctKey,
      });

      // Verify structure
      expect(mac0).toBeInstanceOf(Mac0);
      expect(mac0.macAlgorithm).toBe(MacAlgorithm.HS256);
      expect(mac0.payload).toEqual(payload);

      // Get encoding content
      const content = mac0.getContentForEncoding();
      expect(content.length).toBe(4);

      // Verify
      expect(() => mac0.verify(jwkOctKey)).not.toThrow();
    });
  });
});
