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
    it('should accept valid integers', () => {
      const inputs = [-100, -1, 0, 1, 123];
      inputs.forEach((input) => {
        const result = labelSchema.parse(input);
        expect(typeof result).toBe('number');
        expect(result).toBe(input);
      });
    });

    it('should accept valid non-empty strings', () => {
      const inputs = ['kty', 'alg', 'x', '  spaced  '];
      inputs.forEach((input) => {
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
