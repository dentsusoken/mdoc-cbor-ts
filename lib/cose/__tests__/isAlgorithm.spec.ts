import { describe, it, expect } from 'vitest';
import { isAlgorithm } from '../isAlgorithm';
import { Algorithm } from '../types';

describe('isAlgorithm', () => {
  describe('should return true', () => {
    it('for valid EdDSA algorithm', () => {
      const result = isAlgorithm(Algorithm.EdDSA);
      expect(result).toBe(true);
    });

    it('for valid ES256 algorithm', () => {
      const result = isAlgorithm(Algorithm.ES256);
      expect(result).toBe(true);
    });

    it('for valid ES384 algorithm', () => {
      const result = isAlgorithm(Algorithm.ES384);
      expect(result).toBe(true);
    });

    it('for valid ES512 algorithm', () => {
      const result = isAlgorithm(Algorithm.ES512);
      expect(result).toBe(true);
    });

    it('for valid ECDH_ES_HKDF_256 algorithm', () => {
      const result = isAlgorithm(Algorithm.ECDH_ES_HKDF_256);
      expect(result).toBe(true);
    });

    it('for valid ECDH_ES_HKDF_512 algorithm', () => {
      const result = isAlgorithm(Algorithm.ECDH_ES_HKDF_512);
      expect(result).toBe(true);
    });

    it('for numeric value -8 (EdDSA)', () => {
      const result = isAlgorithm(-8);
      expect(result).toBe(true);
    });

    it('for numeric value -7 (ES256)', () => {
      const result = isAlgorithm(-7);
      expect(result).toBe(true);
    });

    it('for numeric value -35 (ES384)', () => {
      const result = isAlgorithm(-35);
      expect(result).toBe(true);
    });

    it('for numeric value -36 (ES512)', () => {
      const result = isAlgorithm(-36);
      expect(result).toBe(true);
    });

    it('for numeric value -25 (ECDH_ES_HKDF_256)', () => {
      const result = isAlgorithm(-25);
      expect(result).toBe(true);
    });

    it('for numeric value -26 (ECDH_ES_HKDF_512)', () => {
      const result = isAlgorithm(-26);
      expect(result).toBe(true);
    });

    it('for all enum values systematically', () => {
      const allAlgorithms = Object.values(Algorithm).filter(
        (v) => typeof v === 'number'
      ) as Algorithm[];

      allAlgorithms.forEach((algorithm) => {
        expect(isAlgorithm(algorithm)).toBe(true);
      });
    });
  });

  describe('should return false', () => {
    it('for invalid algorithm numbers', () => {
      expect(isAlgorithm(0)).toBe(false);
      expect(isAlgorithm(1)).toBe(false);
      expect(isAlgorithm(-1)).toBe(false);
      expect(isAlgorithm(-6)).toBe(false);
      expect(isAlgorithm(-9)).toBe(false);
      expect(isAlgorithm(-24)).toBe(false);
      expect(isAlgorithm(-27)).toBe(false);
    });

    it('for MAC algorithm numbers', () => {
      expect(isAlgorithm(5)).toBe(false); // HS256
      expect(isAlgorithm(6)).toBe(false); // HS384
      expect(isAlgorithm(7)).toBe(false); // HS512
    });

    it('for encryption algorithm numbers', () => {
      expect(isAlgorithm(1)).toBe(false); // A128GCM
      expect(isAlgorithm(2)).toBe(false); // A192GCM
      expect(isAlgorithm(3)).toBe(false); // A256GCM
      expect(isAlgorithm(-6)).toBe(false); // Direct
    });

    it('for zero', () => {
      const result = isAlgorithm(0);
      expect(result).toBe(false);
    });

    it('for very large numbers', () => {
      expect(isAlgorithm(100)).toBe(false);
      expect(isAlgorithm(1000)).toBe(false);
      expect(isAlgorithm(Number.MAX_SAFE_INTEGER)).toBe(false);
    });

    it('for very small numbers', () => {
      expect(isAlgorithm(-100)).toBe(false);
      expect(isAlgorithm(-1000)).toBe(false);
      expect(isAlgorithm(Number.MIN_SAFE_INTEGER)).toBe(false);
    });

    it('for decimal numbers', () => {
      expect(isAlgorithm(-8.5)).toBe(false);
      expect(isAlgorithm(-7.1)).toBe(false);
      expect(isAlgorithm(-35.9)).toBe(false);
    });

    it('for NaN', () => {
      const result = isAlgorithm(NaN);
      expect(result).toBe(false);
    });

    it('for Infinity', () => {
      const result = isAlgorithm(Infinity);
      expect(result).toBe(false);
    });

    it('for negative Infinity', () => {
      const result = isAlgorithm(-Infinity);
      expect(result).toBe(false);
    });

    it('for null input', () => {
      const result = isAlgorithm(null);
      expect(result).toBe(false);
    });

    it('for undefined input', () => {
      const result = isAlgorithm(undefined);
      expect(result).toBe(false);
    });

    it('for string input', () => {
      const result = isAlgorithm('ES256');
      expect(result).toBe(false);
    });

    it('for numeric string input', () => {
      const result = isAlgorithm('-7' as unknown as number);
      expect(result).toBe(false);
    });

    it('for boolean input', () => {
      const result = isAlgorithm(true as unknown as number);
      expect(result).toBe(false);
    });

    it('for object input', () => {
      const result = isAlgorithm({} as unknown as number);
      expect(result).toBe(false);
    });

    it('for array input', () => {
      const result = isAlgorithm([] as unknown as number);
      expect(result).toBe(false);
    });

    it('for numbers adjacent to valid values', () => {
      expect(isAlgorithm(-9)).toBe(false); // Just before EdDSA
      expect(isAlgorithm(-6)).toBe(false); // Just after ES256
      expect(isAlgorithm(-34)).toBe(false); // Just before ES384
      expect(isAlgorithm(-37)).toBe(false); // Just after ES512
      expect(isAlgorithm(-24)).toBe(false); // Just before ECDH_ES_HKDF_256
      expect(isAlgorithm(-27)).toBe(false); // Just after ECDH_ES_HKDF_512
    });
  });
});
