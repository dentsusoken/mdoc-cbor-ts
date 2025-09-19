import { describe, it, expect } from 'vitest';
import { jwkToCoseCurve } from '../jwkToCoseCurve';
import { Curves } from '../types';

describe('jwkToCoseCurve', () => {
  describe('valid JWK curves', () => {
    it('should convert P-256 to COSE P256 curve', () => {
      const result = jwkToCoseCurve('P-256');
      expect(result).toBe(Curves.P256);
    });

    it('should convert P-384 to COSE P384 curve', () => {
      const result = jwkToCoseCurve('P-384');
      expect(result).toBe(Curves.P384);
    });

    it('should convert P-521 to COSE P521 curve', () => {
      const result = jwkToCoseCurve('P-521');
      expect(result).toBe(Curves.P521);
    });

    it('should convert Ed25519 to COSE Ed25519 curve', () => {
      const result = jwkToCoseCurve('Ed25519');
      expect(result).toBe(Curves.Ed25519);
    });

    it('should convert Ed448 to COSE Ed448 curve', () => {
      const result = jwkToCoseCurve('Ed448');
      expect(result).toBe(Curves.Ed448);
    });

    it('should convert X25519 to COSE X25519 curve', () => {
      const result = jwkToCoseCurve('X25519');
      expect(result).toBe(Curves.X25519);
    });

    it('should convert X448 to COSE X448 curve', () => {
      const result = jwkToCoseCurve('X448');
      expect(result).toBe(Curves.X448);
    });
  });

  describe('invalid curves', () => {
    it('should throw error for invalid curve string', () => {
      expect(() => jwkToCoseCurve('invalid-curve')).toThrow(
        'Unsupported JWK curve: invalid-curve'
      );
    });

    it('should throw error for empty string', () => {
      expect(() => jwkToCoseCurve('')).toThrow('Unsupported JWK curve: ');
    });

    it('should throw error for case-sensitive mismatch', () => {
      expect(() => jwkToCoseCurve('p-256')).toThrow(
        'Unsupported JWK curve: p-256'
      );
    });

    it('should throw error for similar but invalid curve', () => {
      expect(() => jwkToCoseCurve('P-128')).toThrow(
        'Unsupported JWK curve: P-128'
      );
    });

    it('should throw error for numeric string', () => {
      expect(() => jwkToCoseCurve('256')).toThrow('Unsupported JWK curve: 256');
    });

    it('should throw error for special characters', () => {
      expect(() => jwkToCoseCurve('P-256!')).toThrow(
        'Unsupported JWK curve: P-256!'
      );
    });

    it('should throw error for whitespace', () => {
      expect(() => jwkToCoseCurve(' P-256 ')).toThrow(
        'Unsupported JWK curve:  P-256 '
      );
    });
  });
});
