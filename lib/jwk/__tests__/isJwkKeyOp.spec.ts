import { describe, it, expect } from 'vitest';
import { isJwkKeyOp } from '../isJwkKeyOp';
import { JwkKeyOps } from '../types';

describe('isJwkKeyOp', () => {
  describe('should return true', () => {
    it('for valid JwkKeyOps enum values', () => {
      expect(isJwkKeyOp(JwkKeyOps.Sign)).toBe(true);
      expect(isJwkKeyOp(JwkKeyOps.Verify)).toBe(true);
      expect(isJwkKeyOp(JwkKeyOps.Encrypt)).toBe(true);
      expect(isJwkKeyOp(JwkKeyOps.Decrypt)).toBe(true);
      expect(isJwkKeyOp(JwkKeyOps.WrapKey)).toBe(true);
      expect(isJwkKeyOp(JwkKeyOps.UnwrapKey)).toBe(true);
      expect(isJwkKeyOp(JwkKeyOps.DeriveKey)).toBe(true);
      expect(isJwkKeyOp(JwkKeyOps.DeriveBits)).toBe(true);
    });

    it('for string values that match JwkKeyOps enum values', () => {
      expect(isJwkKeyOp('sign')).toBe(true);
      expect(isJwkKeyOp('verify')).toBe(true);
      expect(isJwkKeyOp('encrypt')).toBe(true);
      expect(isJwkKeyOp('decrypt')).toBe(true);
      expect(isJwkKeyOp('wrapKey')).toBe(true);
      expect(isJwkKeyOp('unwrapKey')).toBe(true);
      expect(isJwkKeyOp('deriveKey')).toBe(true);
      expect(isJwkKeyOp('deriveBits')).toBe(true);
    });

    it('for all enum values from JwkKeyOps', () => {
      const allEnumValues = Object.values(JwkKeyOps);

      allEnumValues.forEach((value) => {
        expect(isJwkKeyOp(value)).toBe(true);
      });
    });
  });

  describe('should return false', () => {
    it('for invalid string values', () => {
      expect(isJwkKeyOp('invalid')).toBe(false);
      expect(isJwkKeyOp('')).toBe(false);
      expect(isJwkKeyOp('signature')).toBe(false);
      expect(isJwkKeyOp('encryption')).toBe(false);
      expect(isJwkKeyOp('key')).toBe(false);
    });

    it('for case-sensitive variations', () => {
      expect(isJwkKeyOp('SIGN')).toBe(false);
      expect(isJwkKeyOp('Sign')).toBe(false);
      expect(isJwkKeyOp('sIgN')).toBe(false);
    });

    it('for strings with whitespace', () => {
      expect(isJwkKeyOp('sign ')).toBe(false);
      expect(isJwkKeyOp(' sign')).toBe(false);
    });

    it('for partial matches', () => {
      expect(isJwkKeyOp('sig')).toBe(false);
      expect(isJwkKeyOp('ver')).toBe(false);
      expect(isJwkKeyOp('enc')).toBe(false);
      expect(isJwkKeyOp('dec')).toBe(false);
      expect(isJwkKeyOp('wrap')).toBe(false);
      expect(isJwkKeyOp('unwrap')).toBe(false);
      expect(isJwkKeyOp('derive')).toBe(false);
    });

    it('for non-string values', () => {
      expect(isJwkKeyOp(123 as unknown as string)).toBe(false);
      expect(isJwkKeyOp(null as unknown as string)).toBe(false);
      expect(isJwkKeyOp(undefined as unknown as string)).toBe(false);
      expect(isJwkKeyOp({} as unknown as string)).toBe(false);
      expect(isJwkKeyOp([] as unknown as string)).toBe(false);
      expect(isJwkKeyOp(true as unknown as string)).toBe(false);
    });

    it('for edge case strings', () => {
      expect(isJwkKeyOp('0')).toBe(false);
      expect(isJwkKeyOp('false')).toBe(false);
      expect(isJwkKeyOp('null')).toBe(false);
      expect(isJwkKeyOp('undefined')).toBe(false);
      expect(isJwkKeyOp('object')).toBe(false);
      expect(isJwkKeyOp('array')).toBe(false);
    });
  });
});
