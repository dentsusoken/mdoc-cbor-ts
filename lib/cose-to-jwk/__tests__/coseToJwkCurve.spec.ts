import { describe, it, expect } from 'vitest';
import { coseToJwkCurve } from '../coseToJwkCurve';
import { Curve } from '@/cose/types';
import { JwkCurve } from '@/jwk/types';

describe('coseToJwkCurve', () => {
  describe('valid COSE curves', () => {
    it('should convert P256 to JWK P-256 curve', () => {
      const result = coseToJwkCurve(Curve.P256);
      expect(result).toBe(JwkCurve.P256);
    });

    it('should convert P384 to JWK P-384 curve', () => {
      const result = coseToJwkCurve(Curve.P384);
      expect(result).toBe(JwkCurve.P384);
    });

    it('should convert P521 to JWK P-521 curve', () => {
      const result = coseToJwkCurve(Curve.P521);
      expect(result).toBe(JwkCurve.P521);
    });

    it('should convert Ed25519 to JWK Ed25519 curve', () => {
      const result = coseToJwkCurve(Curve.Ed25519);
      expect(result).toBe(JwkCurve.Ed25519);
    });

    it('should convert Ed448 to JWK Ed448 curve', () => {
      const result = coseToJwkCurve(Curve.Ed448);
      expect(result).toBe(JwkCurve.Ed448);
    });

    it('should convert X25519 to JWK X25519 curve', () => {
      const result = coseToJwkCurve(Curve.X25519);
      expect(result).toBe(JwkCurve.X25519);
    });

    it('should convert X448 to JWK X448 curve', () => {
      const result = coseToJwkCurve(Curve.X448);
      expect(result).toBe(JwkCurve.X448);
    });

    it('should convert numeric value 1 (P256) to JWK P-256', () => {
      const result = coseToJwkCurve(1);
      expect(result).toBe(JwkCurve.P256);
    });

    it('should convert numeric value 2 (P384) to JWK P-384', () => {
      const result = coseToJwkCurve(2);
      expect(result).toBe(JwkCurve.P384);
    });

    it('should convert numeric value 3 (P521) to JWK P-521', () => {
      const result = coseToJwkCurve(3);
      expect(result).toBe(JwkCurve.P521);
    });

    it('should convert numeric value 4 (X25519) to JWK X25519', () => {
      const result = coseToJwkCurve(4);
      expect(result).toBe(JwkCurve.X25519);
    });

    it('should convert numeric value 5 (X448) to JWK X448', () => {
      const result = coseToJwkCurve(5);
      expect(result).toBe(JwkCurve.X448);
    });

    it('should convert numeric value 6 (Ed25519) to JWK Ed25519', () => {
      const result = coseToJwkCurve(6);
      expect(result).toBe(JwkCurve.Ed25519);
    });

    it('should convert numeric value 7 (Ed448) to JWK Ed448', () => {
      const result = coseToJwkCurve(7);
      expect(result).toBe(JwkCurve.Ed448);
    });
  });

  describe('invalid curves', () => {
    it('should throw error for invalid curve number', () => {
      expect(() => coseToJwkCurve(0)).toThrow('Unsupported COSE curve: 0');
      expect(() => coseToJwkCurve(8)).toThrow('Unsupported COSE curve: 8');
      expect(() => coseToJwkCurve(999)).toThrow('Unsupported COSE curve: 999');
    });

    it('should throw error for algorithm numbers', () => {
      expect(() => coseToJwkCurve(-8)).toThrow('Unsupported COSE curve: -8'); // EdDSA
      expect(() => coseToJwkCurve(-7)).toThrow('Unsupported COSE curve: -7'); // ES256
    });

    it('should throw error for string input', () => {
      expect(() => coseToJwkCurve('P-256')).toThrow(
        'Unsupported COSE curve: P-256'
      );
      expect(() => coseToJwkCurve('Ed25519')).toThrow(
        'Unsupported COSE curve: Ed25519'
      );
      expect(() => coseToJwkCurve('1')).toThrow('Unsupported COSE curve: 1');
    });

    it('should throw error for null input', () => {
      expect(() => coseToJwkCurve(null)).toThrow(
        'Unsupported COSE curve: null'
      );
    });

    it('should throw error for undefined input', () => {
      expect(() => coseToJwkCurve(undefined)).toThrow(
        'Unsupported COSE curve: undefined'
      );
    });

    it('should throw error for boolean input', () => {
      expect(() => coseToJwkCurve(true)).toThrow(
        'Unsupported COSE curve: true'
      );
      expect(() => coseToJwkCurve(false)).toThrow(
        'Unsupported COSE curve: false'
      );
    });

    it('should throw error for object input', () => {
      expect(() => coseToJwkCurve({})).toThrow(
        'Unsupported COSE curve: [object Object]'
      );
      expect(() => coseToJwkCurve({ crv: 1 })).toThrow(
        'Unsupported COSE curve: [object Object]'
      );
    });

    it('should throw error for array input', () => {
      expect(() => coseToJwkCurve([])).toThrow('Unsupported COSE curve: ');
      expect(() => coseToJwkCurve([1, 2])).toThrow(
        'Unsupported COSE curve: 1,2'
      );
    });

    it('should throw error for decimal numbers', () => {
      expect(() => coseToJwkCurve(1.5)).toThrow('Unsupported COSE curve: 1.5');
      expect(() => coseToJwkCurve(2.1)).toThrow('Unsupported COSE curve: 2.1');
    });

    it('should throw error for NaN', () => {
      expect(() => coseToJwkCurve(NaN)).toThrow('Unsupported COSE curve: NaN');
    });

    it('should throw error for Infinity', () => {
      expect(() => coseToJwkCurve(Infinity)).toThrow(
        'Unsupported COSE curve: Infinity'
      );
    });

    it('should throw error for negative Infinity', () => {
      expect(() => coseToJwkCurve(-Infinity)).toThrow(
        'Unsupported COSE curve: -Infinity'
      );
    });
  });
});
