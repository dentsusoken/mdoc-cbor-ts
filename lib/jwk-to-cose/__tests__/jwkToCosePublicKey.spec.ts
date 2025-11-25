import { describe, it, expect } from 'vitest';
import { jwkToCosePublicKey } from '../jwkToCosePublicKey';
import { JwkPublicKey, JwkAlgorithm, JwkCurve } from '@/jwk/types';
import { Key, KeyType, Curve, Algorithm } from '@/cose/types';
import { encodeBase64Url } from 'u8a-utils';

describe('jwkToCosePublicKey', () => {
  const xCoord = Uint8Array.from([1, 2, 3]);
  const yCoord = Uint8Array.from([4, 5, 6]);
  const edPublicKey = Uint8Array.from([7, 8, 9]);
  // Helper function to create valid test JWK
  const createValidEcJwk = (
    overrides: Partial<JwkPublicKey> = {}
  ): JwkPublicKey => ({
    kty: 'EC',
    crv: 'P-256',
    alg: JwkAlgorithm.ES256,
    x: encodeBase64Url(xCoord),
    y: encodeBase64Url(yCoord),
    ...overrides,
  });

  const createValidOkpJwk = (
    overrides: Partial<JwkPublicKey> = {}
  ): JwkPublicKey => ({
    kty: 'OKP',
    crv: JwkCurve.Ed25519,
    alg: JwkAlgorithm.EdDSA,
    x: encodeBase64Url(edPublicKey),
    ...overrides,
  });

  describe('should return correct Map for valid EC JWK inputs', () => {
    it('for minimal P-256 JWK', () => {
      const jwk = createValidEcJwk();
      const result = jwkToCosePublicKey(jwk);

      expect(result).toBeInstanceOf(Map);
      expect(result.get(Key.KeyType)).toBe(KeyType.EC);
      expect(result.get(Key.Curve)).toBeUndefined();
      expect(result.get(Key.Algorithm)).toBe(Algorithm.ES256);
      expect(result.get(Key.x)).toEqual(xCoord);
      expect(result.get(Key.y)).toEqual(yCoord);
    });

    it('for P-256 JWK with algorithm specified', () => {
      const jwk = createValidEcJwk({
        alg: JwkAlgorithm.ES256,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(Key.KeyType)).toBe(KeyType.EC);
      expect(result.get(Key.Curve)).toBeUndefined();
      expect(result.get(Key.Algorithm)).toBe(Algorithm.ES256);
    });

    it('for P-384 JWK', () => {
      const jwk = createValidEcJwk({
        crv: JwkCurve.P384,
        alg: JwkAlgorithm.ES384,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(Key.KeyType)).toBe(KeyType.EC);
      expect(result.get(Key.Curve)).toBeUndefined();
      expect(result.get(Key.Algorithm)).toBe(Algorithm.ES384);
    });

    it('for P-521 JWK', () => {
      const jwk = createValidEcJwk({
        crv: JwkCurve.P521,
        alg: JwkAlgorithm.ES512,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(Key.KeyType)).toBe(KeyType.EC);
      expect(result.get(Key.Curve)).toBeUndefined();
      expect(result.get(Key.Algorithm)).toBe(Algorithm.ES512);
    });
  });

  describe('should return correct Map for valid OKP (EdDSA) JWK inputs', () => {
    it('for minimal Ed25519 JWK', () => {
      const jwk = createValidOkpJwk();
      const result = jwkToCosePublicKey(jwk);

      expect(result).toBeInstanceOf(Map);
      expect(result.get(Key.KeyType)).toBe(KeyType.OKP);
      expect(result.get(Key.Curve)).toBe(Curve.Ed25519);
      expect(result.get(Key.Algorithm)).toBe(Algorithm.EdDSA);
      expect(result.get(Key.x)).toEqual(edPublicKey);
      expect(result.get(Key.y)).toBeUndefined();
    });

    it('for Ed25519 JWK with algorithm specified', () => {
      const jwk = createValidOkpJwk({
        alg: JwkAlgorithm.EdDSA,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(Key.KeyType)).toBe(KeyType.OKP);
      expect(result.get(Key.Curve)).toBe(Curve.Ed25519);
      expect(result.get(Key.Algorithm)).toBe(Algorithm.EdDSA);
      expect(result.get(Key.y)).toBeUndefined();
    });
  });

  describe('should throw Error for invalid OKP JWK inputs', () => {
    it('for missing x coordinate', () => {
      const invalidJwk = createValidOkpJwk({
        x: undefined as unknown as string,
      });

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing x coordinate in OKP public key'
      );
    });

    it('for null x coordinate', () => {
      const invalidJwk = createValidOkpJwk({ x: null as unknown as string });

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing x coordinate in OKP public key'
      );
    });

    it('for missing curve parameter', () => {
      const invalidJwk = createValidOkpJwk({
        crv: undefined as unknown as string,
      });

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing curve in OKP public key'
      );
    });

    it('for null curve parameter', () => {
      const invalidJwk = createValidOkpJwk({
        crv: null as unknown as string,
      });

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing curve in OKP public key'
      );
    });
  });

  describe('should throw Error for invalid JWK inputs', () => {
    it('for non-EC/OKP key type', () => {
      const invalidJwk = {
        kty: 'RSA',
        crv: 'P-256',
        alg: JwkAlgorithm.ES256,
        x: 'test-x',
        y: 'test-y',
      } as unknown as JwkPublicKey;

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Unsupported JWK key type: RSA'
      );
    });

    it('for missing algorithm', () => {
      const invalidJwk = createValidEcJwk({
        alg: undefined as unknown as string,
      });

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing algorithm in JWK'
      );
    });

    it('for null algorithm', () => {
      const invalidJwk = createValidEcJwk({
        alg: null as unknown as string,
      });

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing algorithm in JWK'
      );
    });

    it('for missing x coordinate', () => {
      const invalidJwk = {
        kty: 'EC',
        crv: 'P-256',
        alg: JwkAlgorithm.ES256,
        y: 'test-y',
      } as JwkPublicKey;

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing x coordinate in EC public key'
      );
    });

    it('for null x coordinate', () => {
      const invalidJwk = createValidEcJwk({ x: null as unknown as string });

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing x coordinate in EC public key'
      );
    });

    it('for undefined x coordinate', () => {
      const invalidJwk = createValidEcJwk({
        x: undefined as unknown as string,
      });

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing x coordinate in EC public key'
      );
    });

    it('for missing y coordinate', () => {
      const invalidJwk = {
        kty: 'EC',
        crv: 'P-256',
        alg: JwkAlgorithm.ES256,
        x: 'test-x',
      } as JwkPublicKey;

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing y coordinate in EC public key'
      );
    });

    it('for null y coordinate', () => {
      const invalidJwk = createValidEcJwk({ y: null as unknown as string });

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing y coordinate in EC public key'
      );
    });

    it('for undefined y coordinate', () => {
      const invalidJwk = createValidEcJwk({
        y: undefined as unknown as string,
      });

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing y coordinate in EC public key'
      );
    });
  });

  describe('should handle edge cases correctly', () => {
    it('for EC JWK, Curve should not be set', () => {
      const jwk = createValidEcJwk();
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(Key.Curve)).toBeUndefined();
    });

    it('for OKP JWK, Curve should be set', () => {
      const jwk = createValidOkpJwk();
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(Key.Curve)).toBe(Curve.Ed25519);
    });
  });
});
