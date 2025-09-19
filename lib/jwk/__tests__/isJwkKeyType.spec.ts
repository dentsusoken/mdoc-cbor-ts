import { describe, it, expect } from 'vitest';
import { isJwkKeyType } from '../isJwkKeyType';
import { JwkKeyTypes } from '../types';

describe('isJwkKeyType', () => {
  describe('should return true', () => {
    it('for valid JwkKeyTypes values', () => {
      expect(isJwkKeyType(JwkKeyTypes.EC)).toBe(true);
      expect(isJwkKeyType(JwkKeyTypes.OKP)).toBe(true);
      expect(isJwkKeyType(JwkKeyTypes.oct)).toBe(true);
    });

    it('for string values that match JwkKeyTypes enum values', () => {
      expect(isJwkKeyType('EC')).toBe(true);
      expect(isJwkKeyType('OKP')).toBe(true);
      expect(isJwkKeyType('oct')).toBe(true);
    });
  });

  describe('should return false', () => {
    it('for invalid key types', () => {
      expect(isJwkKeyType('RSA')).toBe(false);
      expect(isJwkKeyType('AES')).toBe(false);
      expect(isJwkKeyType('HMAC')).toBe(false);
      expect(isJwkKeyType('')).toBe(false);
    });

    it('for case-sensitive mismatches', () => {
      expect(isJwkKeyType('ec')).toBe(false);
      expect(isJwkKeyType('okp')).toBe(false);
      expect(isJwkKeyType('OCT')).toBe(false);
    });

    it('for non-string values', () => {
      expect(isJwkKeyType(123 as unknown as string)).toBe(false);
      expect(isJwkKeyType(null as unknown as string)).toBe(false);
      expect(isJwkKeyType(undefined as unknown as string)).toBe(false);
      expect(isJwkKeyType({} as unknown as string)).toBe(false);
      expect(isJwkKeyType([] as unknown as string)).toBe(false);
    });

    it('for strings with extra characters', () => {
      expect(isJwkKeyType('EC ')).toBe(false);
      expect(isJwkKeyType(' EC')).toBe(false);
      expect(isJwkKeyType('EC-256')).toBe(false);
      expect(isJwkKeyType('EC_OKP')).toBe(false);
    });
  });
});
