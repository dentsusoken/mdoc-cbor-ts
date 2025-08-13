import { describe, expect, it } from 'vitest';
import {
  createArraySchema,
  ARRAY_INVALID_TYPE_MESSAGE_SUFFIX,
  ARRAY_REQUIRED_MESSAGE_SUFFIX,
  ARRAY_EMPTY_MESSAGE_SUFFIX,
} from '../Array';
import { z } from 'zod';

describe('createArraySchema', () => {
  const TARGET = 'Tags';
  const itemSchema = z.string();
  const schema = createArraySchema({ target: TARGET, itemSchema });

  describe('should accept valid non-empty arrays', () => {
    const cases = [
      { name: 'single item', input: ['a'] },
      { name: 'multiple items', input: ['a', 'b', 'c'] },
    ];

    cases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = schema.parse(input);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual(input);
      });
    });
  });

  describe('should reject invalid types with consistent message', () => {
    const prefix = `${TARGET}: `;
    const cases: { name: string; input: unknown; expected: string }[] = [
      {
        name: 'boolean input',
        input: true,
        expected: `${prefix}${ARRAY_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expected: `${prefix}${ARRAY_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'null input',
        input: null,
        expected: `${prefix}${ARRAY_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: `${prefix}${ARRAY_REQUIRED_MESSAGE_SUFFIX}`,
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

  describe('should enforce non-empty by default and allow empty with flag', () => {
    const prefix = `${TARGET}: `;

    it('should reject empty array by default', () => {
      try {
        schema.parse([]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          `${prefix}${ARRAY_EMPTY_MESSAGE_SUFFIX}`
        );
      }
    });

    it('should accept empty array when allowEmpty is true', () => {
      const allowEmptySchema = createArraySchema({
        target: TARGET,
        itemSchema,
        allowEmpty: true,
      });
      const result = allowEmptySchema.parse([]);
      expect(result).toEqual([]);
    });
  });
});
