import { Mac0 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createMac0Schema } from '../Mac0';
import {
  fixedTupleLengthInvalidTypeMessage,
  fixedTupleLengthTooFewMessage,
  fixedTupleLengthTooManyMessage,
} from '@/schemas/common/FixedTupleLength';
import { requiredMessage } from '@/schemas/common/Required';

describe('Mac0', () => {
  const schema = createMac0Schema('DeviceMac');

  describe('should accept valid COSE_Mac0 arrays', () => {
    const cases: Array<{
      name: string;
      payload: Uint8Array | null | undefined;
    }> = [
      { name: 'bytes payload', payload: Uint8Array.from([]) },
      { name: 'null payload', payload: null! },
      { name: 'undefined payload', payload: undefined! },
    ];

    cases.forEach(({ name, payload }) => {
      it(`should parse a valid 4-element array with ${name}`, () => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const tag = Uint8Array.from([]);

        const input = [protectedHeaders, unprotectedHeaders, payload, tag];
        const result = schema.parse(input as never);
        expect(result).toEqual(input);
      });
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const invalidMessage = fixedTupleLengthInvalidTypeMessage('DeviceMac');

    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'null input',
        input: null,
        expected: requiredMessage('DeviceMac'),
      },
      { name: 'boolean input', input: true, expected: invalidMessage },
      { name: 'number input', input: 123, expected: invalidMessage },
      { name: 'string input', input: 'string', expected: invalidMessage },
      { name: 'plain object input', input: {}, expected: invalidMessage },
      {
        name: 'undefined input',
        input: undefined,
        expected: requiredMessage('DeviceMac'),
      },
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
          fixedTupleLengthTooFewMessage('DeviceMac', 4)
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
          fixedTupleLengthTooManyMessage('DeviceMac', 4)
        );
      }
    });
  });
});
