import { describe, it, expect } from 'vitest';
import { isKeyType } from '../isKeyType';
import { KeyType } from '../types';

describe('isKeyType', () => {
  describe('should return true', () => {
    it('for valid OKP key type', () => {
      const result = isKeyType(KeyType.OKP);
      expect(result).toBe(true);
    });

    it('for valid EC key type', () => {
      const result = isKeyType(KeyType.EC);
      expect(result).toBe(true);
    });

    it('for valid oct key type', () => {
      const result = isKeyType(KeyType.oct);
      expect(result).toBe(true);
    });

    it('for numeric value 1 (OKP)', () => {
      const result = isKeyType(1);
      expect(result).toBe(true);
    });

    it('for numeric value 2 (EC)', () => {
      const result = isKeyType(2);
      expect(result).toBe(true);
    });

    it('for numeric value 4 (oct)', () => {
      const result = isKeyType(4);
      expect(result).toBe(true);
    });

    it('for all enum values systematically', () => {
      const allKeyTypes = Object.values(KeyType).filter(
        (v) => typeof v === 'number'
      ) as KeyType[];

      allKeyTypes.forEach((keyType) => {
        expect(isKeyType(keyType)).toBe(true);
      });
    });
  });

  describe('should return false', () => {
    it('for invalid key type numbers', () => {
      expect(isKeyType(0)).toBe(false);
      expect(isKeyType(3)).toBe(false);
      expect(isKeyType(5)).toBe(false);
      expect(isKeyType(-1)).toBe(false);
      expect(isKeyType(10)).toBe(false);
    });

    it('for algorithm numbers', () => {
      expect(isKeyType(-8)).toBe(false); // EdDSA
      expect(isKeyType(-7)).toBe(false); // ES256
      expect(isKeyType(-35)).toBe(false); // ES384
      expect(isKeyType(-36)).toBe(false); // ES512
    });

    it('for zero', () => {
      const result = isKeyType(0);
      expect(result).toBe(false);
    });

    it('for very large numbers', () => {
      expect(isKeyType(100)).toBe(false);
      expect(isKeyType(1000)).toBe(false);
      expect(isKeyType(Number.MAX_SAFE_INTEGER)).toBe(false);
    });

    it('for very small numbers', () => {
      expect(isKeyType(-100)).toBe(false);
      expect(isKeyType(-1000)).toBe(false);
      expect(isKeyType(Number.MIN_SAFE_INTEGER)).toBe(false);
    });

    it('for decimal numbers', () => {
      expect(isKeyType(1.5)).toBe(false);
      expect(isKeyType(2.1)).toBe(false);
      expect(isKeyType(4.9)).toBe(false);
    });

    it('for NaN', () => {
      const result = isKeyType(NaN);
      expect(result).toBe(false);
    });

    it('for Infinity', () => {
      const result = isKeyType(Infinity);
      expect(result).toBe(false);
    });

    it('for negative Infinity', () => {
      const result = isKeyType(-Infinity);
      expect(result).toBe(false);
    });

    it('for null input', () => {
      const result = isKeyType(null);
      expect(result).toBe(false);
    });

    it('for undefined input', () => {
      const result = isKeyType(undefined);
      expect(result).toBe(false);
    });

    it('for string input', () => {
      const result = isKeyType('EC');
      expect(result).toBe(false);
    });

    it('for numeric string input', () => {
      const result = isKeyType('2' as unknown as number);
      expect(result).toBe(false);
    });

    it('for boolean input', () => {
      const result = isKeyType(true as unknown as number);
      expect(result).toBe(false);
    });

    it('for object input', () => {
      const result = isKeyType({} as unknown as number);
      expect(result).toBe(false);
    });

    it('for array input', () => {
      const result = isKeyType([] as unknown as number);
      expect(result).toBe(false);
    });

    it('for numbers adjacent to valid values', () => {
      expect(isKeyType(0)).toBe(false); // Just before OKP
      expect(isKeyType(3)).toBe(false); // Between EC and oct
      expect(isKeyType(5)).toBe(false); // Just after oct
    });
  });
});
