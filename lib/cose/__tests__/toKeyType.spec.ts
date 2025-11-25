import { describe, it, expect } from 'vitest';
import { toKeyType } from '../toKeyType';
import { KeyType } from '../types';

describe('toKeyType', () => {
  describe('should return valid KeyTypes', () => {
    it('for valid KeyType enum values', () => {
      expect(toKeyType(KeyType.OKP)).toBe(KeyType.OKP);
      expect(toKeyType(KeyType.EC)).toBe(KeyType.EC);
      expect(toKeyType(KeyType.oct)).toBe(KeyType.oct);
    });

    it('for numeric values that match KeyTypes', () => {
      expect(toKeyType(1)).toBe(KeyType.OKP);
      expect(toKeyType(2)).toBe(KeyType.EC);
      expect(toKeyType(4)).toBe(KeyType.oct);
    });

    it('for all enum values systematically', () => {
      const allKeyTypes = Object.values(KeyType).filter(
        (v) => typeof v === 'number'
      ) as KeyType[];

      allKeyTypes.forEach((keyType) => {
        expect(toKeyType(keyType)).toBe(keyType);
      });
    });
  });

  describe('should throw Error', () => {
    it('for invalid key type numbers', () => {
      expect(() => toKeyType(0)).toThrow('Unsupported COSE key type: 0');
      expect(() => toKeyType(3)).toThrow('Unsupported COSE key type: 3');
      expect(() => toKeyType(5)).toThrow('Unsupported COSE key type: 5');
      expect(() => toKeyType(-1)).toThrow('Unsupported COSE key type: -1');
      expect(() => toKeyType(10)).toThrow('Unsupported COSE key type: 10');
      expect(() => toKeyType(999)).toThrow('Unsupported COSE key type: 999');
    });

    it('for algorithm numbers', () => {
      expect(() => toKeyType(-8)).toThrow('Unsupported COSE key type: -8'); // EdDSA
      expect(() => toKeyType(-7)).toThrow('Unsupported COSE key type: -7'); // ES256
      expect(() => toKeyType(-35)).toThrow('Unsupported COSE key type: -35'); // ES384
      expect(() => toKeyType(-36)).toThrow('Unsupported COSE key type: -36'); // ES512
    });

    it('for numbers adjacent to valid values', () => {
      expect(() => toKeyType(0)).toThrow('Unsupported COSE key type: 0'); // Just before OKP
      expect(() => toKeyType(3)).toThrow('Unsupported COSE key type: 3'); // Between EC and oct
      expect(() => toKeyType(5)).toThrow('Unsupported COSE key type: 5'); // Just after oct
    });

    it('for string inputs', () => {
      expect(() => toKeyType('EC')).toThrow('Unsupported COSE key type: EC');
      expect(() => toKeyType('OKP')).toThrow('Unsupported COSE key type: OKP');
      expect(() => toKeyType('oct')).toThrow('Unsupported COSE key type: oct');
      expect(() => toKeyType('1')).toThrow('Unsupported COSE key type: 1');
      expect(() => toKeyType('')).toThrow('Unsupported COSE key type: ');
    });

    it('for null input', () => {
      expect(() => toKeyType(null)).toThrow('Unsupported COSE key type: null');
    });

    it('for undefined input', () => {
      expect(() => toKeyType(undefined)).toThrow(
        'Unsupported COSE key type: undefined'
      );
    });

    it('for boolean input', () => {
      expect(() => toKeyType(true)).toThrow('Unsupported COSE key type: true');
      expect(() => toKeyType(false)).toThrow(
        'Unsupported COSE key type: false'
      );
    });

    it('for object input', () => {
      expect(() => toKeyType({})).toThrow(
        'Unsupported COSE key type: [object Object]'
      );
      expect(() => toKeyType({ kty: 2 })).toThrow(
        'Unsupported COSE key type: [object Object]'
      );
    });

    it('for array input', () => {
      expect(() => toKeyType([])).toThrow('Unsupported COSE key type: ');
      expect(() => toKeyType([1, 2])).toThrow('Unsupported COSE key type: 1,2');
    });

    it('for decimal numbers', () => {
      expect(() => toKeyType(1.5)).toThrow('Unsupported COSE key type: 1.5');
      expect(() => toKeyType(2.1)).toThrow('Unsupported COSE key type: 2.1');
      expect(() => toKeyType(4.9)).toThrow('Unsupported COSE key type: 4.9');
    });

    it('for NaN', () => {
      expect(() => toKeyType(NaN)).toThrow('Unsupported COSE key type: NaN');
    });

    it('for Infinity', () => {
      expect(() => toKeyType(Infinity)).toThrow(
        'Unsupported COSE key type: Infinity'
      );
    });

    it('for negative Infinity', () => {
      expect(() => toKeyType(-Infinity)).toThrow(
        'Unsupported COSE key type: -Infinity'
      );
    });
  });
});
