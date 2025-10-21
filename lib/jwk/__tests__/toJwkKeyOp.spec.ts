import { describe, it, expect } from 'vitest';
import { toJwkKeyOp } from '../toJwkKeyOp';
import { JwkKeyOp } from '../types';

describe('toJwkKeyOp', () => {
  describe('should return the correct JwkKeyOps enum value', () => {
    it('for valid string values', () => {
      expect(toJwkKeyOp('sign')).toBe(JwkKeyOp.Sign);
      expect(toJwkKeyOp('verify')).toBe(JwkKeyOp.Verify);
      expect(toJwkKeyOp('encrypt')).toBe(JwkKeyOp.Encrypt);
      expect(toJwkKeyOp('decrypt')).toBe(JwkKeyOp.Decrypt);
      expect(toJwkKeyOp('wrapKey')).toBe(JwkKeyOp.WrapKey);
      expect(toJwkKeyOp('unwrapKey')).toBe(JwkKeyOp.UnwrapKey);
      expect(toJwkKeyOp('deriveKey')).toBe(JwkKeyOp.DeriveKey);
      expect(toJwkKeyOp('deriveBits')).toBe(JwkKeyOp.DeriveBits);
    });

    it('for JwkKeyOps enum values', () => {
      expect(toJwkKeyOp(JwkKeyOp.Sign)).toBe(JwkKeyOp.Sign);
      expect(toJwkKeyOp(JwkKeyOp.Verify)).toBe(JwkKeyOp.Verify);
      expect(toJwkKeyOp(JwkKeyOp.Encrypt)).toBe(JwkKeyOp.Encrypt);
      expect(toJwkKeyOp(JwkKeyOp.Decrypt)).toBe(JwkKeyOp.Decrypt);
      expect(toJwkKeyOp(JwkKeyOp.WrapKey)).toBe(JwkKeyOp.WrapKey);
      expect(toJwkKeyOp(JwkKeyOp.UnwrapKey)).toBe(JwkKeyOp.UnwrapKey);
      expect(toJwkKeyOp(JwkKeyOp.DeriveKey)).toBe(JwkKeyOp.DeriveKey);
      expect(toJwkKeyOp(JwkKeyOp.DeriveBits)).toBe(JwkKeyOp.DeriveBits);
    });

    it('for all enum values from JwkKeyOps', () => {
      const allEnumValues = Object.values(JwkKeyOp);

      allEnumValues.forEach((value) => {
        expect(toJwkKeyOp(value)).toBe(value);
      });
    });
  });

  describe('should throw an error', () => {
    it('for invalid string values', () => {
      expect(() => toJwkKeyOp('invalid')).toThrow(
        'Unsupported JWK key operation: invalid'
      );
      expect(() => toJwkKeyOp('')).toThrow('Unsupported JWK key operation: ');
      expect(() => toJwkKeyOp('signature')).toThrow(
        'Unsupported JWK key operation: signature'
      );
      expect(() => toJwkKeyOp('encryption')).toThrow(
        'Unsupported JWK key operation: encryption'
      );
      expect(() => toJwkKeyOp('key')).toThrow(
        'Unsupported JWK key operation: key'
      );
    });

    it('for case-sensitive variations', () => {
      expect(() => toJwkKeyOp('SIGN')).toThrow(
        'Unsupported JWK key operation: SIGN'
      );
      expect(() => toJwkKeyOp('Sign')).toThrow(
        'Unsupported JWK key operation: Sign'
      );
      expect(() => toJwkKeyOp('sIgN')).toThrow(
        'Unsupported JWK key operation: sIgN'
      );
    });

    it('for strings with whitespace', () => {
      expect(() => toJwkKeyOp('sign ')).toThrow(
        'Unsupported JWK key operation: sign '
      );
      expect(() => toJwkKeyOp(' sign')).toThrow(
        'Unsupported JWK key operation:  sign'
      );
      expect(() => toJwkKeyOp(' sign ')).toThrow(
        'Unsupported JWK key operation:  sign '
      );
    });

    it('for partial matches', () => {
      expect(() => toJwkKeyOp('sig')).toThrow(
        'Unsupported JWK key operation: sig'
      );
      expect(() => toJwkKeyOp('ver')).toThrow(
        'Unsupported JWK key operation: ver'
      );
      expect(() => toJwkKeyOp('enc')).toThrow(
        'Unsupported JWK key operation: enc'
      );
      expect(() => toJwkKeyOp('dec')).toThrow(
        'Unsupported JWK key operation: dec'
      );
      expect(() => toJwkKeyOp('wrap')).toThrow(
        'Unsupported JWK key operation: wrap'
      );
      expect(() => toJwkKeyOp('unwrap')).toThrow(
        'Unsupported JWK key operation: unwrap'
      );
      expect(() => toJwkKeyOp('derive')).toThrow(
        'Unsupported JWK key operation: derive'
      );
    });

    it('for edge case strings', () => {
      expect(() => toJwkKeyOp('0')).toThrow('Unsupported JWK key operation: 0');
      expect(() => toJwkKeyOp('false')).toThrow(
        'Unsupported JWK key operation: false'
      );
      expect(() => toJwkKeyOp('null')).toThrow(
        'Unsupported JWK key operation: null'
      );
      expect(() => toJwkKeyOp('undefined')).toThrow(
        'Unsupported JWK key operation: undefined'
      );
      expect(() => toJwkKeyOp('object')).toThrow(
        'Unsupported JWK key operation: object'
      );
      expect(() => toJwkKeyOp('array')).toThrow(
        'Unsupported JWK key operation: array'
      );
    });

    it('for non-string values', () => {
      expect(() => toJwkKeyOp(123 as unknown as string)).toThrow(
        'Unsupported JWK key operation: 123'
      );
      expect(() => toJwkKeyOp(null as unknown as string)).toThrow(
        'Unsupported JWK key operation: null'
      );
      expect(() => toJwkKeyOp(undefined as unknown as string)).toThrow(
        'Unsupported JWK key operation: undefined'
      );
      expect(() => toJwkKeyOp({} as unknown as string)).toThrow(
        'Unsupported JWK key operation: [object Object]'
      );
      expect(() => toJwkKeyOp([] as unknown as string)).toThrow(
        'Unsupported JWK key operation: '
      );
      expect(() => toJwkKeyOp(true as unknown as string)).toThrow(
        'Unsupported JWK key operation: true'
      );
    });

    it('for special characters and symbols', () => {
      expect(() => toJwkKeyOp('sign!')).toThrow(
        'Unsupported JWK key operation: sign!'
      );
      expect(() => toJwkKeyOp('@verify')).toThrow(
        'Unsupported JWK key operation: @verify'
      );
      expect(() => toJwkKeyOp('encrypt#')).toThrow(
        'Unsupported JWK key operation: encrypt#'
      );
      expect(() => toJwkKeyOp('$decrypt')).toThrow(
        'Unsupported JWK key operation: $decrypt'
      );
      expect(() => toJwkKeyOp('wrap%key')).toThrow(
        'Unsupported JWK key operation: wrap%key'
      );
    });

    it('for numeric strings', () => {
      expect(() => toJwkKeyOp('123')).toThrow(
        'Unsupported JWK key operation: 123'
      );
      expect(() => toJwkKeyOp('0')).toThrow('Unsupported JWK key operation: 0');
      expect(() => toJwkKeyOp('-1')).toThrow(
        'Unsupported JWK key operation: -1'
      );
      expect(() => toJwkKeyOp('3.14')).toThrow(
        'Unsupported JWK key operation: 3.14'
      );
    });

    it('for boolean strings', () => {
      expect(() => toJwkKeyOp('true')).toThrow(
        'Unsupported JWK key operation: true'
      );
      expect(() => toJwkKeyOp('false')).toThrow(
        'Unsupported JWK key operation: false'
      );
    });

    it('for JSON-like strings', () => {
      expect(() => toJwkKeyOp('{}')).toThrow(
        'Unsupported JWK key operation: {}'
      );
      expect(() => toJwkKeyOp('[]')).toThrow(
        'Unsupported JWK key operation: []'
      );
      expect(() => toJwkKeyOp('{"key": "value"}')).toThrow(
        'Unsupported JWK key operation: {"key": "value"}'
      );
    });
  });
});
