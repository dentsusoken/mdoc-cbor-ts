import { describe, it, expect } from 'vitest';
import { jwkToCoseEcPublicKey } from '../jwkToCoseEcPublicKey';
import { EcPublicJwk, JwkAlgorithms, JwkCurves } from '@/jwk/types';
import { EcPublicKey } from '../EcPublicKey';
import { KeyParams, KeyTypes, Curves, Algorithms, KeyOps } from '../types';
import { encodeBase64Url } from 'u8a-utils';

describe('jwkToCoseECPublicKey', () => {
  const xCoord = Uint8Array.from([1, 2, 3]);
  const yCoord = Uint8Array.from([4, 5, 6]);
  // Helper function to create valid test JWK
  const createValidJwk = (
    overrides: Partial<EcPublicJwk> = {}
  ): EcPublicJwk => ({
    kty: 'EC',
    crv: 'P-256',
    x: encodeBase64Url(xCoord),
    y: encodeBase64Url(yCoord),
    ...overrides,
  });

  describe('should return correct EcPublicKey for valid JWK inputs', () => {
    it('for minimal P-256 JWK', () => {
      const jwk = createValidJwk();
      const result = jwkToCoseEcPublicKey(jwk);

      expect(result).toBeInstanceOf(EcPublicKey);
      expect(result.get(KeyParams.KeyType)).toBe(KeyTypes.EC);
      expect(result.get(KeyParams.Curve)).toBe(Curves.P256);
      expect(result.get(KeyParams.Algorithm)).toBe(Algorithms.ES256);
      expect(result.get(KeyParams.x)).toEqual(xCoord);
      expect(result.get(KeyParams.y)).toEqual(yCoord);
    });

    it('for P-256 JWK with algorithm specified', () => {
      const jwk = createValidJwk({
        alg: JwkAlgorithms.ES256,
      });
      const result = jwkToCoseEcPublicKey(jwk);

      expect(result.get(KeyParams.KeyType)).toBe(KeyTypes.EC);
      expect(result.get(KeyParams.Curve)).toBe(Curves.P256);
      expect(result.get(KeyParams.Algorithm)).toBe(Algorithms.ES256);
    });

    it('for P-384 JWK', () => {
      const jwk = createValidJwk({
        crv: JwkCurves.P384,
      });
      const result = jwkToCoseEcPublicKey(jwk);

      expect(result.get(KeyParams.KeyType)).toBe(KeyTypes.EC);
      expect(result.get(KeyParams.Curve)).toBe(Curves.P384);
      expect(result.get(KeyParams.Algorithm)).toBe(Algorithms.ES384);
    });

    it('for P-521 JWK', () => {
      const jwk = createValidJwk({
        crv: JwkCurves.P521,
      });
      const result = jwkToCoseEcPublicKey(jwk);

      expect(result.get(KeyParams.KeyType)).toBe(KeyTypes.EC);
      expect(result.get(KeyParams.Curve)).toBe(Curves.P521);
      expect(result.get(KeyParams.Algorithm)).toBe(Algorithms.ES512);
    });

    it('for JWK with key ID', () => {
      const kid = 'test-key-id';
      const jwk = createValidJwk({
        kid,
      });
      const result = jwkToCoseEcPublicKey(jwk);

      expect(result.get(KeyParams.KeyId)).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(result.get(KeyParams.KeyId)!)).toBe(kid);
    });

    it('for JWK with key operations', () => {
      const jwk = createValidJwk({
        key_ops: ['sign', 'verify'],
      });
      const result = jwkToCoseEcPublicKey(jwk);

      expect(result.get(KeyParams.KeyOps)).toEqual([
        KeyOps.Sign,
        KeyOps.Verify,
      ]);
    });
  });

  describe('should throw Error for invalid JWK inputs', () => {
    it('for non-EC key type', () => {
      const invalidJwk = {
        kty: 'RSA',
        crv: 'P-256',
        x: 'test-x',
        y: 'test-y',
      } as unknown as EcPublicJwk;

      expect(() => jwkToCoseEcPublicKey(invalidJwk)).toThrow(
        'Key type must be "EC"'
      );
    });

    it('for missing curve parameter', () => {
      const invalidJwk = {
        kty: 'EC',
        x: 'test-x',
        y: 'test-y',
      } as EcPublicJwk;

      expect(() => jwkToCoseEcPublicKey(invalidJwk)).toThrow(
        'Missing curve in EC public key'
      );
    });

    it('for null curve parameter', () => {
      const invalidJwk = createValidJwk({ crv: null as any });

      expect(() => jwkToCoseEcPublicKey(invalidJwk)).toThrow(
        'Missing curve in EC public key'
      );
    });

    it('for undefined curve parameter', () => {
      const invalidJwk = createValidJwk({ crv: undefined as any });

      expect(() => jwkToCoseEcPublicKey(invalidJwk)).toThrow(
        'Missing curve in EC public key'
      );
    });

    it('for missing x coordinate', () => {
      const invalidJwk = {
        kty: 'EC',
        crv: 'P-256',
        y: 'test-y',
      } as EcPublicJwk;

      expect(() => jwkToCoseEcPublicKey(invalidJwk)).toThrow(
        'Missing x coordinate in EC public key'
      );
    });

    it('for null x coordinate', () => {
      const invalidJwk = createValidJwk({ x: null as unknown as string });

      expect(() => jwkToCoseEcPublicKey(invalidJwk)).toThrow(
        'Missing x coordinate in EC public key'
      );
    });

    it('for undefined x coordinate', () => {
      const invalidJwk = createValidJwk({ x: undefined as unknown as string });

      expect(() => jwkToCoseEcPublicKey(invalidJwk)).toThrow(
        'Missing x coordinate in EC public key'
      );
    });

    it('for missing y coordinate', () => {
      const invalidJwk = {
        kty: 'EC',
        crv: 'P-256',
        x: 'test-x',
      } as EcPublicJwk;

      expect(() => jwkToCoseEcPublicKey(invalidJwk)).toThrow(
        'Missing y coordinate in EC public key'
      );
    });

    it('for null y coordinate', () => {
      const invalidJwk = createValidJwk({ y: null as unknown as string });

      expect(() => jwkToCoseEcPublicKey(invalidJwk)).toThrow(
        'Missing y coordinate in EC public key'
      );
    });

    it('for undefined y coordinate', () => {
      const invalidJwk = createValidJwk({ y: undefined as unknown as string });

      expect(() => jwkToCoseEcPublicKey(invalidJwk)).toThrow(
        'Missing y coordinate in EC public key'
      );
    });
  });

  describe('should handle edge cases correctly', () => {
    it('for JWK with empty key operations array', () => {
      const jwk = createValidJwk({
        key_ops: [],
      });
      const result = jwkToCoseEcPublicKey(jwk);

      expect(result.get(KeyParams.KeyOps)).toEqual([]);
    });

    it('for JWK with single key operation', () => {
      const jwk = createValidJwk({
        key_ops: ['sign'],
      });
      const result = jwkToCoseEcPublicKey(jwk);

      expect(result.get(KeyParams.KeyOps)).toEqual([KeyOps.Sign]);
    });

    it('for JWK with all possible key operations', () => {
      const jwk = createValidJwk({
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
      const result = jwkToCoseEcPublicKey(jwk);

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
      const jwk = createValidJwk({
        key_ops: ['sign', 'sign', 'verify', 'verify'],
      });
      const result = jwkToCoseEcPublicKey(jwk);

      expect(result.get(KeyParams.KeyOps)).toEqual([
        KeyOps.Sign,
        KeyOps.Sign,
        KeyOps.Verify,
        KeyOps.Verify,
      ]);
    });

    it('for JWK with long key ID', () => {
      const longKid = 'a'.repeat(1000);
      const jwk = createValidJwk({
        kid: longKid,
      });
      const result = jwkToCoseEcPublicKey(jwk);

      expect(result.get(KeyParams.KeyId)).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(result.get(KeyParams.KeyId)!)).toBe(
        longKid
      );
    });

    it('for JWK with special characters in key ID', () => {
      const specialKid = 'key-id-with-special-chars!@#$%^&*()';
      const jwk = createValidJwk({
        kid: specialKid,
      });
      const result = jwkToCoseEcPublicKey(jwk);

      expect(result.get(KeyParams.KeyId)).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(result.get(KeyParams.KeyId)!)).toBe(
        specialKid
      );
    });

    it('for JWK with Unicode characters in key ID', () => {
      const unicodeKid = 'key-id-with-unicode-🚀-🎉-测试';
      const jwk = createValidJwk({
        kid: unicodeKid,
      });
      const result = jwkToCoseEcPublicKey(jwk);

      expect(result.get(KeyParams.KeyId)).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(result.get(KeyParams.KeyId)!)).toBe(
        unicodeKid
      );
    });

    it('for JWK with empty key ID', () => {
      const jwk = createValidJwk({
        kid: '',
      });
      const result = jwkToCoseEcPublicKey(jwk);

      // Empty string is falsy, so KeyID should not be set
      expect(result.get(KeyParams.KeyId)).toBeUndefined();
    });

    it('for JWK with whitespace-only key ID', () => {
      const jwk = createValidJwk({
        kid: '   ',
      });
      const result = jwkToCoseEcPublicKey(jwk);

      expect(result.get(KeyParams.KeyId)).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(result.get(KeyParams.KeyId)!)).toBe(
        '   '
      );
    });
  });
});
