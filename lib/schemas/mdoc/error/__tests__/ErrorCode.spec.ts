import { describe, expect, it } from 'vitest';
import { errorCodeSchema } from '../ErrorCode';
import {
  INT_INVALID_TYPE_MESSAGE_SUFFIX,
  INT_REQUIRED_MESSAGE_SUFFIX,
  INT_INTEGER_MESSAGE_SUFFIX,
} from '../../../common/Int';
import { z } from 'zod';

describe('ErrorCode', () => {
  describe('should accept valid error codes', () => {
    const testCases = [
      { name: 'zero', input: 0 },
      { name: 'positive integer', input: 1 },
      { name: 'positive integer 2', input: 2 },
      { name: 'large positive integer', input: 100 },
      { name: 'negative integer', input: -1 },
      { name: 'negative integer 2', input: -2 },
      { name: 'large negative integer', input: -100 },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = errorCodeSchema.parse(input);
        expect(result).toBe(input);
      });
    });
  });

  describe('should throw error for invalid inputs', () => {
    const prefix = 'ErrorCode: ';
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: `${prefix}${INT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: `${prefix}${INT_REQUIRED_MESSAGE_SUFFIX}`,
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: `${prefix}${INT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: `${prefix}${INT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: `${prefix}${INT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'object input',
        input: {},
        expectedMessage: `${prefix}${INT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'decimal number',
        input: 1.5,
        expectedMessage: `${prefix}${INT_INTEGER_MESSAGE_SUFFIX}`,
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
});
