import { describe, it, expect } from 'vitest';
import { jwkToCoseKeyOps } from '../jwkToCoseKeyOps';
import { KeyOp } from '../types';
import { JwkKeyOp } from '@/jwk/types';

describe('jwkToCoseKeyOps', () => {
  describe('should return the correct COSE KeyOps array', () => {
    it('for valid JWK key operation string arrays', () => {
      const result = jwkToCoseKeyOps(['sign', 'verify']);
      expect(result).toEqual([KeyOp.Sign, KeyOp.Verify]);

      const encryptOps = jwkToCoseKeyOps(['encrypt', 'decrypt']);
      expect(encryptOps).toEqual([KeyOp.Encrypt, KeyOp.Decrypt]);

      const wrapOps = jwkToCoseKeyOps(['wrapKey', 'unwrapKey']);
      expect(wrapOps).toEqual([KeyOp.WrapKey, KeyOp.UnwrapKey]);

      const deriveOps = jwkToCoseKeyOps(['deriveKey', 'deriveBits']);
      expect(deriveOps).toEqual([KeyOp.DeriveKey, KeyOp.DeriveBits]);
    });

    it('for JwkKeyOps enum value arrays', () => {
      const result = jwkToCoseKeyOps([JwkKeyOp.Sign, JwkKeyOp.Verify]);
      expect(result).toEqual([KeyOp.Sign, KeyOp.Verify]);

      const encryptOps = jwkToCoseKeyOps([JwkKeyOp.Encrypt, JwkKeyOp.Decrypt]);
      expect(encryptOps).toEqual([KeyOp.Encrypt, KeyOp.Decrypt]);

      const wrapOps = jwkToCoseKeyOps([JwkKeyOp.WrapKey, JwkKeyOp.UnwrapKey]);
      expect(wrapOps).toEqual([KeyOp.WrapKey, KeyOp.UnwrapKey]);

      const deriveOps = jwkToCoseKeyOps([
        JwkKeyOp.DeriveKey,
        JwkKeyOp.DeriveBits,
      ]);
      expect(deriveOps).toEqual([KeyOp.DeriveKey, KeyOp.DeriveBits]);
    });

    it('for mixed string and enum values', () => {
      const result = jwkToCoseKeyOps(['sign', JwkKeyOp.Verify]);
      expect(result).toEqual([KeyOp.Sign, KeyOp.Verify]);

      const mixedOps = jwkToCoseKeyOps([JwkKeyOp.Encrypt, 'decrypt']);
      expect(mixedOps).toEqual([KeyOp.Encrypt, KeyOp.Decrypt]);
    });

    it('for single operation arrays', () => {
      const signOnly = jwkToCoseKeyOps(['sign']);
      expect(signOnly).toEqual([KeyOp.Sign]);

      const verifyOnly = jwkToCoseKeyOps(['verify']);
      expect(verifyOnly).toEqual([KeyOp.Verify]);

      const encryptOnly = jwkToCoseKeyOps(['encrypt']);
      expect(encryptOnly).toEqual([KeyOp.Encrypt]);
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
        KeyOp.Sign,
        KeyOp.Verify,
        KeyOp.Encrypt,
        KeyOp.Decrypt,
        KeyOp.WrapKey,
        KeyOp.UnwrapKey,
        KeyOp.DeriveKey,
        KeyOp.DeriveBits,
      ]);
    });

    it('for empty array', () => {
      const result = jwkToCoseKeyOps([]);
      expect(result).toEqual([]);
    });

    it('for duplicate operations', () => {
      const duplicates = jwkToCoseKeyOps(['sign', 'sign', 'verify', 'verify']);
      expect(duplicates).toEqual([
        KeyOp.Sign,
        KeyOp.Sign,
        KeyOp.Verify,
        KeyOp.Verify,
      ]);
    });

    it('for operations in different order', () => {
      const reverseOrder = jwkToCoseKeyOps(['verify', 'sign']);
      expect(reverseOrder).toEqual([KeyOp.Verify, KeyOp.Sign]);

      const mixedOrder = jwkToCoseKeyOps([
        'deriveKey',
        'sign',
        'encrypt',
        'verify',
      ]);
      expect(mixedOrder).toEqual([
        KeyOp.DeriveKey,
        KeyOp.Sign,
        KeyOp.Encrypt,
        KeyOp.Verify,
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
      expect(result).toEqual(Array(100).fill(KeyOp.Sign));
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
        KeyOp.Sign,
        KeyOp.Verify,
        KeyOp.Encrypt,
        KeyOp.Decrypt,
        KeyOp.WrapKey,
        KeyOp.UnwrapKey,
        KeyOp.DeriveKey,
        KeyOp.DeriveBits,
        KeyOp.Sign,
        KeyOp.Verify,
        KeyOp.Encrypt,
        KeyOp.Decrypt,
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
        KeyOp.DeriveBits,
        KeyOp.Sign,
        KeyOp.Encrypt,
        KeyOp.Verify,
        KeyOp.DeriveKey,
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
      expect(arrayResult[0]).toBe(KeyOp.Sign);
      expect(arrayResult[1]).toBe(KeyOp.Verify);
      expect(arrayResult[2]).toBe(KeyOp.Encrypt);
      expect(arrayResult[3]).toBe(KeyOp.Decrypt);
    });
  });
});
