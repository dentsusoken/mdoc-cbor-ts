import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createRequiredSchema, requiredMessage } from '../Required';

describe('Required', () => {
  const target = 'RequiredField';
  const schema = createRequiredSchema(target);

  describe('should accept non-null/undefined values', () => {
    const cases: Array<{ name: string; input: unknown; expected: unknown }> = [
      { name: 'string', input: 'hello', expected: 'hello' },
      { name: 'empty string', input: '', expected: '' },
      { name: 'number', input: 0, expected: 0 },
      { name: 'boolean false', input: false, expected: false },
      { name: 'object', input: { a: 1 }, expected: { a: 1 } },
      { name: 'array', input: [1, 2], expected: [1, 2] },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should accept ${name}`, () => {
        const result = schema.parse(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('should throw for null/undefined', () => {
    const cases: Array<{ name: string; input: unknown }> = [
      { name: 'null', input: null },
      { name: 'undefined', input: undefined },
    ];

    cases.forEach(({ name, input }) => {
      it(`should throw for ${name}`, () => {
        try {
          schema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(requiredMessage(target));
        }
      });
    });
  });
});
