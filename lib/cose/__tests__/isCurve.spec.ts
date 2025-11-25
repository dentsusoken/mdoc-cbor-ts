import { describe, it, expect } from 'vitest';
import { isCurve } from '../isCurve';
import { Curve } from '../types';

describe('isCurve', () => {
  describe('should return true', () => {
    it('for valid P256 curve', () => {
      const result = isCurve(Curve.P256);
      expect(result).toBe(true);
    });

    it('for valid P384 curve', () => {
      const result = isCurve(Curve.P384);
      expect(result).toBe(true);
    });

    it('for valid P521 curve', () => {
      const result = isCurve(Curve.P521);
      expect(result).toBe(true);
    });

    it('for valid X25519 curve', () => {
      const result = isCurve(Curve.X25519);
      expect(result).toBe(true);
    });

    it('for valid X448 curve', () => {
      const result = isCurve(Curve.X448);
      expect(result).toBe(true);
    });

    it('for valid Ed25519 curve', () => {
      const result = isCurve(Curve.Ed25519);
      expect(result).toBe(true);
    });

    it('for valid Ed448 curve', () => {
      const result = isCurve(Curve.Ed448);
      expect(result).toBe(true);
    });

    it('for numeric value 1 (P256)', () => {
      const result = isCurve(1);
      expect(result).toBe(true);
    });

    it('for numeric value 2 (P384)', () => {
      const result = isCurve(2);
      expect(result).toBe(true);
    });

    it('for numeric value 3 (P521)', () => {
      const result = isCurve(3);
      expect(result).toBe(true);
    });

    it('for numeric value 4 (X25519)', () => {
      const result = isCurve(4);
      expect(result).toBe(true);
    });

    it('for numeric value 5 (X448)', () => {
      const result = isCurve(5);
      expect(result).toBe(true);
    });

    it('for numeric value 6 (Ed25519)', () => {
      const result = isCurve(6);
      expect(result).toBe(true);
    });

    it('for numeric value 7 (Ed448)', () => {
      const result = isCurve(7);
      expect(result).toBe(true);
    });

    it('for all enum values systematically', () => {
      const allCurves = Object.values(Curve).filter(
        (v) => typeof v === 'number'
      ) as Curve[];

      allCurves.forEach((curve) => {
        expect(isCurve(curve)).toBe(true);
      });
    });
  });

  describe('should return false', () => {
    it('for invalid curve numbers', () => {
      expect(isCurve(0)).toBe(false);
      expect(isCurve(8)).toBe(false);
      expect(isCurve(-1)).toBe(false);
      expect(isCurve(10)).toBe(false);
    });

    it('for algorithm numbers', () => {
      expect(isCurve(-8)).toBe(false); // EdDSA
      expect(isCurve(-7)).toBe(false); // ES256
      expect(isCurve(-35)).toBe(false); // ES384
      expect(isCurve(-36)).toBe(false); // ES512
    });

    it('for zero', () => {
      const result = isCurve(0);
      expect(result).toBe(false);
    });

    it('for very large numbers', () => {
      expect(isCurve(100)).toBe(false);
      expect(isCurve(1000)).toBe(false);
      expect(isCurve(Number.MAX_SAFE_INTEGER)).toBe(false);
    });

    it('for very small numbers', () => {
      expect(isCurve(-100)).toBe(false);
      expect(isCurve(-1000)).toBe(false);
      expect(isCurve(Number.MIN_SAFE_INTEGER)).toBe(false);
    });

    it('for decimal numbers', () => {
      expect(isCurve(1.5)).toBe(false);
      expect(isCurve(2.1)).toBe(false);
      expect(isCurve(3.9)).toBe(false);
    });

    it('for NaN', () => {
      const result = isCurve(NaN);
      expect(result).toBe(false);
    });

    it('for Infinity', () => {
      const result = isCurve(Infinity);
      expect(result).toBe(false);
    });

    it('for negative Infinity', () => {
      const result = isCurve(-Infinity);
      expect(result).toBe(false);
    });

    it('for null input', () => {
      const result = isCurve(null);
      expect(result).toBe(false);
    });

    it('for undefined input', () => {
      const result = isCurve(undefined);
      expect(result).toBe(false);
    });

    it('for string input', () => {
      const result = isCurve('P-256');
      expect(result).toBe(false);
    });

    it('for numeric string input', () => {
      const result = isCurve('1' as unknown as number);
      expect(result).toBe(false);
    });

    it('for boolean input', () => {
      const result = isCurve(true as unknown as number);
      expect(result).toBe(false);
    });

    it('for object input', () => {
      const result = isCurve({} as unknown as number);
      expect(result).toBe(false);
    });

    it('for array input', () => {
      const result = isCurve([] as unknown as number);
      expect(result).toBe(false);
    });

    it('for numbers adjacent to valid values', () => {
      expect(isCurve(0)).toBe(false); // Just before P256
      expect(isCurve(8)).toBe(false); // Just after Ed448
    });
  });
});
