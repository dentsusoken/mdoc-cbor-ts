import { describe, it, expect } from 'vitest';
import { jwkToCoseKeyOp } from '../jwkToCoseKeyOp';
import { KeyOp } from '../types';
import { JwkKeyOps } from '@/jwk/types';

describe('jwkToCoseKeyOp', () => {
  describe('should return the correct COSE KeyOps enum value', () => {
    it('for valid JWK key operation strings', () => {
      expect(jwkToCoseKeyOp('sign')).toBe(KeyOp.Sign);
      expect(jwkToCoseKeyOp('verify')).toBe(KeyOp.Verify);
      expect(jwkToCoseKeyOp('encrypt')).toBe(KeyOp.Encrypt);
      expect(jwkToCoseKeyOp('decrypt')).toBe(KeyOp.Decrypt);
      expect(jwkToCoseKeyOp('wrapKey')).toBe(KeyOp.WrapKey);
      expect(jwkToCoseKeyOp('unwrapKey')).toBe(KeyOp.UnwrapKey);
      expect(jwkToCoseKeyOp('deriveKey')).toBe(KeyOp.DeriveKey);
      expect(jwkToCoseKeyOp('deriveBits')).toBe(KeyOp.DeriveBits);
    });

    it('for JwkKeyOps enum values', () => {
      expect(jwkToCoseKeyOp(JwkKeyOps.Sign)).toBe(KeyOp.Sign);
      expect(jwkToCoseKeyOp(JwkKeyOps.Verify)).toBe(KeyOp.Verify);
      expect(jwkToCoseKeyOp(JwkKeyOps.Encrypt)).toBe(KeyOp.Encrypt);
      expect(jwkToCoseKeyOp(JwkKeyOps.Decrypt)).toBe(KeyOp.Decrypt);
      expect(jwkToCoseKeyOp(JwkKeyOps.WrapKey)).toBe(KeyOp.WrapKey);
      expect(jwkToCoseKeyOp(JwkKeyOps.UnwrapKey)).toBe(KeyOp.UnwrapKey);
      expect(jwkToCoseKeyOp(JwkKeyOps.DeriveKey)).toBe(KeyOp.DeriveKey);
      expect(jwkToCoseKeyOp(JwkKeyOps.DeriveBits)).toBe(KeyOp.DeriveBits);
    });

    it('for all enum values from JwkKeyOps', () => {
      const allJwkKeyOps = Object.values(JwkKeyOps);
      const expectedCoseKeyOps = [
        KeyOp.Sign,
        KeyOp.Verify,
        KeyOp.Encrypt,
        KeyOp.Decrypt,
        KeyOp.WrapKey,
        KeyOp.UnwrapKey,
        KeyOp.DeriveKey,
        KeyOp.DeriveBits,
      ];

      allJwkKeyOps.forEach((jwkKeyOp, index) => {
        expect(jwkToCoseKeyOp(jwkKeyOp)).toBe(expectedCoseKeyOps[index]);
      });
    });
  });

  describe('should throw an error', () => {
    it('for invalid JWK key operation strings', () => {
      expect(() => jwkToCoseKeyOp('invalid')).toThrow(
        'Unsupported JWK key operation: invalid'
      );
      expect(() => jwkToCoseKeyOp('')).toThrow(
        'Unsupported JWK key operation: '
      );
      expect(() => jwkToCoseKeyOp('signature')).toThrow(
        'Unsupported JWK key operation: signature'
      );
      expect(() => jwkToCoseKeyOp('encryption')).toThrow(
        'Unsupported JWK key operation: encryption'
      );
      expect(() => jwkToCoseKeyOp('key')).toThrow(
        'Unsupported JWK key operation: key'
      );
    });

    it('for case-sensitive variations', () => {
      expect(() => jwkToCoseKeyOp('SIGN')).toThrow(
        'Unsupported JWK key operation: SIGN'
      );
      expect(() => jwkToCoseKeyOp('Sign')).toThrow(
        'Unsupported JWK key operation: Sign'
      );
      expect(() => jwkToCoseKeyOp('sIgN')).toThrow(
        'Unsupported JWK key operation: sIgN'
      );
    });

    it('for strings with whitespace', () => {
      expect(() => jwkToCoseKeyOp('sign ')).toThrow(
        'Unsupported JWK key operation: sign '
      );
      expect(() => jwkToCoseKeyOp(' sign')).toThrow(
        'Unsupported JWK key operation:  sign'
      );
      expect(() => jwkToCoseKeyOp(' sign ')).toThrow(
        'Unsupported JWK key operation:  sign '
      );
    });

    it('for partial matches', () => {
      expect(() => jwkToCoseKeyOp('sig')).toThrow(
        'Unsupported JWK key operation: sig'
      );
      expect(() => jwkToCoseKeyOp('ver')).toThrow(
        'Unsupported JWK key operation: ver'
      );
      expect(() => jwkToCoseKeyOp('enc')).toThrow(
        'Unsupported JWK key operation: enc'
      );
      expect(() => jwkToCoseKeyOp('dec')).toThrow(
        'Unsupported JWK key operation: dec'
      );
      expect(() => jwkToCoseKeyOp('wrap')).toThrow(
        'Unsupported JWK key operation: wrap'
      );
      expect(() => jwkToCoseKeyOp('unwrap')).toThrow(
        'Unsupported JWK key operation: unwrap'
      );
      expect(() => jwkToCoseKeyOp('derive')).toThrow(
        'Unsupported JWK key operation: derive'
      );
    });

    it('for edge case strings', () => {
      expect(() => jwkToCoseKeyOp('0')).toThrow(
        'Unsupported JWK key operation: 0'
      );
      expect(() => jwkToCoseKeyOp('false')).toThrow(
        'Unsupported JWK key operation: false'
      );
      expect(() => jwkToCoseKeyOp('null')).toThrow(
        'Unsupported JWK key operation: null'
      );
      expect(() => jwkToCoseKeyOp('undefined')).toThrow(
        'Unsupported JWK key operation: undefined'
      );
      expect(() => jwkToCoseKeyOp('object')).toThrow(
        'Unsupported JWK key operation: object'
      );
      expect(() => jwkToCoseKeyOp('array')).toThrow(
        'Unsupported JWK key operation: array'
      );
    });

    it('for non-string values', () => {
      expect(() => jwkToCoseKeyOp(123 as unknown as string)).toThrow(
        'Unsupported JWK key operation: 123'
      );
      expect(() => jwkToCoseKeyOp(null as unknown as string)).toThrow(
        'Unsupported JWK key operation: null'
      );
      expect(() => jwkToCoseKeyOp(undefined as unknown as string)).toThrow(
        'Unsupported JWK key operation: undefined'
      );
      expect(() => jwkToCoseKeyOp({} as unknown as string)).toThrow(
        'Unsupported JWK key operation: [object Object]'
      );
      expect(() => jwkToCoseKeyOp([] as unknown as string)).toThrow(
        'Unsupported JWK key operation: '
      );
      expect(() => jwkToCoseKeyOp(true as unknown as string)).toThrow(
        'Unsupported JWK key operation: true'
      );
    });

    it('for special characters and symbols', () => {
      expect(() => jwkToCoseKeyOp('sign!')).toThrow(
        'Unsupported JWK key operation: sign!'
      );
      expect(() => jwkToCoseKeyOp('@verify')).toThrow(
        'Unsupported JWK key operation: @verify'
      );
      expect(() => jwkToCoseKeyOp('encrypt#')).toThrow(
        'Unsupported JWK key operation: encrypt#'
      );
      expect(() => jwkToCoseKeyOp('$decrypt')).toThrow(
        'Unsupported JWK key operation: $decrypt'
      );
      expect(() => jwkToCoseKeyOp('wrap%key')).toThrow(
        'Unsupported JWK key operation: wrap%key'
      );
    });
  });
});
