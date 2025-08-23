import { Sign1 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  createSign1Schema,
  sign1InvalidTypeMessage,
  sign1RequiredMessage,
  sign1TooFewMessage,
  sign1TooManyMessage,
} from '../Sign1';

describe('Sign1', () => {
  const schema = createSign1Schema('DeviceSignature');

  describe('should accept valid COSE_Sign1 arrays', () => {
    it('should parse a valid 4-element array to Sign1', () => {
      const protectedHeaders = Uint8Array.from([]);
      const unprotectedHeaders = new Map<number, unknown>();
      const payload = Uint8Array.from([]);
      const signature = Uint8Array.from([]);

      const input = [protectedHeaders, unprotectedHeaders, payload, signature];
      const result = schema.parse(input);

      expect(result).toBeInstanceOf(Sign1);
      expect(result).toEqual(
        new Sign1(protectedHeaders, unprotectedHeaders, payload, signature)
      );
    });

    it('should convert null payload to empty Uint8Array', () => {
      const protectedHeaders = Uint8Array.from([]);
      const unprotectedHeaders = new Map<number, unknown>();
      const payload = null;
      const signature = Uint8Array.from([]);

      const input = [protectedHeaders, unprotectedHeaders, payload, signature];
      const result = schema.parse(input);

      expect(result).toBeInstanceOf(Sign1);
      expect(result).toEqual(
        new Sign1(
          protectedHeaders,
          unprotectedHeaders,
          new Uint8Array(),
          signature
        )
      );
    });

    it('should convert undefined payload to empty Uint8Array', () => {
      const protectedHeaders = Uint8Array.from([]);
      const unprotectedHeaders = new Map<number, unknown>();
      const payload = undefined;
      const signature = Uint8Array.from([]);

      const input = [protectedHeaders, unprotectedHeaders, payload, signature];
      const result = schema.parse(input);

      expect(result).toBeInstanceOf(Sign1);
      expect(result).toEqual(
        new Sign1(
          protectedHeaders,
          unprotectedHeaders,
          new Uint8Array(),
          signature
        )
      );
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const invalidMessage = sign1InvalidTypeMessage('DeviceSignature');
    const requiredMessage = sign1RequiredMessage('DeviceSignature');

    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      { name: 'null input', input: null, expected: invalidMessage },
      { name: 'boolean input', input: true, expected: invalidMessage },
      { name: 'number input', input: 123, expected: invalidMessage },
      { name: 'string input', input: 'string', expected: invalidMessage },
      { name: 'plain object input', input: {}, expected: invalidMessage },
      { name: 'undefined input', input: undefined, expected: requiredMessage },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          schema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('should enforce array length = 4', () => {
    it('should reject arrays with too few elements', () => {
      const input = [
        Uint8Array.from([]),
        new Map<number, unknown>(),
        Uint8Array.from([]),
      ];
      try {
        schema.parse(input as never);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          sign1TooFewMessage('DeviceSignature')
        );
      }
    });

    it('should reject arrays with too many elements', () => {
      const input = [
        Uint8Array.from([]),
        new Map<number, unknown>(),
        Uint8Array.from([]),
        Uint8Array.from([]),
        'extra',
      ];
      try {
        schema.parse(input as never);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          sign1TooManyMessage('DeviceSignature')
        );
      }
    });
  });
});
