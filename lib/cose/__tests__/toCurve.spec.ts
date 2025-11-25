import { describe, it, expect } from 'vitest';
import { toCurve } from '../toCurve';
import { Curve } from '../types';

describe('toCurve', () => {
  describe('should return valid Curves', () => {
    it('for valid Curve enum values', () => {
      expect(toCurve(Curve.P256)).toBe(Curve.P256);
      expect(toCurve(Curve.P384)).toBe(Curve.P384);
      expect(toCurve(Curve.P521)).toBe(Curve.P521);
      expect(toCurve(Curve.X25519)).toBe(Curve.X25519);
      expect(toCurve(Curve.X448)).toBe(Curve.X448);
      expect(toCurve(Curve.Ed25519)).toBe(Curve.Ed25519);
      expect(toCurve(Curve.Ed448)).toBe(Curve.Ed448);
    });

    it('for numeric values that match Curves', () => {
      expect(toCurve(1)).toBe(Curve.P256);
      expect(toCurve(2)).toBe(Curve.P384);
      expect(toCurve(3)).toBe(Curve.P521);
      expect(toCurve(4)).toBe(Curve.X25519);
      expect(toCurve(5)).toBe(Curve.X448);
      expect(toCurve(6)).toBe(Curve.Ed25519);
      expect(toCurve(7)).toBe(Curve.Ed448);
    });

    it('for all enum values systematically', () => {
      const allCurves = Object.values(Curve).filter(
        (v) => typeof v === 'number'
      ) as Curve[];

      allCurves.forEach((curve) => {
        expect(toCurve(curve)).toBe(curve);
      });
    });
  });

  describe('should throw Error', () => {
    it('for invalid curve numbers', () => {
      expect(() => toCurve(0)).toThrow('Unsupported COSE curve: 0');
      expect(() => toCurve(8)).toThrow('Unsupported COSE curve: 8');
      expect(() => toCurve(-1)).toThrow('Unsupported COSE curve: -1');
      expect(() => toCurve(10)).toThrow('Unsupported COSE curve: 10');
      expect(() => toCurve(999)).toThrow('Unsupported COSE curve: 999');
    });

    it('for algorithm numbers', () => {
      expect(() => toCurve(-8)).toThrow('Unsupported COSE curve: -8'); // EdDSA
      expect(() => toCurve(-7)).toThrow('Unsupported COSE curve: -7'); // ES256
      expect(() => toCurve(-35)).toThrow('Unsupported COSE curve: -35'); // ES384
      expect(() => toCurve(-36)).toThrow('Unsupported COSE curve: -36'); // ES512
    });

    it('for numbers adjacent to valid values', () => {
      expect(() => toCurve(0)).toThrow('Unsupported COSE curve: 0'); // Just before P256
      expect(() => toCurve(8)).toThrow('Unsupported COSE curve: 8'); // Just after Ed448
    });

    it('for string inputs', () => {
      expect(() => toCurve('P-256')).toThrow('Unsupported COSE curve: P-256');
      expect(() => toCurve('Ed25519')).toThrow(
        'Unsupported COSE curve: Ed25519'
      );
      expect(() => toCurve('1')).toThrow('Unsupported COSE curve: 1');
      expect(() => toCurve('')).toThrow('Unsupported COSE curve: ');
    });

    it('for null input', () => {
      expect(() => toCurve(null)).toThrow('Unsupported COSE curve: null');
    });

    it('for undefined input', () => {
      expect(() => toCurve(undefined)).toThrow(
        'Unsupported COSE curve: undefined'
      );
    });

    it('for boolean input', () => {
      expect(() => toCurve(true)).toThrow('Unsupported COSE curve: true');
      expect(() => toCurve(false)).toThrow('Unsupported COSE curve: false');
    });

    it('for object input', () => {
      expect(() => toCurve({})).toThrow(
        'Unsupported COSE curve: [object Object]'
      );
      expect(() => toCurve({ crv: 1 })).toThrow(
        'Unsupported COSE curve: [object Object]'
      );
    });

    it('for array input', () => {
      expect(() => toCurve([])).toThrow('Unsupported COSE curve: ');
      expect(() => toCurve([1, 2])).toThrow('Unsupported COSE curve: 1,2');
    });

    it('for decimal numbers', () => {
      expect(() => toCurve(1.5)).toThrow('Unsupported COSE curve: 1.5');
      expect(() => toCurve(2.1)).toThrow('Unsupported COSE curve: 2.1');
      expect(() => toCurve(3.9)).toThrow('Unsupported COSE curve: 3.9');
    });

    it('for NaN', () => {
      expect(() => toCurve(NaN)).toThrow('Unsupported COSE curve: NaN');
    });

    it('for Infinity', () => {
      expect(() => toCurve(Infinity)).toThrow(
        'Unsupported COSE curve: Infinity'
      );
    });

    it('for negative Infinity', () => {
      expect(() => toCurve(-Infinity)).toThrow(
        'Unsupported COSE curve: -Infinity'
      );
    });
  });
});
