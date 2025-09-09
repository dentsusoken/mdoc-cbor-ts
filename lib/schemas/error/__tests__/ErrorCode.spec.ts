import { describe, expect, it } from 'vitest';
import { errorCodeSchema, ErrorCode } from '../ErrorCode';
import { intInvalidTypeMessage, intIntegerMessage } from '@/schemas/common/Int';
import { requiredMessage } from '@/schemas/common/Required';
import { z } from 'zod';

describe('ErrorCode', () => {
  describe('should accept valid error codes', () => {
    const testCases = [
      { name: 'zero', input: 0 },
      { name: 'positive integer', input: 1 },
      { name: 'positive integer 2', input: 2 },
      { name: 'large positive integer', input: 100 },
      { name: 'unknown framework positive code', input: 9999 },
      { name: 'negative integer', input: -1 },
      { name: 'negative integer 2', input: -2 },
      { name: 'large negative integer', input: -100 },
      { name: 'unknown framework negative code', input: -9999 },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = errorCodeSchema.parse(input);
        expect(result).toBe(input);
      });
    });
  });

  describe('should throw error for invalid inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: requiredMessage('ErrorCode'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: requiredMessage('ErrorCode'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: intInvalidTypeMessage('ErrorCode'),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: intInvalidTypeMessage('ErrorCode'),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: intInvalidTypeMessage('ErrorCode'),
      },
      {
        name: 'object input',
        input: {},
        expectedMessage: intInvalidTypeMessage('ErrorCode'),
      },
      {
        name: 'decimal number',
        input: 1.5,
        expectedMessage: intIntegerMessage('ErrorCode'),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          errorCodeSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });

  describe('should validate ErrorCode constants', () => {
    it('all exported ErrorCode values are integers', () => {
      const values = Object.values(ErrorCode);
      values.forEach((code) => {
        expect(typeof code).toBe('number');
        expect(Number.isInteger(code)).toBe(true);
      });
    });

    it('schema accepts each ErrorCode constant', () => {
      const values = Object.values(ErrorCode);
      values.forEach((code) => {
        const parsed = errorCodeSchema.parse(code);
        expect(parsed).toBe(code);
      });
    });
  });
});
