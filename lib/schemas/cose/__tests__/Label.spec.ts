import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  createLabelSchema,
  labelInvalidTypeMessage,
  labelRequiredMessage,
  labelSchema,
} from '../Label';
import { intIntegerMessage } from '@/schemas/common/Int';
import { nonEmptyTextEmptyMessage } from '@/schemas/common/NonEmptyText';

describe('Label', () => {
  describe('should accept valid labels', () => {
    const integerCases = [
      { name: 'large negative integer', input: -100 },
      { name: 'small negative integer', input: -1 },
      { name: 'zero', input: 0 },
      { name: 'small positive integer', input: 1 },
      { name: 'medium positive integer', input: 123 },
    ];

    integerCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = labelSchema.parse(input);
        expect(typeof result).toBe('number');
        expect(result).toBe(input);
      });
    });

    const stringCases = [
      { name: 'plain string', input: 'kty' },
      { name: 'another string', input: 'alg' },
      { name: 'single character', input: 'x' },
      { name: 'string with spaces', input: '  spaced  ' },
    ];

    stringCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = labelSchema.parse(input);
        expect(typeof result).toBe('string');
        expect(result).toBe(input);
      });
    });
  });

  describe('should reject invalid types with consistent message', () => {
    const schema = createLabelSchema('Label');
    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'boolean input',
        input: true,
        expected: labelInvalidTypeMessage('Label'),
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expected: labelInvalidTypeMessage('Label'),
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expected: labelInvalidTypeMessage('Label'),
      },
      {
        name: 'null input',
        input: null,
        expected: labelInvalidTypeMessage('Label'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: labelRequiredMessage('Label'),
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

  describe('should enforce integer for numeric labels', () => {
    const schema = createLabelSchema('Label');
    const cases: Array<{ name: string; input: number; expected: string }> = [
      {
        name: 'positive decimal number',
        input: 1.5,
        expected: intIntegerMessage('Label'),
      },
      {
        name: 'negative decimal number',
        input: -3.14,
        expected: intIntegerMessage('Label'),
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

  describe('should reject empty strings with consistent message', () => {
    const schema = createLabelSchema('Label');
    const cases = ['', '   ', '\t\t', '\n'];

    cases.forEach((input) => {
      it(`should reject empty-like string: ${JSON.stringify(input)}`, () => {
        try {
          schema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(
            nonEmptyTextEmptyMessage('Label')
          );
        }
      });
    });
  });
});
