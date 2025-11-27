import { describe, it, expect } from 'vitest';
import { coseToJwkPublicKey } from '../coseToJwkPublicKey';
import { Key, KeyType, Curve, Algorithm } from '@/cose/types';
import { JwkCurve } from '@/jwk/types';
import { encodeBase64Url } from 'u8a-utils';

describe('coseToJwkPublicKey', () => {
  const xCoord = Uint8Array.from([1, 2, 3]);
  const yCoord = Uint8Array.from([4, 5, 6]);
  const edPublicKey = Uint8Array.from([7, 8, 9]);

  // Helper function to create valid test COSE key
  const createValidEcCoseKey = (
    overrides: Map<number, unknown> = new Map()
  ): Map<number, unknown> => {
    const coseKey = new Map<number, unknown>([
      [Key.KeyType, KeyType.EC],
      [Key.Algorithm, Algorithm.ES256],
      [Key.x, xCoord],
      [Key.y, yCoord],
    ]);
    for (const [k, v] of overrides) {
      coseKey.set(k, v);
    }
    return coseKey;
  };

  const createValidOkpCoseKey = (
    overrides: Map<number, unknown> = new Map(),
    includeAlgorithm = false
  ): Map<number, unknown> => {
    const coseKey = new Map<number, unknown>([
      [Key.KeyType, KeyType.OKP],
      [Key.Curve, Curve.Ed25519],
      [Key.x, edPublicKey],
    ]);
    if (includeAlgorithm) {
      coseKey.set(Key.Algorithm, Algorithm.EdDSA);
    }
    for (const [k, v] of overrides) {
      coseKey.set(k, v);
    }
    return coseKey;
  };

  describe('should return correct JWK for valid EC COSE key inputs', () => {
    it('for minimal P-256 COSE key', () => {
      const coseKey = createValidEcCoseKey();
      const result = coseToJwkPublicKey(coseKey);

      expect(result.kty).toBe('EC');
      expect(result.crv).toBe(JwkCurve.P256);
      expect(result.x).toBe(encodeBase64Url(xCoord));
      expect(result.y).toBe(encodeBase64Url(yCoord));
      expect(result.alg).toBeUndefined();
    });

    it('for P-256 COSE key with algorithm specified', () => {
      const coseKey = createValidEcCoseKey(
        new Map([[Key.Algorithm, Algorithm.ES256]])
      );
      const result = coseToJwkPublicKey(coseKey);

      expect(result.kty).toBe('EC');
      expect(result.crv).toBe(JwkCurve.P256);
      expect(result.alg).toBeUndefined();
    });

    it('for P-384 COSE key', () => {
      const coseKey = createValidEcCoseKey(
        new Map([[Key.Algorithm, Algorithm.ES384]])
      );
      const result = coseToJwkPublicKey(coseKey);

      expect(result.kty).toBe('EC');
      expect(result.crv).toBe(JwkCurve.P384);
      expect(result.alg).toBeUndefined();
    });

    it('for P-521 COSE key', () => {
      const coseKey = createValidEcCoseKey(
        new Map([[Key.Algorithm, Algorithm.ES512]])
      );
      const result = coseToJwkPublicKey(coseKey);

      expect(result.kty).toBe('EC');
      expect(result.crv).toBe(JwkCurve.P521);
      expect(result.alg).toBeUndefined();
    });

    it('for EC key with curve but no algorithm (curve derived from algorithm)', () => {
      const coseKey = new Map<number, unknown>([
        [Key.KeyType, KeyType.EC],
        [Key.Curve, Curve.P256],
        [Key.x, xCoord],
        [Key.y, yCoord],
      ]);
      const result = coseToJwkPublicKey(coseKey);

      expect(result.kty).toBe('EC');
      expect(result.crv).toBe(JwkCurve.P256);
      expect(result.alg).toBeUndefined();
    });

    it('for EC key with both algorithm and curve (both used to resolve curve)', () => {
      const coseKey = new Map<number, unknown>([
        [Key.KeyType, KeyType.EC],
        [Key.Algorithm, Algorithm.ES256],
        [Key.Curve, Curve.P256],
        [Key.x, xCoord],
        [Key.y, yCoord],
      ]);
      const result = coseToJwkPublicKey(coseKey);

      expect(result.kty).toBe('EC');
      expect(result.crv).toBe(JwkCurve.P256);
      expect(result.alg).toBeUndefined();
    });
  });

  describe('should return correct JWK for valid OKP (EdDSA) COSE key inputs', () => {
    it('for minimal Ed25519 COSE key (without algorithm)', () => {
      const coseKey = createValidOkpCoseKey(new Map(), false);
      const result = coseToJwkPublicKey(coseKey);

      expect(result.kty).toBe('OKP');
      expect(result.alg).toBeUndefined();
      expect(result.crv).toBe(JwkCurve.Ed25519);
      expect(result.x).toBe(encodeBase64Url(edPublicKey));
      expect(result.y).toBeUndefined();
    });

    it('for Ed25519 COSE key with algorithm specified (algorithm is optional and ignored)', () => {
      const coseKey = createValidOkpCoseKey(new Map(), true);
      const result = coseToJwkPublicKey(coseKey);

      expect(result.kty).toBe('OKP');
      expect(result.alg).toBeUndefined();
      expect(result.crv).toBe(JwkCurve.Ed25519);
      expect(result.y).toBeUndefined();
    });
  });

  describe('should throw Error for invalid COSE key inputs', () => {
    it('for missing key type', () => {
      const coseKey = new Map<number, unknown>([
        [Key.Algorithm, Algorithm.ES256],
        [Key.x, xCoord],
        [Key.y, yCoord],
      ]);

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Missing key type in COSE key'
      );
    });

    it('for null key type', () => {
      const coseKey = createValidEcCoseKey(new Map([[Key.KeyType, null]]));

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Missing key type in COSE key'
      );
    });

    it('for undefined key type', () => {
      const coseKey = createValidEcCoseKey(new Map([[Key.KeyType, undefined]]));

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Missing key type in COSE key'
      );
    });

    it('for invalid key type', () => {
      const coseKey = createValidEcCoseKey(new Map([[Key.KeyType, 999]]));

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Unsupported COSE key type for JWK conversion: 999'
      );
    });

    it('for non-EC/OKP key type (oct)', () => {
      const coseKey = createValidEcCoseKey(
        new Map([[Key.KeyType, KeyType.oct]])
      );

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Key type must be "EC" or "OKP"'
      );
    });

    it('for missing algorithm and curve in EC key', () => {
      const coseKey = new Map<number, unknown>([
        [Key.KeyType, KeyType.EC],
        [Key.x, xCoord],
        [Key.y, yCoord],
      ]);

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Either curve name or algorithm name must be provided'
      );
    });

    it('for null algorithm and missing curve in EC key', () => {
      const coseKey = createValidEcCoseKey(new Map([[Key.Algorithm, null]]));

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Either curve name or algorithm name must be provided'
      );
    });

    it('for undefined algorithm and missing curve in EC key', () => {
      const coseKey = createValidEcCoseKey(
        new Map([[Key.Algorithm, undefined]])
      );

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Either curve name or algorithm name must be provided'
      );
    });

    it('for invalid algorithm', () => {
      const coseKey = createValidEcCoseKey(new Map([[Key.Algorithm, 999]]));

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: 999'
      );
    });

    it('for unsupported algorithm for JWK conversion', () => {
      const coseKey = createValidEcCoseKey(
        new Map([[Key.Algorithm, Algorithm.ECDH_ES_HKDF_256]])
      );

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: -25'
      );
    });

    it('for missing x coordinate in EC key', () => {
      const coseKey = new Map<number, unknown>([
        [Key.KeyType, KeyType.EC],
        [Key.Algorithm, Algorithm.ES256],
        [Key.y, yCoord],
      ]);

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Missing x coordinate in EC public key'
      );
    });

    it('for null x coordinate in EC key', () => {
      const coseKey = createValidEcCoseKey(new Map([[Key.x, null]]));

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Missing x coordinate in EC public key'
      );
    });

    it('for undefined x coordinate in EC key', () => {
      const coseKey = createValidEcCoseKey(new Map([[Key.x, undefined]]));

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Missing x coordinate in EC public key'
      );
    });

    it('for x coordinate not a Uint8Array in EC key', () => {
      const coseKey = createValidEcCoseKey(
        new Map([[Key.x, 'not-a-uint8array']])
      );

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'x coordinate must be a Uint8Array'
      );
    });

    it('for missing x coordinate in OKP key', () => {
      const coseKey = new Map<number, unknown>([
        [Key.KeyType, KeyType.OKP],
        [Key.Curve, Curve.Ed25519],
      ]);

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Missing x coordinate in OKP public key'
      );
    });

    it('for null x coordinate in OKP key', () => {
      const coseKey = createValidOkpCoseKey(new Map([[Key.x, null]]));

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Missing x coordinate in OKP public key'
      );
    });

    it('for undefined x coordinate in OKP key', () => {
      const coseKey = createValidOkpCoseKey(new Map([[Key.x, undefined]]));

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Missing x coordinate in OKP public key'
      );
    });

    it('for x coordinate not a Uint8Array in OKP key', () => {
      const coseKey = createValidOkpCoseKey(
        new Map([[Key.x, 'not-a-uint8array']])
      );

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'x coordinate must be a Uint8Array'
      );
    });

    it('for missing y coordinate in EC key', () => {
      const coseKey = new Map<number, unknown>([
        [Key.KeyType, KeyType.EC],
        [Key.Algorithm, Algorithm.ES256],
        [Key.x, xCoord],
      ]);

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Missing y coordinate in EC public key'
      );
    });

    it('for null y coordinate in EC key', () => {
      const coseKey = createValidEcCoseKey(new Map([[Key.y, null]]));

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Missing y coordinate in EC public key'
      );
    });

    it('for undefined y coordinate in EC key', () => {
      const coseKey = createValidEcCoseKey(new Map([[Key.y, undefined]]));

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Missing y coordinate in EC public key'
      );
    });

    it('for y coordinate not a Uint8Array in EC key', () => {
      const coseKey = createValidEcCoseKey(
        new Map([[Key.y, 'not-a-uint8array']])
      );

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'y coordinate must be a Uint8Array'
      );
    });

    it('for missing curve in OKP key', () => {
      const coseKey = new Map<number, unknown>([
        [Key.KeyType, KeyType.OKP],
        [Key.Algorithm, Algorithm.EdDSA],
        [Key.x, edPublicKey],
      ]);

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        "Missing curve name: could not resolve curve name from algorithm name 'EdDSA'"
      );
    });

    it('for null curve in OKP key', () => {
      const coseKey = createValidOkpCoseKey(new Map([[Key.Curve, null]]));

      expect(() => coseToJwkPublicKey(coseKey)).toThrow();
    });

    it('for undefined curve in OKP key', () => {
      const coseKey = createValidOkpCoseKey(new Map([[Key.Curve, undefined]]));

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Either curve name or algorithm name must be provided'
      );
    });

    it('for invalid curve in OKP key', () => {
      const coseKey = createValidOkpCoseKey(new Map([[Key.Curve, 999]]));

      expect(() => coseToJwkPublicKey(coseKey)).toThrow(
        'Unsupported COSE curve for JWK conversion: 999'
      );
    });
  });

  describe('should handle edge cases correctly', () => {
    it('for EC COSE key, crv should be set and alg should not be set', () => {
      const coseKey = createValidEcCoseKey();
      const result = coseToJwkPublicKey(coseKey);

      expect(result.crv).toBe(JwkCurve.P256);
      expect(result.alg).toBeUndefined();
    });

    it('for OKP COSE key without algorithm, crv should be set and alg should not be set', () => {
      const coseKey = createValidOkpCoseKey(new Map(), false);
      const result = coseToJwkPublicKey(coseKey);

      expect(result.crv).toBe(JwkCurve.Ed25519);
      expect(result.alg).toBeUndefined();
    });

    it('for OKP COSE key with algorithm, algorithm is ignored (only crv is set)', () => {
      const coseKey = createValidOkpCoseKey(new Map(), true);
      const result = coseToJwkPublicKey(coseKey);

      expect(result.crv).toBe(JwkCurve.Ed25519);
      expect(result.alg).toBeUndefined();
    });

    it('for OKP COSE key, y should not be set', () => {
      const coseKey = createValidOkpCoseKey(new Map(), false);
      const result = coseToJwkPublicKey(coseKey);

      expect(result.y).toBeUndefined();
    });
  });
});
