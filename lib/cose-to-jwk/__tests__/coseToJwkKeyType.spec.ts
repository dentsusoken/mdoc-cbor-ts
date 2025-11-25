import { describe, it, expect } from 'vitest';
import { coseToJwkKeyType } from '../coseToJwkKeyType';
import { KeyType } from '@/cose/types';
import { JwkKeyType } from '@/jwk/types';

describe('coseToJwkKeyType', () => {
  describe('valid COSE key types', () => {
    it('should convert OKP to JWK OKP key type', () => {
      const result = coseToJwkKeyType(KeyType.OKP);
      expect(result).toBe(JwkKeyType.OKP);
    });

    it('should convert EC to JWK EC key type', () => {
      const result = coseToJwkKeyType(KeyType.EC);
      expect(result).toBe(JwkKeyType.EC);
    });

    it('should convert oct to JWK oct key type', () => {
      const result = coseToJwkKeyType(KeyType.oct);
      expect(result).toBe(JwkKeyType.oct);
    });

    it('should convert numeric value 1 (OKP) to JWK OKP', () => {
      const result = coseToJwkKeyType(1);
      expect(result).toBe(JwkKeyType.OKP);
    });

    it('should convert numeric value 2 (EC) to JWK EC', () => {
      const result = coseToJwkKeyType(2);
      expect(result).toBe(JwkKeyType.EC);
    });

    it('should convert numeric value 4 (oct) to JWK oct', () => {
      const result = coseToJwkKeyType(4);
      expect(result).toBe(JwkKeyType.oct);
    });
  });

  describe('invalid key types', () => {
    it('should throw error for invalid key type number', () => {
      expect(() => coseToJwkKeyType(0)).toThrow('Unsupported COSE key type: 0');
      expect(() => coseToJwkKeyType(3)).toThrow('Unsupported COSE key type: 3');
      expect(() => coseToJwkKeyType(5)).toThrow('Unsupported COSE key type: 5');
      expect(() => coseToJwkKeyType(999)).toThrow(
        'Unsupported COSE key type: 999'
      );
    });

    it('should throw error for algorithm numbers', () => {
      expect(() => coseToJwkKeyType(-8)).toThrow(
        'Unsupported COSE key type: -8'
      ); // EdDSA
      expect(() => coseToJwkKeyType(-7)).toThrow(
        'Unsupported COSE key type: -7'
      ); // ES256
    });

    it('should throw error for string input', () => {
      expect(() => coseToJwkKeyType('EC')).toThrow(
        'Unsupported COSE key type: EC'
      );
      expect(() => coseToJwkKeyType('OKP')).toThrow(
        'Unsupported COSE key type: OKP'
      );
      expect(() => coseToJwkKeyType('oct')).toThrow(
        'Unsupported COSE key type: oct'
      );
      expect(() => coseToJwkKeyType('1')).toThrow(
        'Unsupported COSE key type: 1'
      );
    });

    it('should throw error for null input', () => {
      expect(() => coseToJwkKeyType(null)).toThrow(
        'Unsupported COSE key type: null'
      );
    });

    it('should throw error for undefined input', () => {
      expect(() => coseToJwkKeyType(undefined)).toThrow(
        'Unsupported COSE key type: undefined'
      );
    });

    it('should throw error for boolean input', () => {
      expect(() => coseToJwkKeyType(true)).toThrow(
        'Unsupported COSE key type: true'
      );
      expect(() => coseToJwkKeyType(false)).toThrow(
        'Unsupported COSE key type: false'
      );
    });

    it('should throw error for object input', () => {
      expect(() => coseToJwkKeyType({})).toThrow(
        'Unsupported COSE key type: [object Object]'
      );
      expect(() => coseToJwkKeyType({ kty: 2 })).toThrow(
        'Unsupported COSE key type: [object Object]'
      );
    });

    it('should throw error for array input', () => {
      expect(() => coseToJwkKeyType([])).toThrow('Unsupported COSE key type: ');
      expect(() => coseToJwkKeyType([1, 2])).toThrow(
        'Unsupported COSE key type: 1,2'
      );
    });

    it('should throw error for decimal numbers', () => {
      expect(() => coseToJwkKeyType(1.5)).toThrow(
        'Unsupported COSE key type: 1.5'
      );
      expect(() => coseToJwkKeyType(2.1)).toThrow(
        'Unsupported COSE key type: 2.1'
      );
      expect(() => coseToJwkKeyType(4.9)).toThrow(
        'Unsupported COSE key type: 4.9'
      );
    });

    it('should throw error for NaN', () => {
      expect(() => coseToJwkKeyType(NaN)).toThrow(
        'Unsupported COSE key type: NaN'
      );
    });

    it('should throw error for Infinity', () => {
      expect(() => coseToJwkKeyType(Infinity)).toThrow(
        'Unsupported COSE key type: Infinity'
      );
    });

    it('should throw error for negative Infinity', () => {
      expect(() => coseToJwkKeyType(-Infinity)).toThrow(
        'Unsupported COSE key type: -Infinity'
      );
    });
  });
});
