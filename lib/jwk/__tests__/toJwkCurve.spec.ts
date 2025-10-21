import { describe, it, expect } from 'vitest';
import { toJwkCurve } from '../toJwkCurve';
import { JwkCurve } from '../types';

describe('toJwkCurve', () => {
  describe('valid curves', () => {
    it('should return P-256 for valid P-256 curve string', () => {
      const result = toJwkCurve('P-256');
      expect(result).toBe(JwkCurve.P256);
    });

    it('should return P-384 for valid P-384 curve string', () => {
      const result = toJwkCurve('P-384');
      expect(result).toBe(JwkCurve.P384);
    });

    it('should return P-521 for valid P-521 curve string', () => {
      const result = toJwkCurve('P-521');
      expect(result).toBe(JwkCurve.P521);
    });

    it('should return Ed25519 for valid Ed25519 curve string', () => {
      const result = toJwkCurve('Ed25519');
      expect(result).toBe(JwkCurve.Ed25519);
    });

    it('should return Ed448 for valid Ed448 curve string', () => {
      const result = toJwkCurve('Ed448');
      expect(result).toBe(JwkCurve.Ed448);
    });

    it('should return X25519 for valid X25519 curve string', () => {
      const result = toJwkCurve('X25519');
      expect(result).toBe(JwkCurve.X25519);
    });

    it('should return X448 for valid X448 curve string', () => {
      const result = toJwkCurve('X448');
      expect(result).toBe(JwkCurve.X448);
    });
  });

  describe('invalid curves', () => {
    it('should throw error for invalid curve string', () => {
      expect(() => toJwkCurve('invalid-curve')).toThrow(
        'Unsupported JWK curve: invalid-curve'
      );
    });

    it('should throw error for empty string', () => {
      expect(() => toJwkCurve('')).toThrow('Unsupported JWK curve: ');
    });

    it('should throw error for case-sensitive mismatch', () => {
      expect(() => toJwkCurve('p-256')).toThrow('Unsupported JWK curve: p-256');
    });

    it('should throw error for similar but invalid curve', () => {
      expect(() => toJwkCurve('P-128')).toThrow('Unsupported JWK curve: P-128');
    });

    it('should throw error for numeric string', () => {
      expect(() => toJwkCurve('256')).toThrow('Unsupported JWK curve: 256');
    });

    it('should throw error for special characters', () => {
      expect(() => toJwkCurve('P-256!')).toThrow(
        'Unsupported JWK curve: P-256!'
      );
    });

    it('should throw error for whitespace', () => {
      expect(() => toJwkCurve(' P-256 ')).toThrow(
        'Unsupported JWK curve:  P-256 '
      );
    });

    it('should throw error for null-like string', () => {
      expect(() => toJwkCurve('null')).toThrow('Unsupported JWK curve: null');
    });

    it('should throw error for undefined-like string', () => {
      expect(() => toJwkCurve('undefined')).toThrow(
        'Unsupported JWK curve: undefined'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle all valid JwkCurves enum values', () => {
      const validCurves = Object.values(JwkCurve);

      validCurves.forEach((curve) => {
        const result = toJwkCurve(curve);
        expect(result).toBe(curve);
      });
    });

    it('should return the same reference for valid curves', () => {
      const curve = 'P-256';
      const result1 = toJwkCurve(curve);
      const result2 = toJwkCurve(curve);
      expect(result1).toBe(result2);
    });
  });
});
