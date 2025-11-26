import { describe, it, expect } from 'vitest';
import { coseToJwkAlgorithm } from '../coseToJwkAlgorithm';
import { Algorithm } from '@/cose/types';
import { JwkAlgorithm } from '@/jwk/types';

describe('coseToJwkAlgorithm', () => {
  describe('should return correct JWK algorithms', () => {
    it('for valid Algorithm enum values', () => {
      expect(coseToJwkAlgorithm(Algorithm.EdDSA)).toBe(JwkAlgorithm.EdDSA);
      expect(coseToJwkAlgorithm(Algorithm.ES256)).toBe(JwkAlgorithm.ES256);
      expect(coseToJwkAlgorithm(Algorithm.ES384)).toBe(JwkAlgorithm.ES384);
      expect(coseToJwkAlgorithm(Algorithm.ES512)).toBe(JwkAlgorithm.ES512);
    });

    it('for numeric values that match Algorithms', () => {
      expect(coseToJwkAlgorithm(-8)).toBe(JwkAlgorithm.EdDSA);
      expect(coseToJwkAlgorithm(-7)).toBe(JwkAlgorithm.ES256);
      expect(coseToJwkAlgorithm(-35)).toBe(JwkAlgorithm.ES384);
      expect(coseToJwkAlgorithm(-36)).toBe(JwkAlgorithm.ES512);
    });
  });

  describe('should throw Error', () => {
    it('for COSE algorithms that cannot be converted to JWK', () => {
      expect(() => coseToJwkAlgorithm(Algorithm.ECDH_ES_HKDF_256)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: -25'
      );
      expect(() => coseToJwkAlgorithm(Algorithm.ECDH_ES_HKDF_512)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: -26'
      );
      expect(() => coseToJwkAlgorithm(-25)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: -25'
      );
      expect(() => coseToJwkAlgorithm(-26)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: -26'
      );
    });

    it('for invalid COSE algorithm numbers', () => {
      expect(() => coseToJwkAlgorithm(0)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: 0'
      );
      expect(() => coseToJwkAlgorithm(1)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: 1'
      );
      expect(() => coseToJwkAlgorithm(-1)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: -1'
      );
      expect(() => coseToJwkAlgorithm(999)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: 999'
      );
    });

    it('for MAC algorithm numbers', () => {
      expect(() => coseToJwkAlgorithm(5)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: 5'
      ); // HS256
      expect(() => coseToJwkAlgorithm(6)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: 6'
      ); // HS384
      expect(() => coseToJwkAlgorithm(7)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: 7'
      ); // HS512
    });

    it('for encryption algorithm numbers', () => {
      expect(() => coseToJwkAlgorithm(1)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: 1'
      ); // A128GCM
      expect(() => coseToJwkAlgorithm(2)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: 2'
      ); // A192GCM
      expect(() => coseToJwkAlgorithm(3)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: 3'
      ); // A256GCM
      expect(() => coseToJwkAlgorithm(-6)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: -6'
      ); // Direct
    });

    it('for string inputs', () => {
      expect(() => coseToJwkAlgorithm('ES256')).toThrow(
        'Unsupported COSE algorithm for JWK conversion: ES256'
      );
      expect(() => coseToJwkAlgorithm('EdDSA')).toThrow(
        'Unsupported COSE algorithm for JWK conversion: EdDSA'
      );
      expect(() => coseToJwkAlgorithm('-7')).toThrow(
        'Unsupported COSE algorithm for JWK conversion: -7'
      );
      expect(() => coseToJwkAlgorithm('')).toThrow(
        'Unsupported COSE algorithm for JWK conversion: '
      );
    });

    it('for null input', () => {
      expect(() => coseToJwkAlgorithm(null)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: null'
      );
    });

    it('for undefined input', () => {
      expect(() => coseToJwkAlgorithm(undefined)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: undefined'
      );
    });

    it('for boolean input', () => {
      expect(() => coseToJwkAlgorithm(true)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: true'
      );
      expect(() => coseToJwkAlgorithm(false)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: false'
      );
    });

    it('for object input', () => {
      expect(() => coseToJwkAlgorithm({})).toThrow(
        'Unsupported COSE algorithm for JWK conversion: [object Object]'
      );
      expect(() => coseToJwkAlgorithm({ alg: -7 })).toThrow(
        'Unsupported COSE algorithm for JWK conversion: [object Object]'
      );
    });

    it('for array input', () => {
      expect(() => coseToJwkAlgorithm([])).toThrow(
        'Unsupported COSE algorithm for JWK conversion: '
      );
      expect(() => coseToJwkAlgorithm([-7, -8])).toThrow(
        'Unsupported COSE algorithm for JWK conversion: -7,-8'
      );
    });

    it('for decimal numbers', () => {
      expect(() => coseToJwkAlgorithm(-8.5)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: -8.5'
      );
      expect(() => coseToJwkAlgorithm(-7.1)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: -7.1'
      );
    });

    it('for NaN', () => {
      expect(() => coseToJwkAlgorithm(NaN)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: NaN'
      );
    });

    it('for Infinity', () => {
      expect(() => coseToJwkAlgorithm(Infinity)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: Infinity'
      );
    });

    it('for negative Infinity', () => {
      expect(() => coseToJwkAlgorithm(-Infinity)).toThrow(
        'Unsupported COSE algorithm for JWK conversion: -Infinity'
      );
    });
  });
});
