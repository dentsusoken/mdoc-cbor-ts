import { describe, it, expect } from 'vitest';
import { toJwkKeyType } from '../toJwkKeyType';
import { JwkKeyType } from '../types';

describe('toJwkKeyType', () => {
  describe('should return correct values', () => {
    it('for valid key types', () => {
      expect(toJwkKeyType('EC')).toBe(JwkKeyType.EC);
      expect(toJwkKeyType('OKP')).toBe(JwkKeyType.OKP);
      expect(toJwkKeyType('oct')).toBe(JwkKeyType.oct);
    });

    it('when passed enum values', () => {
      expect(toJwkKeyType(JwkKeyType.EC)).toBe(JwkKeyType.EC);
      expect(toJwkKeyType(JwkKeyType.OKP)).toBe(JwkKeyType.OKP);
      expect(toJwkKeyType(JwkKeyType.oct)).toBe(JwkKeyType.oct);
    });
  });

  describe('should throw error', () => {
    it('for invalid key types', () => {
      expect(() => toJwkKeyType('RSA')).toThrow(
        'Unsupported JWK key type: RSA'
      );
      expect(() => toJwkKeyType('AES')).toThrow(
        'Unsupported JWK key type: AES'
      );
      expect(() => toJwkKeyType('HMAC')).toThrow(
        'Unsupported JWK key type: HMAC'
      );
      expect(() => toJwkKeyType('')).toThrow('Unsupported JWK key type: ');
    });

    it('for case-sensitive mismatches', () => {
      expect(() => toJwkKeyType('ec')).toThrow('Unsupported JWK key type: ec');
      expect(() => toJwkKeyType('okp')).toThrow(
        'Unsupported JWK key type: okp'
      );
      expect(() => toJwkKeyType('OCT')).toThrow(
        'Unsupported JWK key type: OCT'
      );
    });

    it('for strings with extra characters', () => {
      expect(() => toJwkKeyType('EC ')).toThrow(
        'Unsupported JWK key type: EC '
      );
      expect(() => toJwkKeyType(' EC')).toThrow(
        'Unsupported JWK key type:  EC'
      );
      expect(() => toJwkKeyType('EC-256')).toThrow(
        'Unsupported JWK key type: EC-256'
      );
      expect(() => toJwkKeyType('EC_OKP')).toThrow(
        'Unsupported JWK key type: EC_OKP'
      );
    });

    it('for non-string values', () => {
      expect(() => toJwkKeyType(123 as unknown as string)).toThrow(
        'Unsupported JWK key type: 123'
      );
      expect(() => toJwkKeyType(null as unknown as string)).toThrow(
        'Unsupported JWK key type: null'
      );
      expect(() => toJwkKeyType(undefined as unknown as string)).toThrow(
        'Unsupported JWK key type: undefined'
      );
      expect(() => toJwkKeyType({} as unknown as string)).toThrow(
        'Unsupported JWK key type: [object Object]'
      );
      expect(() => toJwkKeyType([] as unknown as string)).toThrow(
        'Unsupported JWK key type: '
      );
    });
  });
});
