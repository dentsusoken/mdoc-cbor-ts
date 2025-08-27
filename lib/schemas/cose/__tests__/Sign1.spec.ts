import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createSign1Schema } from '../Sign1';
import { requiredMessage } from '@/schemas/common/Required';
import {
  fixedTupleLengthInvalidTypeMessage,
  fixedTupleLengthTooFewMessage,
  fixedTupleLengthTooManyMessage,
} from '@/schemas/common/FixedTupleLength';

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

      expect(result).toEqual(input);
    });

    it('should handle undefined payload', () => {
      const protectedHeaders = Uint8Array.from([]);
      const unprotectedHeaders = new Map<number, unknown>();
      const payload = undefined;
      const signature = Uint8Array.from([]);

      const input = [protectedHeaders, unprotectedHeaders, payload, signature];
      const result = schema.parse(input);

      expect(result).toEqual(input);
    });

    it('should handle null payload', () => {
      const protectedHeaders = Uint8Array.from([]);
      const unprotectedHeaders = new Map<number, unknown>();
      const payload = null;
      const signature = Uint8Array.from([]);

      const input = [protectedHeaders, unprotectedHeaders, payload, signature];
      const result = schema.parse(input);

      expect(result).toEqual(input);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expected: requiredMessage('DeviceSignature'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: requiredMessage('DeviceSignature'),
      },
      {
        name: 'boolean input',
        input: true,
        expected: fixedTupleLengthInvalidTypeMessage('DeviceSignature'),
      },
      {
        name: 'number input',
        input: 123,
        expected: fixedTupleLengthInvalidTypeMessage('DeviceSignature'),
      },
      {
        name: 'string input',
        input: 'string',
        expected: fixedTupleLengthInvalidTypeMessage('DeviceSignature'),
      },
      {
        name: 'plain object input',
        input: {},
        expected: fixedTupleLengthInvalidTypeMessage('DeviceSignature'),
      },
    ];

    testCases.forEach(({ name, input, expected }) => {
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
          fixedTupleLengthTooFewMessage('DeviceSignature', 4)
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
          fixedTupleLengthTooManyMessage('DeviceSignature', 4)
        );
      }
    });
  });
});
