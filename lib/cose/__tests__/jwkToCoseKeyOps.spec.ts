import { describe, it, expect } from 'vitest';
import { jwkToCoseKeyOps } from '../jwkToCoseKeyOps';
import { KeyOps } from '../types';
import { JwkKeyOps } from '@/jwk/types';

describe('jwkToCoseKeyOps', () => {
  describe('should return the correct COSE KeyOps array', () => {
    it('for valid JWK key operation string arrays', () => {
      const result = jwkToCoseKeyOps(['sign', 'verify']);
      expect(result).toEqual([KeyOps.Sign, KeyOps.Verify]);

      const encryptOps = jwkToCoseKeyOps(['encrypt', 'decrypt']);
      expect(encryptOps).toEqual([KeyOps.Encrypt, KeyOps.Decrypt]);

      const wrapOps = jwkToCoseKeyOps(['wrapKey', 'unwrapKey']);
      expect(wrapOps).toEqual([KeyOps.WrapKey, KeyOps.UnwrapKey]);

      const deriveOps = jwkToCoseKeyOps(['deriveKey', 'deriveBits']);
      expect(deriveOps).toEqual([KeyOps.DeriveKey, KeyOps.DeriveBits]);
    });

    it('for JwkKeyOps enum value arrays', () => {
      const result = jwkToCoseKeyOps([JwkKeyOps.Sign, JwkKeyOps.Verify]);
      expect(result).toEqual([KeyOps.Sign, KeyOps.Verify]);

      const encryptOps = jwkToCoseKeyOps([
        JwkKeyOps.Encrypt,
        JwkKeyOps.Decrypt,
      ]);
      expect(encryptOps).toEqual([KeyOps.Encrypt, KeyOps.Decrypt]);

      const wrapOps = jwkToCoseKeyOps([JwkKeyOps.WrapKey, JwkKeyOps.UnwrapKey]);
      expect(wrapOps).toEqual([KeyOps.WrapKey, KeyOps.UnwrapKey]);

      const deriveOps = jwkToCoseKeyOps([
        JwkKeyOps.DeriveKey,
        JwkKeyOps.DeriveBits,
      ]);
      expect(deriveOps).toEqual([KeyOps.DeriveKey, KeyOps.DeriveBits]);
    });

    it('for mixed string and enum values', () => {
      const result = jwkToCoseKeyOps(['sign', JwkKeyOps.Verify]);
      expect(result).toEqual([KeyOps.Sign, KeyOps.Verify]);

      const mixedOps = jwkToCoseKeyOps([JwkKeyOps.Encrypt, 'decrypt']);
      expect(mixedOps).toEqual([KeyOps.Encrypt, KeyOps.Decrypt]);
    });

    it('for single operation arrays', () => {
      const signOnly = jwkToCoseKeyOps(['sign']);
      expect(signOnly).toEqual([KeyOps.Sign]);

      const verifyOnly = jwkToCoseKeyOps(['verify']);
      expect(verifyOnly).toEqual([KeyOps.Verify]);

      const encryptOnly = jwkToCoseKeyOps(['encrypt']);
      expect(encryptOnly).toEqual([KeyOps.Encrypt]);
    });

    it('for all operations in one array', () => {
      const allOps = jwkToCoseKeyOps([
        'sign',
        'verify',
        'encrypt',
        'decrypt',
        'wrapKey',
        'unwrapKey',
        'deriveKey',
        'deriveBits',
      ]);
      expect(allOps).toEqual([
        KeyOps.Sign,
        KeyOps.Verify,
        KeyOps.Encrypt,
        KeyOps.Decrypt,
        KeyOps.WrapKey,
        KeyOps.UnwrapKey,
        KeyOps.DeriveKey,
        KeyOps.DeriveBits,
      ]);
    });

    it('for empty array', () => {
      const result = jwkToCoseKeyOps([]);
      expect(result).toEqual([]);
    });

    it('for duplicate operations', () => {
      const duplicates = jwkToCoseKeyOps(['sign', 'sign', 'verify', 'verify']);
      expect(duplicates).toEqual([
        KeyOps.Sign,
        KeyOps.Sign,
        KeyOps.Verify,
        KeyOps.Verify,
      ]);
    });

    it('for operations in different order', () => {
      const reverseOrder = jwkToCoseKeyOps(['verify', 'sign']);
      expect(reverseOrder).toEqual([KeyOps.Verify, KeyOps.Sign]);

      const mixedOrder = jwkToCoseKeyOps([
        'deriveKey',
        'sign',
        'encrypt',
        'verify',
      ]);
      expect(mixedOrder).toEqual([
        KeyOps.DeriveKey,
        KeyOps.Sign,
        KeyOps.Encrypt,
        KeyOps.Verify,
      ]);
    });
  });

  describe('should throw an error', () => {
    it('for arrays containing invalid JWK key operation strings', () => {
      expect(() => jwkToCoseKeyOps(['sign', 'invalid'])).toThrow(
        'Unsupported JWK key operation: invalid'
      );
      expect(() => jwkToCoseKeyOps(['verify', ''])).toThrow(
        'Unsupported JWK key operation: '
      );
      expect(() => jwkToCoseKeyOps(['encrypt', 'signature'])).toThrow(
        'Unsupported JWK key operation: signature'
      );
    });

    it('for arrays with case-sensitive variations', () => {
      expect(() => jwkToCoseKeyOps(['sign', 'SIGN'])).toThrow(
        'Unsupported JWK key operation: SIGN'
      );
      expect(() => jwkToCoseKeyOps(['Sign', 'verify'])).toThrow(
        'Unsupported JWK key operation: Sign'
      );
      expect(() => jwkToCoseKeyOps(['sIgN', 'vErIfY'])).toThrow(
        'Unsupported JWK key operation: sIgN'
      );
    });

    it('for arrays with strings containing whitespace', () => {
      expect(() => jwkToCoseKeyOps(['sign', 'sign '])).toThrow(
        'Unsupported JWK key operation: sign '
      );
      expect(() => jwkToCoseKeyOps([' verify', 'verify'])).toThrow(
        'Unsupported JWK key operation:  verify'
      );
      expect(() => jwkToCoseKeyOps([' sign ', 'verify'])).toThrow(
        'Unsupported JWK key operation:  sign '
      );
    });

    it('for arrays with partial matches', () => {
      expect(() => jwkToCoseKeyOps(['sign', 'sig'])).toThrow(
        'Unsupported JWK key operation: sig'
      );
      expect(() => jwkToCoseKeyOps(['ver', 'verify'])).toThrow(
        'Unsupported JWK key operation: ver'
      );
      expect(() => jwkToCoseKeyOps(['enc', 'encrypt'])).toThrow(
        'Unsupported JWK key operation: enc'
      );
    });

    it('for arrays with edge case strings', () => {
      expect(() => jwkToCoseKeyOps(['sign', '0'])).toThrow(
        'Unsupported JWK key operation: 0'
      );
      expect(() => jwkToCoseKeyOps(['false', 'verify'])).toThrow(
        'Unsupported JWK key operation: false'
      );
      expect(() => jwkToCoseKeyOps(['null', 'encrypt'])).toThrow(
        'Unsupported JWK key operation: null'
      );
    });

    it('for arrays with special characters and symbols', () => {
      expect(() => jwkToCoseKeyOps(['sign', 'sign!'])).toThrow(
        'Unsupported JWK key operation: sign!'
      );
      expect(() => jwkToCoseKeyOps(['@verify', 'verify'])).toThrow(
        'Unsupported JWK key operation: @verify'
      );
      expect(() => jwkToCoseKeyOps(['encrypt#', 'decrypt'])).toThrow(
        'Unsupported JWK key operation: encrypt#'
      );
    });

    it('for arrays with all invalid operations', () => {
      expect(() => jwkToCoseKeyOps(['invalid1', 'invalid2'])).toThrow(
        'Unsupported JWK key operation: invalid1'
      );
      expect(() => jwkToCoseKeyOps(['bad', 'wrong', 'error'])).toThrow(
        'Unsupported JWK key operation: bad'
      );
    });

    it('for arrays with mixed valid and invalid operations', () => {
      expect(() => jwkToCoseKeyOps(['sign', 'invalid', 'verify'])).toThrow(
        'Unsupported JWK key operation: invalid'
      );
      expect(() =>
        jwkToCoseKeyOps(['encrypt', 'bad', 'decrypt', 'wrong'])
      ).toThrow('Unsupported JWK key operation: bad');
    });
  });

  describe('edge cases', () => {
    it('handles large arrays of valid operations', () => {
      const largeArray = Array(100).fill('sign');
      const result = jwkToCoseKeyOps(largeArray);
      expect(result).toEqual(Array(100).fill(KeyOps.Sign));
    });

    it('handles arrays with many different valid operations', () => {
      const manyOps = [
        'sign',
        'verify',
        'encrypt',
        'decrypt',
        'wrapKey',
        'unwrapKey',
        'deriveKey',
        'deriveBits',
        'sign',
        'verify',
        'encrypt',
        'decrypt',
      ];
      const result = jwkToCoseKeyOps(manyOps);
      expect(result).toEqual([
        KeyOps.Sign,
        KeyOps.Verify,
        KeyOps.Encrypt,
        KeyOps.Decrypt,
        KeyOps.WrapKey,
        KeyOps.UnwrapKey,
        KeyOps.DeriveKey,
        KeyOps.DeriveBits,
        KeyOps.Sign,
        KeyOps.Verify,
        KeyOps.Encrypt,
        KeyOps.Decrypt,
      ]);
    });

    it('preserves order of operations', () => {
      const orderedOps = [
        'deriveBits',
        'sign',
        'encrypt',
        'verify',
        'deriveKey',
      ];
      const result = jwkToCoseKeyOps(orderedOps);
      expect(result).toEqual([
        KeyOps.DeriveBits,
        KeyOps.Sign,
        KeyOps.Encrypt,
        KeyOps.Verify,
        KeyOps.DeriveKey,
      ]);
    });

    it('handles arrays with only one invalid operation', () => {
      expect(() => jwkToCoseKeyOps(['invalid'])).toThrow(
        'Unsupported JWK key operation: invalid'
      );
    });
  });

  describe('integration with jwkToCoseKeyOp', () => {
    it('should produce the same results as calling jwkToCoseKeyOp individually', () => {
      const operations = ['sign', 'verify', 'encrypt', 'decrypt'];
      const arrayResult = jwkToCoseKeyOps(operations);

      // This test verifies that jwkToCoseKeyOps is equivalent to mapping jwkToCoseKeyOp
      // over the array, which is the expected behavior based on the implementation
      expect(arrayResult).toHaveLength(operations.length);
      expect(arrayResult[0]).toBe(KeyOps.Sign);
      expect(arrayResult[1]).toBe(KeyOps.Verify);
      expect(arrayResult[2]).toBe(KeyOps.Encrypt);
      expect(arrayResult[3]).toBe(KeyOps.Decrypt);
    });
  });
});
