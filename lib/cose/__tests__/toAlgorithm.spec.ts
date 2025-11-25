import { describe, it, expect } from 'vitest';
import { toAlgorithm } from '../toAlgorithm';
import { Algorithm } from '../types';

describe('toAlgorithm', () => {
  describe('should return valid Algorithms', () => {
    it('for valid Algorithm enum values', () => {
      expect(toAlgorithm(Algorithm.EdDSA)).toBe(Algorithm.EdDSA);
      expect(toAlgorithm(Algorithm.ES256)).toBe(Algorithm.ES256);
      expect(toAlgorithm(Algorithm.ES384)).toBe(Algorithm.ES384);
      expect(toAlgorithm(Algorithm.ES512)).toBe(Algorithm.ES512);
      expect(toAlgorithm(Algorithm.ECDH_ES_HKDF_256)).toBe(
        Algorithm.ECDH_ES_HKDF_256
      );
      expect(toAlgorithm(Algorithm.ECDH_ES_HKDF_512)).toBe(
        Algorithm.ECDH_ES_HKDF_512
      );
    });

    it('for numeric values that match Algorithms', () => {
      expect(toAlgorithm(-8)).toBe(Algorithm.EdDSA);
      expect(toAlgorithm(-7)).toBe(Algorithm.ES256);
      expect(toAlgorithm(-35)).toBe(Algorithm.ES384);
      expect(toAlgorithm(-36)).toBe(Algorithm.ES512);
      expect(toAlgorithm(-25)).toBe(Algorithm.ECDH_ES_HKDF_256);
      expect(toAlgorithm(-26)).toBe(Algorithm.ECDH_ES_HKDF_512);
    });

    it('for all enum values systematically', () => {
      const allAlgorithms = Object.values(Algorithm).filter(
        (v) => typeof v === 'number'
      ) as Algorithm[];

      allAlgorithms.forEach((algorithm) => {
        expect(toAlgorithm(algorithm)).toBe(algorithm);
      });
    });
  });

  describe('should throw Error', () => {
    it('for invalid algorithm numbers', () => {
      expect(() => toAlgorithm(0)).toThrow('Unsupported COSE algorithm: 0');
      expect(() => toAlgorithm(1)).toThrow('Unsupported COSE algorithm: 1');
      expect(() => toAlgorithm(-1)).toThrow('Unsupported COSE algorithm: -1');
      expect(() => toAlgorithm(-6)).toThrow('Unsupported COSE algorithm: -6');
      expect(() => toAlgorithm(-9)).toThrow('Unsupported COSE algorithm: -9');
      expect(() => toAlgorithm(999)).toThrow('Unsupported COSE algorithm: 999');
    });

    it('for MAC algorithm numbers', () => {
      expect(() => toAlgorithm(5)).toThrow('Unsupported COSE algorithm: 5'); // HS256
      expect(() => toAlgorithm(6)).toThrow('Unsupported COSE algorithm: 6'); // HS384
      expect(() => toAlgorithm(7)).toThrow('Unsupported COSE algorithm: 7'); // HS512
    });

    it('for encryption algorithm numbers', () => {
      expect(() => toAlgorithm(1)).toThrow('Unsupported COSE algorithm: 1'); // A128GCM
      expect(() => toAlgorithm(2)).toThrow('Unsupported COSE algorithm: 2'); // A192GCM
      expect(() => toAlgorithm(3)).toThrow('Unsupported COSE algorithm: 3'); // A256GCM
      expect(() => toAlgorithm(-6)).toThrow('Unsupported COSE algorithm: -6'); // Direct
    });

    it('for numbers adjacent to valid values', () => {
      expect(() => toAlgorithm(-9)).toThrow('Unsupported COSE algorithm: -9'); // Just before EdDSA
      expect(() => toAlgorithm(-6)).toThrow('Unsupported COSE algorithm: -6'); // Just after ES256
      expect(() => toAlgorithm(-34)).toThrow('Unsupported COSE algorithm: -34'); // Just before ES384
      expect(() => toAlgorithm(-37)).toThrow('Unsupported COSE algorithm: -37'); // Just after ES512
      expect(() => toAlgorithm(-24)).toThrow('Unsupported COSE algorithm: -24'); // Just before ECDH_ES_HKDF_256
      expect(() => toAlgorithm(-27)).toThrow('Unsupported COSE algorithm: -27'); // Just after ECDH_ES_HKDF_512
    });

    it('for string inputs', () => {
      expect(() => toAlgorithm('ES256')).toThrow(
        'Unsupported COSE algorithm: ES256'
      );
      expect(() => toAlgorithm('EdDSA')).toThrow(
        'Unsupported COSE algorithm: EdDSA'
      );
      expect(() => toAlgorithm('-7')).toThrow(
        'Unsupported COSE algorithm: -7'
      );
      expect(() => toAlgorithm('')).toThrow('Unsupported COSE algorithm: ');
    });

    it('for null input', () => {
      expect(() => toAlgorithm(null)).toThrow(
        'Unsupported COSE algorithm: null'
      );
    });

    it('for undefined input', () => {
      expect(() => toAlgorithm(undefined)).toThrow(
        'Unsupported COSE algorithm: undefined'
      );
    });

    it('for boolean input', () => {
      expect(() => toAlgorithm(true)).toThrow(
        'Unsupported COSE algorithm: true'
      );
      expect(() => toAlgorithm(false)).toThrow(
        'Unsupported COSE algorithm: false'
      );
    });

    it('for object input', () => {
      expect(() => toAlgorithm({})).toThrow(
        'Unsupported COSE algorithm: [object Object]'
      );
      expect(() => toAlgorithm({ alg: -7 })).toThrow(
        'Unsupported COSE algorithm: [object Object]'
      );
    });

    it('for array input', () => {
      expect(() => toAlgorithm([])).toThrow('Unsupported COSE algorithm: ');
      expect(() => toAlgorithm([-7, -8])).toThrow(
        'Unsupported COSE algorithm: -7,-8'
      );
    });

    it('for decimal numbers', () => {
      expect(() => toAlgorithm(-8.5)).toThrow(
        'Unsupported COSE algorithm: -8.5'
      );
      expect(() => toAlgorithm(-7.1)).toThrow(
        'Unsupported COSE algorithm: -7.1'
      );
    });

    it('for NaN', () => {
      expect(() => toAlgorithm(NaN)).toThrow('Unsupported COSE algorithm: NaN');
    });

    it('for Infinity', () => {
      expect(() => toAlgorithm(Infinity)).toThrow(
        'Unsupported COSE algorithm: Infinity'
      );
    });

    it('for negative Infinity', () => {
      expect(() => toAlgorithm(-Infinity)).toThrow(
        'Unsupported COSE algorithm: -Infinity'
      );
    });
  });
});

