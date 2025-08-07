import { describe, expect, it } from 'vitest';
import { errorCodeSchema } from '../ErrorCode';
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
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'ErrorCode: This field is required. Please provide a valid integer.',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.',
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage:
          'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.',
      },
      {
        name: 'array input',
        input: [],
        expectedMessage:
          'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.',
      },
      {
        name: 'object input',
        input: {},
        expectedMessage:
          'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.',
      },
      {
        name: 'decimal number',
        input: 1.5,
        expectedMessage:
          'ErrorCode: Please provide an integer (no decimal places).',
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
