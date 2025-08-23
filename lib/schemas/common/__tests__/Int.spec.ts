import { describe, expect, it } from 'vitest';
import {
  createIntSchema,
  intInvalidTypeMessage,
  intIntegerMessage,
} from '../Int';
import { z } from 'zod';
import { requiredMessage } from '../Required';

describe('createIntSchema', () => {
  const TARGET = 'ErrorCode';
  const schema = createIntSchema(TARGET);

  describe('should accept valid integers (negative, zero, positive)', () => {
    const cases = [
      { name: 'large negative integer', input: -1000 },
      { name: 'small negative integer', input: -1 },
      { name: 'zero', input: 0 },
      { name: 'small positive integer', input: 1 },
      { name: 'medium positive integer', input: 123 },
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
        expected: intInvalidTypeMessage(TARGET),
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expected: intInvalidTypeMessage(TARGET),
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expected: intInvalidTypeMessage(TARGET),
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

  describe('should reject required cases (null and undefined)', () => {
    const cases: { name: string; input: unknown }[] = [
      { name: 'null input', input: null },
      { name: 'undefined input', input: undefined },
    ];

    cases.forEach(({ name, input }) => {
      it(`should reject ${name} with required message`, () => {
        try {
          schema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(requiredMessage(TARGET));
        }
      });
    });
  });

  describe('should enforce integer (no decimals)', () => {
    const cases: { name: string; input: number; expected: string }[] = [
      {
        name: 'positive decimal number',
        input: 1.5,
        expected: intIntegerMessage(TARGET),
      },
      {
        name: 'negative decimal number',
        input: -3.14,
        expected: intIntegerMessage(TARGET),
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
