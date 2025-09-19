import { describe, it, expect } from 'vitest';
import { isJwkAlgorithm } from '../isJwkAlgorithm';
import { JwkAlgorithms } from '../types';

describe('isJwkAlgorithm', () => {
  describe('should return true', () => {
    it('for valid JwkAlgorithms enum values', () => {
      expect(isJwkAlgorithm(JwkAlgorithms.EdDSA)).toBe(true);
      expect(isJwkAlgorithm(JwkAlgorithms.ES256)).toBe(true);
      expect(isJwkAlgorithm(JwkAlgorithms.ES384)).toBe(true);
      expect(isJwkAlgorithm(JwkAlgorithms.ES512)).toBe(true);
    });

    it('for string values that match JwkAlgorithms', () => {
      expect(isJwkAlgorithm('EdDSA')).toBe(true);
      expect(isJwkAlgorithm('ES256')).toBe(true);
      expect(isJwkAlgorithm('ES384')).toBe(true);
      expect(isJwkAlgorithm('ES512')).toBe(true);
    });

    it('for all enum values systematically', () => {
      const allAlgorithms = Object.values(JwkAlgorithms);

      allAlgorithms.forEach((algorithm) => {
        expect(isJwkAlgorithm(algorithm)).toBe(true);
      });
    });
  });

  describe('should return false', () => {
    it('for invalid algorithm strings', () => {
      expect(isJwkAlgorithm('invalid-algorithm')).toBe(false);
      expect(isJwkAlgorithm('HS256')).toBe(false);
      expect(isJwkAlgorithm('RS256')).toBe(false);
      expect(isJwkAlgorithm('PS256')).toBe(false);
      expect(isJwkAlgorithm('A256GCM')).toBe(false);
      expect(isJwkAlgorithm('RSA-OAEP')).toBe(false);
      expect(isJwkAlgorithm('')).toBe(false);
    });

    it('for case-sensitive mismatches', () => {
      expect(isJwkAlgorithm('es256')).toBe(false);
      expect(isJwkAlgorithm('ES256 ')).toBe(false);
      expect(isJwkAlgorithm(' ES256')).toBe(false);
      expect(isJwkAlgorithm('eddsa')).toBe(false);
      expect(isJwkAlgorithm('Eddsa')).toBe(false);
    });

    it('for non-string inputs', () => {
      expect(isJwkAlgorithm(null as unknown as string)).toBe(false);
      expect(isJwkAlgorithm(undefined as unknown as string)).toBe(false);
      expect(isJwkAlgorithm(123 as unknown as string)).toBe(false);
      expect(isJwkAlgorithm({} as unknown as string)).toBe(false);
      expect(isJwkAlgorithm([] as unknown as string)).toBe(false);
    });
  });
});
