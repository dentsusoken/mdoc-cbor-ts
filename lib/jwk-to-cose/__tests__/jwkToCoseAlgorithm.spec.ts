import { describe, it, expect } from 'vitest';
import { jwkToCoseAlgorithm } from '../jwkToCoseAlgorithm';
import { JwkAlgorithm } from '@/jwk/types';
import { Algorithm } from '@/cose/types';

describe('jwkToCoseAlgorithm', () => {
  describe('should return correct COSE algorithms', () => {
    it('for valid JwkAlgorithms enum values', () => {
      expect(jwkToCoseAlgorithm(JwkAlgorithm.EdDSA)).toBe(Algorithm.EdDSA);
      expect(jwkToCoseAlgorithm(JwkAlgorithm.ES256)).toBe(Algorithm.ES256);
      expect(jwkToCoseAlgorithm(JwkAlgorithm.ES384)).toBe(Algorithm.ES384);
      expect(jwkToCoseAlgorithm(JwkAlgorithm.ES512)).toBe(Algorithm.ES512);
    });

    it('for string values that match JwkAlgorithms', () => {
      expect(jwkToCoseAlgorithm('EdDSA')).toBe(Algorithm.EdDSA);
      expect(jwkToCoseAlgorithm('ES256')).toBe(Algorithm.ES256);
      expect(jwkToCoseAlgorithm('ES384')).toBe(Algorithm.ES384);
      expect(jwkToCoseAlgorithm('ES512')).toBe(Algorithm.ES512);
    });

    it('for all enum values systematically', () => {
      const allJwkAlgorithms = Object.values(JwkAlgorithm);
      const expectedCoseAlgorithms = [
        Algorithm.EdDSA,
        Algorithm.ES256,
        Algorithm.ES384,
        Algorithm.ES512,
      ];

      allJwkAlgorithms.forEach((jwkAlgorithm, index) => {
        expect(jwkToCoseAlgorithm(jwkAlgorithm)).toBe(
          expectedCoseAlgorithms[index]
        );
      });
    });
  });

  describe('should throw Error', () => {
    it('for invalid JWK algorithm strings', () => {
      expect(() => jwkToCoseAlgorithm('invalid-algorithm')).toThrow(
        'Unsupported JWK algorithm: invalid-algorithm'
      );
      expect(() => jwkToCoseAlgorithm('HS256')).toThrow(
        'Unsupported JWK algorithm: HS256'
      );
      expect(() => jwkToCoseAlgorithm('RS256')).toThrow(
        'Unsupported JWK algorithm: RS256'
      );
      expect(() => jwkToCoseAlgorithm('PS256')).toThrow(
        'Unsupported JWK algorithm: PS256'
      );
      expect(() => jwkToCoseAlgorithm('A256GCM')).toThrow(
        'Unsupported JWK algorithm: A256GCM'
      );
      expect(() => jwkToCoseAlgorithm('RSA-OAEP')).toThrow(
        'Unsupported JWK algorithm: RSA-OAEP'
      );
      expect(() => jwkToCoseAlgorithm('')).toThrow(
        'Unsupported JWK algorithm: '
      );
    });

    it('for case-sensitive mismatches', () => {
      expect(() => jwkToCoseAlgorithm('es256')).toThrow(
        'Unsupported JWK algorithm: es256'
      );
      expect(() => jwkToCoseAlgorithm('ES256 ')).toThrow(
        'Unsupported JWK algorithm: ES256 '
      );
      expect(() => jwkToCoseAlgorithm(' ES256')).toThrow(
        'Unsupported JWK algorithm:  ES256'
      );
      expect(() => jwkToCoseAlgorithm('eddsa')).toThrow(
        'Unsupported JWK algorithm: eddsa'
      );
      expect(() => jwkToCoseAlgorithm('Eddsa')).toThrow(
        'Unsupported JWK algorithm: Eddsa'
      );
    });

    it('for partial matches', () => {
      expect(() => jwkToCoseAlgorithm('ES')).toThrow(
        'Unsupported JWK algorithm: ES'
      );
      expect(() => jwkToCoseAlgorithm('256')).toThrow(
        'Unsupported JWK algorithm: 256'
      );
      expect(() => jwkToCoseAlgorithm('Ed')).toThrow(
        'Unsupported JWK algorithm: Ed'
      );
      expect(() => jwkToCoseAlgorithm('DSA')).toThrow(
        'Unsupported JWK algorithm: DSA'
      );
    });

    it('for algorithms with extra characters', () => {
      expect(() => jwkToCoseAlgorithm('ES256-extra')).toThrow(
        'Unsupported JWK algorithm: ES256-extra'
      );
      expect(() => jwkToCoseAlgorithm('EdDSA-v2')).toThrow(
        'Unsupported JWK algorithm: EdDSA-v2'
      );
      expect(() => jwkToCoseAlgorithm('ES256.1')).toThrow(
        'Unsupported JWK algorithm: ES256.1'
      );
    });

    it('for non-string inputs', () => {
      expect(() => jwkToCoseAlgorithm(null as unknown)).toThrow(
        'Unsupported JWK algorithm: null'
      );
      expect(() => jwkToCoseAlgorithm(undefined as unknown)).toThrow(
        'Unsupported JWK algorithm: undefined'
      );
      expect(() => jwkToCoseAlgorithm(123 as unknown)).toThrow(
        'Unsupported JWK algorithm: 123'
      );
      expect(() => jwkToCoseAlgorithm({} as unknown)).toThrow(
        'Unsupported JWK algorithm: [object Object]'
      );
      expect(() => jwkToCoseAlgorithm([] as unknown)).toThrow(
        'Unsupported JWK algorithm: '
      );
    });
  });
});
