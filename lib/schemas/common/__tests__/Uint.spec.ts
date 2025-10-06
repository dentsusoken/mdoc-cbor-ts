import { describe, expect, it } from 'vitest';
import {
  createUintSchema,
  uintInvalidTypeMessage,
  uintIntegerMessage,
  uintNonNegativeMessage,
} from '../Uint';
import { z } from 'zod';
import { requiredMessage } from '../Required';

describe('createUintSchema', () => {
  const TARGET = 'DigestID';
  const schema = createUintSchema(TARGET);

  describe('should accept valid non-negative integers', () => {
    const cases = [
      { name: 'zero', input: 0 },
      { name: 'small positive integer', input: 1 },
      { name: 'medium positive integer', input: 123 },
      { name: 'large positive integer', input: 999 },
      { name: 'very large positive integer', input: 1000 },
      { name: 'maximum 32-bit signed integer', input: 2147483647 },
    ];

    cases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = schema.parse(input);
        expect(typeof result).toBe('number');
        expect(result).toBe(input);
      });
    });
  });

  describe('should reject invalid types with consistent message', () => {
    const cases: { name: string; input: unknown; expected: string }[] = [
      {
        name: 'boolean input',
        input: true,
        expected: uintInvalidTypeMessage(TARGET),
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expected: uintInvalidTypeMessage(TARGET),
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expected: uintInvalidTypeMessage(TARGET),
      },
      {
        name: 'null input',
        input: null,
        expected: requiredMessage(TARGET),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: requiredMessage(TARGET),
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          schema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('should enforce integer and non-negativity', () => {
    const cases: { name: string; input: number; expected: string }[] = [
      {
        name: 'decimal number',
        input: 1.5,
        expected: uintIntegerMessage(TARGET),
      },
      {
        name: 'negative number',
        input: -1,
        expected: uintNonNegativeMessage(TARGET),
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          schema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });
});
