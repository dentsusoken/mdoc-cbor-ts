import { describe, it, expect } from 'vitest';
import { isJwkMacAlgorithm } from '../isJwkMacAlgorithm';
import { JwkMacAlgorithms } from '../types';

describe('isJwkMacAlgorithm', () => {
  describe('should return true', () => {
    it('for valid JwkMacAlgorithms enum values', () => {
      expect(isJwkMacAlgorithm(JwkMacAlgorithms.HS256)).toBe(true);
      expect(isJwkMacAlgorithm(JwkMacAlgorithms.HS384)).toBe(true);
      expect(isJwkMacAlgorithm(JwkMacAlgorithms.HS512)).toBe(true);
    });

    it('for string values that match JwkMacAlgorithms', () => {
      expect(isJwkMacAlgorithm('HS256')).toBe(true);
      expect(isJwkMacAlgorithm('HS384')).toBe(true);
      expect(isJwkMacAlgorithm('HS512')).toBe(true);
    });

    it('for all enum values systematically', () => {
      const allAlgorithms = Object.values(JwkMacAlgorithms);

      allAlgorithms.forEach((algorithm) => {
        expect(isJwkMacAlgorithm(algorithm)).toBe(true);
      });
    });
  });

  describe('should return false', () => {
    it('for invalid algorithm strings', () => {
      expect(isJwkMacAlgorithm('invalid-algorithm')).toBe(false);
      expect(isJwkMacAlgorithm('ES256')).toBe(false);
      expect(isJwkMacAlgorithm('EdDSA')).toBe(false);
      expect(isJwkMacAlgorithm('RS256')).toBe(false);
      expect(isJwkMacAlgorithm('PS256')).toBe(false);
      expect(isJwkMacAlgorithm('A256GCM')).toBe(false);
      expect(isJwkMacAlgorithm('RSA-OAEP')).toBe(false);
      expect(isJwkMacAlgorithm('')).toBe(false);
    });

    it('for case-sensitive mismatches', () => {
      expect(isJwkMacAlgorithm('hs256')).toBe(false);
      expect(isJwkMacAlgorithm('Hs256')).toBe(false);
      expect(isJwkMacAlgorithm('hS256')).toBe(false);
      expect(isJwkMacAlgorithm('HS256 ')).toBe(false);
      expect(isJwkMacAlgorithm(' HS256')).toBe(false);
      expect(isJwkMacAlgorithm('hs384')).toBe(false);
      expect(isJwkMacAlgorithm('hs512')).toBe(false);
    });

    it('for partial matches', () => {
      expect(isJwkMacAlgorithm('HS')).toBe(false);
      expect(isJwkMacAlgorithm('HS2')).toBe(false);
      expect(isJwkMacAlgorithm('HS25')).toBe(false);
      expect(isJwkMacAlgorithm('256')).toBe(false);
      expect(isJwkMacAlgorithm('384')).toBe(false);
      expect(isJwkMacAlgorithm('512')).toBe(false);
    });

    it('for other HMAC-related strings', () => {
      expect(isJwkMacAlgorithm('HMAC')).toBe(false);
      expect(isJwkMacAlgorithm('HMAC-SHA256')).toBe(false);
      expect(isJwkMacAlgorithm('HMAC-SHA384')).toBe(false);
      expect(isJwkMacAlgorithm('HMAC-SHA512')).toBe(false);
      expect(isJwkMacAlgorithm('SHA256')).toBe(false);
      expect(isJwkMacAlgorithm('SHA384')).toBe(false);
      expect(isJwkMacAlgorithm('SHA512')).toBe(false);
    });

    it('for non-string inputs', () => {
      expect(isJwkMacAlgorithm(null)).toBe(false);
      expect(isJwkMacAlgorithm(undefined)).toBe(false);
      expect(isJwkMacAlgorithm(123)).toBe(false);
      expect(isJwkMacAlgorithm(256)).toBe(false);
      expect(isJwkMacAlgorithm(384)).toBe(false);
      expect(isJwkMacAlgorithm(512)).toBe(false);
      expect(isJwkMacAlgorithm({})).toBe(false);
      expect(isJwkMacAlgorithm([])).toBe(false);
    });

    it('for boolean inputs', () => {
      expect(isJwkMacAlgorithm(true)).toBe(false);
      expect(isJwkMacAlgorithm(false)).toBe(false);
    });

    it('for symbol input', () => {
      expect(isJwkMacAlgorithm(Symbol('HS256'))).toBe(false);
    });

    it('for function input', () => {
      expect(isJwkMacAlgorithm(() => 'HS256')).toBe(false);
    });

    it('for similar algorithm numbers from COSE', () => {
      expect(isJwkMacAlgorithm(5)).toBe(false); // COSE HS256
      expect(isJwkMacAlgorithm(6)).toBe(false); // COSE HS384
      expect(isJwkMacAlgorithm(7)).toBe(false); // COSE HS512
    });
  });
});
