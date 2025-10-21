import { describe, it, expect } from 'vitest';
import { jwkToCosePublicKey } from '../jwkToCosePublicKey';
import { JwkPublicKey, JwkAlgorithm, JwkCurve } from '@/jwk/types';
import { Key, KeyType, Curve, Algorithm, KeyOp } from '../types';
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
    x: encodeBase64Url(xCoord),
    y: encodeBase64Url(yCoord),
    ...overrides,
  });

  const createValidOkpJwk = (
    overrides: Partial<JwkPublicKey> = {}
  ): JwkPublicKey => ({
    kty: 'OKP',
    crv: JwkCurve.Ed25519,
    x: encodeBase64Url(edPublicKey),
    ...overrides,
  });

  describe('should return correct Map for valid EC JWK inputs', () => {
    it('for minimal P-256 JWK', () => {
      const jwk = createValidEcJwk();
      const result = jwkToCosePublicKey(jwk);

      expect(result).toBeInstanceOf(Map);
      expect(result.get(Key.KeyType)).toBe(KeyType.EC);
      expect(result.get(Key.Curve)).toBe(Curve.P256);
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
      expect(result.get(Key.Curve)).toBe(Curve.P256);
      expect(result.get(Key.Algorithm)).toBe(Algorithm.ES256);
    });

    it('for P-384 JWK', () => {
      const jwk = createValidEcJwk({
        crv: JwkCurve.P384,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(Key.KeyType)).toBe(KeyType.EC);
      expect(result.get(Key.Curve)).toBe(Curve.P384);
      expect(result.get(Key.Algorithm)).toBe(Algorithm.ES384);
    });

    it('for P-521 JWK', () => {
      const jwk = createValidEcJwk({
        crv: JwkCurve.P521,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(Key.KeyType)).toBe(KeyType.EC);
      expect(result.get(Key.Curve)).toBe(Curve.P521);
      expect(result.get(Key.Algorithm)).toBe(Algorithm.ES512);
    });

    it('for JWK with key operations', () => {
      const jwk = createValidEcJwk({
        key_ops: ['sign', 'verify'],
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(Key.KeyOps)).toEqual([KeyOp.Sign, KeyOp.Verify]);
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

    it('for JWK with key operations', () => {
      const jwk = createValidOkpJwk({
        key_ops: ['sign', 'verify'],
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(Key.KeyOps)).toEqual([KeyOp.Sign, KeyOp.Verify]);
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
      const invalidJwk = {
        kty: 'OKP',
        x: encodeBase64Url(edPublicKey),
      } as JwkPublicKey;

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing curve in EC key'
      );
    });
  });

  describe('should throw Error for invalid JWK inputs', () => {
    it('for non-EC key type', () => {
      const invalidJwk = {
        kty: 'RSA',
        crv: 'P-256',
        x: 'test-x',
        y: 'test-y',
      } as unknown as JwkPublicKey;

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Unsupported JWK key type: RSA'
      );
    });

    it('for missing curve parameter', () => {
      const invalidJwk = {
        kty: 'EC',
        x: 'test-x',
        y: 'test-y',
      } as JwkPublicKey;

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing curve in EC key'
      );
    });

    it('for null curve parameter', () => {
      const invalidJwk = createValidEcJwk({ crv: null as unknown as string });

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing curve in EC key'
      );
    });

    it('for undefined curve parameter', () => {
      const invalidJwk = createValidEcJwk({
        crv: undefined as unknown as string,
      });

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing curve in EC key'
      );
    });

    it('for missing x coordinate', () => {
      const invalidJwk = {
        kty: 'EC',
        crv: 'P-256',
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
    it('for JWK with empty key operations array', () => {
      const jwk = createValidEcJwk({
        key_ops: [],
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(Key.KeyOps)).toEqual([]);
    });

    it('for JWK with single key operation', () => {
      const jwk = createValidEcJwk({
        key_ops: ['sign'],
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(Key.KeyOps)).toEqual([KeyOp.Sign]);
    });

    it('for JWK with all possible key operations', () => {
      const jwk = createValidEcJwk({
        key_ops: [
          'sign',
          'verify',
          'encrypt',
          'decrypt',
          'wrapKey',
          'unwrapKey',
          'deriveKey',
          'deriveBits',
        ],
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(Key.KeyOps)).toEqual([
        KeyOp.Sign,
        KeyOp.Verify,
        KeyOp.Encrypt,
        KeyOp.Decrypt,
        KeyOp.WrapKey,
        KeyOp.UnwrapKey,
        KeyOp.DeriveKey,
        KeyOp.DeriveBits,
      ]);
    });

    it('for JWK with duplicate key operations', () => {
      const jwk = createValidEcJwk({
        key_ops: ['sign', 'sign', 'verify', 'verify'],
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(Key.KeyOps)).toEqual([
        KeyOp.Sign,
        KeyOp.Sign,
        KeyOp.Verify,
        KeyOp.Verify,
      ]);
    });
  });
});
