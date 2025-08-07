import { describe, expect, it } from 'vitest';
import { numberKeySchema } from '../NumberKey';
import { z } from 'zod';

describe('NumberKey', () => {
  describe('should accept valid number inputs', () => {
    const testCases = [
      {
        name: 'small positive integer',
        input: 1,
      },
      {
        name: 'medium positive integer',
        input: 123,
      },
      {
        name: 'large positive integer',
        input: 999,
      },
      {
        name: 'very large positive integer',
        input: 1000,
      },
      {
        name: 'maximum safe integer',
        input: 2147483647,
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = numberKeySchema.parse(input);
        expect(result).toBe(input);
      });
    });
  });

  describe('should accept valid string inputs and transform to number', () => {
    const testCases = [
      {
        name: 'single digit string',
        input: '1',
      },
      {
        name: 'multi-digit string',
        input: '123',
      },
      {
        name: 'large number string',
        input: '999',
      },
      {
        name: 'very large number string',
        input: '1000',
      },
      {
        name: 'maximum safe integer string',
        input: '2147483647',
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = numberKeySchema.parse(input);
        expect(typeof result).toBe('number');
        expect(result).toBe(Number(input));
      });
    });
  });

  describe('should throw error for invalid inputs', () => {
    const testCases = [
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'NumberKey: Please provide a positive integer (as number or string)',
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expectedMessage:
          'NumberKey: Please provide a positive integer (as number or string)',
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expectedMessage:
          'NumberKey: Please provide a positive integer (as number or string)',
      },
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'NumberKey: Please provide a positive integer (as number or string)',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'NumberKey: Please provide a positive integer (as number or string)',
      },
      {
        name: 'decimal number',
        input: 1.5,
        expectedMessage:
          'NumberKey: Please provide an integer (no decimal places)',
      },
      {
        name: 'negative number',
        input: -1,
        expectedMessage:
          'NumberKey: Please provide a positive integer greater than 0',
      },
      {
        name: 'zero',
        input: 0,
        expectedMessage:
          'NumberKey: Please provide a positive integer greater than 0',
      },
      {
        name: 'non-digit string',
        input: 'abc',
        expectedMessage:
          'NumberKey: Please provide a positive integer (as number or string)',
      },
      {
        name: 'mixed string with letters',
        input: '123abc',
        expectedMessage:
          'NumberKey: Please provide a positive integer (as number or string)',
      },
      {
        name: 'string with decimal',
        input: '12.34',
        expectedMessage:
          'NumberKey: Please provide a positive integer (as number or string)',
      },
      {
        name: 'string with comma',
        input: '12,34',
        expectedMessage:
          'NumberKey: Please provide a positive integer (as number or string)',
      },
      {
        name: 'zero as string',
        input: '0',
        expectedMessage:
          'NumberKey: Please provide a positive integer greater than 0',
      },
      {
        name: 'negative number as string',
        input: '-1',
        expectedMessage:
          'NumberKey: Please provide a positive integer (as number or string)',
      },
      {
        name: 'large negative number',
        input: -123,
        expectedMessage:
          'NumberKey: Please provide a positive integer greater than 0',
      },
      {
        name: 'very large negative number',
        input: -999,
        expectedMessage:
          'NumberKey: Please provide a positive integer greater than 0',
      },
      {
        name: 'negative string with large number',
        input: '-123',
        expectedMessage:
          'NumberKey: Please provide a positive integer (as number or string)',
      },
      {
        name: 'negative string with very large number',
        input: '-999',
        expectedMessage:
          'NumberKey: Please provide a positive integer (as number or string)',
      },
      {
        name: 'string with letters at end',
        input: 'abc123',
        expectedMessage:
          'NumberKey: Please provide a positive integer (as number or string)',
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          numberKeySchema.parse(input);
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
