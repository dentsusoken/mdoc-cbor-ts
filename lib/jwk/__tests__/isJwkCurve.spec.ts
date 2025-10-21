import { describe, it, expect } from 'vitest';
import { isJwkCurve } from '../isJwkCurve';
import { JwkCurve } from '../types';

describe('isJwkCurve', () => {
  describe('should return true', () => {
    it('for valid P-256 curve', () => {
      const result = isJwkCurve('P-256');
      expect(result).toBe(true);
    });

    it('for valid P-384 curve', () => {
      const result = isJwkCurve('P-384');
      expect(result).toBe(true);
    });

    it('for valid P-521 curve', () => {
      const result = isJwkCurve('P-521');
      expect(result).toBe(true);
    });

    it('for valid Ed25519 curve', () => {
      const result = isJwkCurve('Ed25519');
      expect(result).toBe(true);
    });

    it('for valid Ed448 curve', () => {
      const result = isJwkCurve('Ed448');
      expect(result).toBe(true);
    });

    it('for valid X25519 curve', () => {
      const result = isJwkCurve('X25519');
      expect(result).toBe(true);
    });

    it('for valid X448 curve', () => {
      const result = isJwkCurve('X448');
      expect(result).toBe(true);
    });

    it('for enum values', () => {
      expect(isJwkCurve(JwkCurve.P256)).toBe(true);
      expect(isJwkCurve(JwkCurve.P384)).toBe(true);
      expect(isJwkCurve(JwkCurve.P521)).toBe(true);
      expect(isJwkCurve(JwkCurve.Ed25519)).toBe(true);
      expect(isJwkCurve(JwkCurve.Ed448)).toBe(true);
      expect(isJwkCurve(JwkCurve.X25519)).toBe(true);
      expect(isJwkCurve(JwkCurve.X448)).toBe(true);
    });

    it('for all enum values correctly', () => {
      const allCurves = Object.values(JwkCurve);

      allCurves.forEach((curve) => {
        expect(isJwkCurve(curve)).toBe(true);
      });
    });
  });

  describe('should return false', () => {
    it('for invalid curve names', () => {
      expect(isJwkCurve('invalid-curve')).toBe(false);
      expect(isJwkCurve('P-128')).toBe(false);
      expect(isJwkCurve('P-512')).toBe(false);
      expect(isJwkCurve('Ed256')).toBe(false);
      expect(isJwkCurve('X256')).toBe(false);
    });

    it('for empty string', () => {
      const result = isJwkCurve('');
      expect(result).toBe(false);
    });

    it('for null input', () => {
      const result = isJwkCurve(null as unknown as string);
      expect(result).toBe(false);
    });

    it('for undefined input', () => {
      const result = isJwkCurve(undefined as unknown as string);
      expect(result).toBe(false);
    });

    it('for incorrect case sensitivity', () => {
      expect(isJwkCurve('p-256')).toBe(false);
      expect(isJwkCurve('ed25519')).toBe(false);
      expect(isJwkCurve('x25519')).toBe(false);
    });

    it('for numeric input', () => {
      const result = isJwkCurve(123 as unknown as string);
      expect(result).toBe(false);
    });

    it('for boolean input', () => {
      const result = isJwkCurve(true as unknown as string);
      expect(result).toBe(false);
    });

    it('for object input', () => {
      const result = isJwkCurve({} as unknown as string);
      expect(result).toBe(false);
    });

    it('for array input', () => {
      const result = isJwkCurve([] as unknown as string);
      expect(result).toBe(false);
    });

    it('for partial matches', () => {
      expect(isJwkCurve('P-')).toBe(false);
      expect(isJwkCurve('256')).toBe(false);
      expect(isJwkCurve('Ed')).toBe(false);
      expect(isJwkCurve('25519')).toBe(false);
    });
  });
});
