import { describe, it, expect } from 'vitest';
import { jwkToCosePublicKey } from '../jwkToCosePublicKey';
import { JwkPublicKey, JwkAlgorithms, JwkCurves } from '@/jwk/types';
import { PublicKey } from '../PublicKey';
import { KeyParams, KeyTypes, Curves, Algorithms, KeyOps } from '../types';
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
    crv: JwkCurves.Ed25519,
    x: encodeBase64Url(edPublicKey),
    ...overrides,
  });

  describe('should return correct PublicKey for valid EC JWK inputs', () => {
    it('for minimal P-256 JWK', () => {
      const jwk = createValidEcJwk();
      const result = jwkToCosePublicKey(jwk);

      expect(result).toBeInstanceOf(PublicKey);
      expect(result.get(KeyParams.KeyType)).toBe(KeyTypes.EC);
      expect(result.get(KeyParams.Curve)).toBe(Curves.P256);
      expect(result.get(KeyParams.Algorithm)).toBe(Algorithms.ES256);
      expect(result.get(KeyParams.x)).toEqual(xCoord);
      expect(result.get(KeyParams.y)).toEqual(yCoord);
    });

    it('for P-256 JWK with algorithm specified', () => {
      const jwk = createValidEcJwk({
        alg: JwkAlgorithms.ES256,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(KeyParams.KeyType)).toBe(KeyTypes.EC);
      expect(result.get(KeyParams.Curve)).toBe(Curves.P256);
      expect(result.get(KeyParams.Algorithm)).toBe(Algorithms.ES256);
    });

    it('for P-384 JWK', () => {
      const jwk = createValidEcJwk({
        crv: JwkCurves.P384,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(KeyParams.KeyType)).toBe(KeyTypes.EC);
      expect(result.get(KeyParams.Curve)).toBe(Curves.P384);
      expect(result.get(KeyParams.Algorithm)).toBe(Algorithms.ES384);
    });

    it('for P-521 JWK', () => {
      const jwk = createValidEcJwk({
        crv: JwkCurves.P521,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(KeyParams.KeyType)).toBe(KeyTypes.EC);
      expect(result.get(KeyParams.Curve)).toBe(Curves.P521);
      expect(result.get(KeyParams.Algorithm)).toBe(Algorithms.ES512);
    });

    it('for JWK with key ID', () => {
      const kid = 'test-key-id';
      const jwk = createValidEcJwk({
        kid,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(KeyParams.KeyId)).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(result.get(KeyParams.KeyId)!)).toBe(kid);
    });

    it('for JWK with key operations', () => {
      const jwk = createValidEcJwk({
        key_ops: ['sign', 'verify'],
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(KeyParams.KeyOps)).toEqual([
        KeyOps.Sign,
        KeyOps.Verify,
      ]);
    });
  });

  describe('should return correct PublicKey for valid OKP (EdDSA) JWK inputs', () => {
    it('for minimal Ed25519 JWK', () => {
      const jwk = createValidOkpJwk();
      const result = jwkToCosePublicKey(jwk);

      expect(result).toBeInstanceOf(PublicKey);
      expect(result.get(KeyParams.KeyType)).toBe(KeyTypes.OKP);
      expect(result.get(KeyParams.Curve)).toBe(Curves.Ed25519);
      expect(result.get(KeyParams.Algorithm)).toBe(Algorithms.EdDSA);
      expect(result.get(KeyParams.x)).toEqual(edPublicKey);
      expect(result.get(KeyParams.y)).toBeUndefined();
    });

    it('for Ed25519 JWK with algorithm specified', () => {
      const jwk = createValidOkpJwk({
        alg: JwkAlgorithms.EdDSA,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(KeyParams.KeyType)).toBe(KeyTypes.OKP);
      expect(result.get(KeyParams.Curve)).toBe(Curves.Ed25519);
      expect(result.get(KeyParams.Algorithm)).toBe(Algorithms.EdDSA);
      expect(result.get(KeyParams.y)).toBeUndefined();
    });

    it('for JWK with key ID', () => {
      const kid = 'okp-key-id';
      const jwk = createValidOkpJwk({
        kid,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(KeyParams.KeyId)).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(result.get(KeyParams.KeyId)!)).toBe(kid);
    });

    it('for JWK with key operations', () => {
      const jwk = createValidOkpJwk({
        key_ops: ['sign', 'verify'],
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(KeyParams.KeyOps)).toEqual([
        KeyOps.Sign,
        KeyOps.Verify,
      ]);
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
        'Missing curve in EC public key'
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
        'Missing curve in EC public key'
      );
    });

    it('for null curve parameter', () => {
      const invalidJwk = createValidEcJwk({ crv: null as unknown as string });

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing curve in EC public key'
      );
    });

    it('for undefined curve parameter', () => {
      const invalidJwk = createValidEcJwk({
        crv: undefined as unknown as string,
      });

      expect(() => jwkToCosePublicKey(invalidJwk)).toThrow(
        'Missing curve in EC public key'
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

      expect(result.get(KeyParams.KeyOps)).toEqual([]);
    });

    it('for JWK with single key operation', () => {
      const jwk = createValidEcJwk({
        key_ops: ['sign'],
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(KeyParams.KeyOps)).toEqual([KeyOps.Sign]);
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

      expect(result.get(KeyParams.KeyOps)).toEqual([
        KeyOps.Sign,
        KeyOps.Verify,
        KeyOps.Encrypt,
        KeyOps.Decrypt,
        KeyOps.WrapKey,
        KeyOps.UnwrapKey,
        KeyOps.DeriveKey,
        KeyOps.DeriveBits,
      ]);
    });

    it('for JWK with duplicate key operations', () => {
      const jwk = createValidEcJwk({
        key_ops: ['sign', 'sign', 'verify', 'verify'],
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(KeyParams.KeyOps)).toEqual([
        KeyOps.Sign,
        KeyOps.Sign,
        KeyOps.Verify,
        KeyOps.Verify,
      ]);
    });

    it('for JWK with long key ID', () => {
      const longKid = 'a'.repeat(1000);
      const jwk = createValidEcJwk({
        kid: longKid,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(KeyParams.KeyId)).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(result.get(KeyParams.KeyId)!)).toBe(
        longKid
      );
    });

    it('for JWK with special characters in key ID', () => {
      const specialKid = 'key-id-with-special-chars!@#$%^&*()';
      const jwk = createValidEcJwk({
        kid: specialKid,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(KeyParams.KeyId)).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(result.get(KeyParams.KeyId)!)).toBe(
        specialKid
      );
    });

    it('for JWK with Unicode characters in key ID', () => {
      const unicodeKid = 'key-id-with-unicode-🚀-🎉-测试';
      const jwk = createValidEcJwk({
        kid: unicodeKid,
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(KeyParams.KeyId)).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(result.get(KeyParams.KeyId)!)).toBe(
        unicodeKid
      );
    });

    it('for JWK with empty key ID', () => {
      const jwk = createValidEcJwk({
        kid: '',
      });
      const result = jwkToCosePublicKey(jwk);

      // Empty string is falsy, so KeyID should not be set
      expect(result.get(KeyParams.KeyId)).toBeUndefined();
    });

    it('for JWK with whitespace-only key ID', () => {
      const jwk = createValidEcJwk({
        kid: '   ',
      });
      const result = jwkToCosePublicKey(jwk);

      expect(result.get(KeyParams.KeyId)).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(result.get(KeyParams.KeyId)!)).toBe(
        '   '
      );
    });
  });
});
