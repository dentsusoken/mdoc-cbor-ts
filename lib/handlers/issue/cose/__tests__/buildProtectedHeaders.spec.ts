import { describe, expect, it } from 'vitest';
import { buildProtectedHeaders } from '../buildProtectedHeaders';
import { JwkPublicKey, JwkAlgorithms } from '@/jwk/types';
import { Headers, Algorithms } from '@/cose/types';

describe('buildProtectedHeaders', () => {
  describe('normal cases', () => {
    it('should create protected headers with algorithm and key ID', () => {
      const publicJwk: JwkPublicKey = {
        kty: 'EC',
        crv: 'P-256',
        x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
        y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
        alg: JwkAlgorithms.ES256,
        kid: 'key-123',
      };

      const headers = buildProtectedHeaders(publicJwk);

      expect(headers).toBeInstanceOf(Map);
      expect(headers.constructor.name).toBe('Map');
      expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES256);
      expect(headers.get(Headers.KeyId)).toEqual(
        new TextEncoder().encode('key-123')
      );
    });

    it('should create protected headers with algorithm only when no key ID', () => {
      const publicJwk: JwkPublicKey = {
        kty: 'EC',
        crv: 'P-256',
        x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
        y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
        alg: JwkAlgorithms.ES256,
        // No kid parameter
      };

      const headers = buildProtectedHeaders(publicJwk);

      expect(headers).toBeInstanceOf(Map);
      expect(headers.constructor.name).toBe('Map');
      expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES256);
      expect(headers.get(Headers.KeyId)).toBeUndefined();
    });

    it('should create protected headers with crv only', () => {
      const publicJwk: JwkPublicKey = {
        kty: 'EC',
        crv: 'P-256',
        x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
        y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
        // No alg parameter
        // No kid parameter
      };

      const headers = buildProtectedHeaders(publicJwk);

      expect(headers).toBeInstanceOf(Map);
      expect(headers.constructor.name).toBe('Map');
      expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES256);
      expect(headers.get(Headers.KeyId)).toBeUndefined();
    });

    it('should create protected headers with ES384 algorithm', () => {
      const publicJwk: JwkPublicKey = {
        kty: 'EC',
        crv: 'P-384',
        x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
        y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
        alg: JwkAlgorithms.ES384,
      };

      const headers = buildProtectedHeaders(publicJwk);

      expect(headers).toBeInstanceOf(Map);
      expect(headers.constructor.name).toBe('Map');
      expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES384);
    });

    it('should create protected headers with ES512 algorithm', () => {
      const publicJwk: JwkPublicKey = {
        kty: 'EC',
        crv: 'P-521',
        x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
        y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
        alg: JwkAlgorithms.ES512,
      };

      const headers = buildProtectedHeaders(publicJwk);

      expect(headers).toBeInstanceOf(Map);
      expect(headers.constructor.name).toBe('Map');
      expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES512);
    });
  });

  describe('exception cases', () => {
    it('should throw error when algorithm is missing and curve is not supported', () => {
      const publicJwk: JwkPublicKey = {
        kty: 'EC',
        crv: 'P-xxx' as 'P-256' | 'P-384' | 'P-521', // Invalid curve
        x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
        y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
        // No alg parameter
        kid: 'key-123',
      };

      expect(() => buildProtectedHeaders(publicJwk)).toThrow(
        'Unsupported JWK curve: P-xxx'
      );
    });

    it('should throw error when algorithm is not supported', () => {
      const publicJwk: JwkPublicKey = {
        kty: 'EC',
        crv: 'P-256',
        x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
        y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
        alg: 'xxx' as JwkAlgorithms,
        kid: 'key-123',
      };

      expect(() => buildProtectedHeaders(publicJwk)).toThrow(
        'Unsupported JWK algorithm: xxx'
      );
    });
  });
});
