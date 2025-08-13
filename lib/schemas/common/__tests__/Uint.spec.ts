import { describe, expect, it } from 'vitest';
import {
  createUintSchema,
  UINT_INVALID_TYPE_MESSAGE_SUFFIX,
  UINT_REQUIRED_MESSAGE_SUFFIX,
  UINT_INTEGER_MESSAGE_SUFFIX,
  UINT_POSITIVE_MESSAGE_SUFFIX,
} from '../Uint';
import { z } from 'zod';

describe('createUintSchema', () => {
  const TARGET = 'DigestID';
  const schema = createUintSchema(TARGET);

  describe('should accept valid positive integers', () => {
    const cases = [
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
    const prefix = `${TARGET}: `;
    const cases: { name: string; input: unknown; expected: string }[] = [
      {
        name: 'boolean input',
        input: true,
        expected: `${prefix}${UINT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expected: `${prefix}${UINT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expected: `${prefix}${UINT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'null input',
        input: null,
        expected: `${prefix}${UINT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: `${prefix}${UINT_REQUIRED_MESSAGE_SUFFIX}`,
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

  describe('should enforce integer and positivity', () => {
    const prefix = `${TARGET}: `;
    const cases: { name: string; input: number; expected: string }[] = [
      {
        name: 'decimal number',
        input: 1.5,
        expected: `${prefix}${UINT_INTEGER_MESSAGE_SUFFIX}`,
      },
      {
        name: 'zero',
        input: 0,
        expected: `${prefix}${UINT_POSITIVE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'negative number',
        input: -1,
        expected: `${prefix}${UINT_POSITIVE_MESSAGE_SUFFIX}`,
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
