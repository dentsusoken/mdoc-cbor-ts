import { describe, it, expect } from 'vitest';
import { toJwkAlgorithm } from '../toJwkAlgorithm';
import { JwkAlgorithm } from '../types';

describe('toJwkAlgorithm', () => {
  describe('should return valid JwkAlgorithms', () => {
    it('for valid JwkAlgorithms enum values', () => {
      expect(toJwkAlgorithm(JwkAlgorithm.EdDSA)).toBe(JwkAlgorithm.EdDSA);
      expect(toJwkAlgorithm(JwkAlgorithm.ES256)).toBe(JwkAlgorithm.ES256);
      expect(toJwkAlgorithm(JwkAlgorithm.ES384)).toBe(JwkAlgorithm.ES384);
      expect(toJwkAlgorithm(JwkAlgorithm.ES512)).toBe(JwkAlgorithm.ES512);
    });

    it('for string values that match JwkAlgorithms', () => {
      expect(toJwkAlgorithm('EdDSA')).toBe(JwkAlgorithm.EdDSA);
      expect(toJwkAlgorithm('ES256')).toBe(JwkAlgorithm.ES256);
      expect(toJwkAlgorithm('ES384')).toBe(JwkAlgorithm.ES384);
      expect(toJwkAlgorithm('ES512')).toBe(JwkAlgorithm.ES512);
    });

    it('for all enum values systematically', () => {
      const allAlgorithms = Object.values(JwkAlgorithm);

      allAlgorithms.forEach((algorithm) => {
        expect(toJwkAlgorithm(algorithm)).toBe(algorithm);
      });
    });
  });

  describe('should throw Error', () => {
    it('for invalid algorithm strings', () => {
      expect(() => toJwkAlgorithm('invalid-algorithm')).toThrow(
        'Unsupported JWK algorithm: invalid-algorithm'
      );
      expect(() => toJwkAlgorithm('HS256')).toThrow(
        'Unsupported JWK algorithm: HS256'
      );
      expect(() => toJwkAlgorithm('RS256')).toThrow(
        'Unsupported JWK algorithm: RS256'
      );
      expect(() => toJwkAlgorithm('PS256')).toThrow(
        'Unsupported JWK algorithm: PS256'
      );
      expect(() => toJwkAlgorithm('A256GCM')).toThrow(
        'Unsupported JWK algorithm: A256GCM'
      );
      expect(() => toJwkAlgorithm('RSA-OAEP')).toThrow(
        'Unsupported JWK algorithm: RSA-OAEP'
      );
      expect(() => toJwkAlgorithm('')).toThrow('Unsupported JWK algorithm: ');
    });

    it('for case-sensitive mismatches', () => {
      expect(() => toJwkAlgorithm('es256')).toThrow(
        'Unsupported JWK algorithm: es256'
      );
      expect(() => toJwkAlgorithm('ES256 ')).toThrow(
        'Unsupported JWK algorithm: ES256 '
      );
      expect(() => toJwkAlgorithm(' ES256')).toThrow(
        'Unsupported JWK algorithm:  ES256'
      );
      expect(() => toJwkAlgorithm('eddsa')).toThrow(
        'Unsupported JWK algorithm: eddsa'
      );
      expect(() => toJwkAlgorithm('Eddsa')).toThrow(
        'Unsupported JWK algorithm: Eddsa'
      );
    });

    it('for partial matches', () => {
      expect(() => toJwkAlgorithm('ES')).toThrow(
        'Unsupported JWK algorithm: ES'
      );
      expect(() => toJwkAlgorithm('256')).toThrow(
        'Unsupported JWK algorithm: 256'
      );
      expect(() => toJwkAlgorithm('Ed')).toThrow(
        'Unsupported JWK algorithm: Ed'
      );
      expect(() => toJwkAlgorithm('DSA')).toThrow(
        'Unsupported JWK algorithm: DSA'
      );
    });

    it('for algorithms with extra characters', () => {
      expect(() => toJwkAlgorithm('ES256-extra')).toThrow(
        'Unsupported JWK algorithm: ES256-extra'
      );
      expect(() => toJwkAlgorithm('EdDSA-v2')).toThrow(
        'Unsupported JWK algorithm: EdDSA-v2'
      );
      expect(() => toJwkAlgorithm('ES256.1')).toThrow(
        'Unsupported JWK algorithm: ES256.1'
      );
    });

    it('for non-string inputs', () => {
      expect(() => toJwkAlgorithm(null as unknown)).toThrow(
        'Unsupported JWK algorithm: null'
      );
      expect(() => toJwkAlgorithm(undefined as unknown)).toThrow(
        'Unsupported JWK algorithm: undefined'
      );
      expect(() => toJwkAlgorithm(123 as unknown)).toThrow(
        'Unsupported JWK algorithm: 123'
      );
      expect(() => toJwkAlgorithm({} as unknown)).toThrow(
        'Unsupported JWK algorithm: [object Object]'
      );
      expect(() => toJwkAlgorithm([] as unknown)).toThrow(
        'Unsupported JWK algorithm: '
      );
    });
  });
});
