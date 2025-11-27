import { describe, it, expect } from 'vitest';
import { isCoseMacAlgorithm } from '../isMacAlgorithm';
import { MacAlgorithm } from '../types';

describe('isCoseMacAlgorithm', () => {
  describe('should return true', () => {
    it('for valid HS256 algorithm', () => {
      const result = isCoseMacAlgorithm(MacAlgorithm.HS256);
      expect(result).toBe(true);
    });

    it('for valid HS384 algorithm', () => {
      const result = isCoseMacAlgorithm(MacAlgorithm.HS384);
      expect(result).toBe(true);
    });

    it('for valid HS512 algorithm', () => {
      const result = isCoseMacAlgorithm(MacAlgorithm.HS512);
      expect(result).toBe(true);
    });

    it('for numeric value 5 (HS256)', () => {
      const result = isCoseMacAlgorithm(5);
      expect(result).toBe(true);
    });

    it('for numeric value 6 (HS384)', () => {
      const result = isCoseMacAlgorithm(6);
      expect(result).toBe(true);
    });

    it('for numeric value 7 (HS512)', () => {
      const result = isCoseMacAlgorithm(7);
      expect(result).toBe(true);
    });

    it('for enum values', () => {
      expect(isCoseMacAlgorithm(MacAlgorithm.HS256)).toBe(true);
      expect(isCoseMacAlgorithm(MacAlgorithm.HS384)).toBe(true);
      expect(isCoseMacAlgorithm(MacAlgorithm.HS512)).toBe(true);
    });

    it('for all enum values systematically', () => {
      const allAlgorithms = Object.values(MacAlgorithm).filter(
        (v) => typeof v === 'number'
      ) as MacAlgorithm[];

      allAlgorithms.forEach((algorithm) => {
        expect(isCoseMacAlgorithm(algorithm)).toBe(true);
      });
    });
  });

  describe('should return false', () => {
    it('for invalid algorithm numbers', () => {
      expect(isCoseMacAlgorithm(0)).toBe(false);
      expect(isCoseMacAlgorithm(1)).toBe(false);
      expect(isCoseMacAlgorithm(2)).toBe(false);
      expect(isCoseMacAlgorithm(3)).toBe(false);
      expect(isCoseMacAlgorithm(4)).toBe(false);
      expect(isCoseMacAlgorithm(8)).toBe(false);
      expect(isCoseMacAlgorithm(9)).toBe(false);
      expect(isCoseMacAlgorithm(10)).toBe(false);
    });

    it('for signature algorithm numbers', () => {
      expect(isCoseMacAlgorithm(-7)).toBe(false); // ES256
      expect(isCoseMacAlgorithm(-8)).toBe(false); // EdDSA
      expect(isCoseMacAlgorithm(-35)).toBe(false); // ES384
      expect(isCoseMacAlgorithm(-36)).toBe(false); // ES512
    });

    it('for encryption algorithm numbers', () => {
      expect(isCoseMacAlgorithm(1)).toBe(false); // A128GCM
      expect(isCoseMacAlgorithm(2)).toBe(false); // A192GCM
      expect(isCoseMacAlgorithm(3)).toBe(false); // A256GCM
      expect(isCoseMacAlgorithm(-6)).toBe(false); // Direct
    });

    it('for zero', () => {
      const result = isCoseMacAlgorithm(0);
      expect(result).toBe(false);
    });

    it('for negative one', () => {
      const result = isCoseMacAlgorithm(-1);
      expect(result).toBe(false);
    });

    it('for very large numbers', () => {
      expect(isCoseMacAlgorithm(100)).toBe(false);
      expect(isCoseMacAlgorithm(1000)).toBe(false);
      expect(isCoseMacAlgorithm(Number.MAX_SAFE_INTEGER)).toBe(false);
    });

    it('for very small numbers', () => {
      expect(isCoseMacAlgorithm(-100)).toBe(false);
      expect(isCoseMacAlgorithm(-1000)).toBe(false);
      expect(isCoseMacAlgorithm(Number.MIN_SAFE_INTEGER)).toBe(false);
    });

    it('for decimal numbers', () => {
      expect(isCoseMacAlgorithm(5.5)).toBe(false);
      expect(isCoseMacAlgorithm(6.1)).toBe(false);
      expect(isCoseMacAlgorithm(7.9)).toBe(false);
    });

    it('for NaN', () => {
      const result = isCoseMacAlgorithm(NaN);
      expect(result).toBe(false);
    });

    it('for Infinity', () => {
      const result = isCoseMacAlgorithm(Infinity);
      expect(result).toBe(false);
    });

    it('for negative Infinity', () => {
      const result = isCoseMacAlgorithm(-Infinity);
      expect(result).toBe(false);
    });

    it('for null input', () => {
      const result = isCoseMacAlgorithm(null as unknown as number);
      expect(result).toBe(false);
    });

    it('for undefined input', () => {
      const result = isCoseMacAlgorithm(undefined as unknown as number);
      expect(result).toBe(false);
    });

    it('for string input', () => {
      const result = isCoseMacAlgorithm('5' as unknown as number);
      expect(result).toBe(false);
    });

    it('for boolean input', () => {
      const result = isCoseMacAlgorithm(true as unknown as number);
      expect(result).toBe(false);
    });

    it('for object input', () => {
      const result = isCoseMacAlgorithm({} as unknown as number);
      expect(result).toBe(false);
    });

    it('for array input', () => {
      const result = isCoseMacAlgorithm([] as unknown as number);
      expect(result).toBe(false);
    });

    it('for numbers adjacent to valid values', () => {
      expect(isCoseMacAlgorithm(4)).toBe(false); // Just before HS256
      expect(isCoseMacAlgorithm(8)).toBe(false); // Just after HS512
    });
  });
});
