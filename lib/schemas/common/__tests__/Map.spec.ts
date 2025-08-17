import { describe, expect, it } from 'vitest';
import {
  createMapSchema,
  mapEmptyMessage,
  mapInvalidTypeMessage,
  mapRequiredMessage,
} from '../Map';
import { z } from 'zod';

describe('createMapSchema', () => {
  describe('should accept valid non-empty maps', () => {
    const cases: { name: string; input: Map<string, number> }[] = [
      { name: 'single entry map', input: new Map([['a', 1]]) },
      {
        name: 'multiple entries map',
        input: new Map([
          ['x', 10],
          ['y', 20],
        ]),
      },
    ];

    cases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const schema = createMapSchema<string, number>({
          target: 'Target',
          keySchema: z.string(),
          valueSchema: z.number(),
        });
        const result = schema.parse(input);
        expect(result).toBeInstanceOf(Map);
        expect(result).toEqual(input);
      });
    });
  });

  describe('should enforce empty/non-empty based on allowEmpty', () => {
    it('should allow empty map when allowEmpty is true', () => {
      const schema = createMapSchema<string, number>({
        target: 'Target',
        keySchema: z.string(),
        valueSchema: z.number(),
        allowEmpty: true,
      });
      const result = schema.parse(new Map());
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should reject empty map when allowEmpty is false (default)', () => {
      const schema = createMapSchema<string, number>({
        target: 'Target',
        keySchema: z.string(),
        valueSchema: z.number(),
      });
      try {
        schema.parse(new Map());
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(mapEmptyMessage('Target'));
      }
    });
  });

  describe('should reject invalid types with consistent message', () => {
    const target = 'Target';
    const schema = createMapSchema<string, number>({
      target,
      keySchema: z.string(),
      valueSchema: z.number(),
    });

    const cases: { name: string; input: unknown; expected: string }[] = [
      {
        name: 'string input',
        input: 'not a map',
        expected: mapInvalidTypeMessage(target),
      },
      {
        name: 'number input',
        input: 123,
        expected: mapInvalidTypeMessage(target),
      },
      {
        name: 'boolean input',
        input: true,
        expected: mapInvalidTypeMessage(target),
      },
      {
        name: 'null input',
        input: null,
        expected: mapInvalidTypeMessage(target),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: mapRequiredMessage(target),
      },
      {
        name: 'plain object input',
        input: { a: 1 },
        expected: mapInvalidTypeMessage(target),
      },
      {
        name: 'array input',
        input: [['a', 1]],
        expected: mapInvalidTypeMessage(target),
      },
      {
        name: 'set input',
        input: new Set([1, 2, 3]),
        expected: mapInvalidTypeMessage(target),
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

  describe('should reject entries with invalid key or value', () => {
    it('should reject when a key is not a string', () => {
      const schema = createMapSchema<string, number>({
        target: 'Target',
        keySchema: z.string(),
        valueSchema: z.number(),
      });
      const invalidKeyMap = new Map([[123 as unknown as string, 1]]);
      try {
        schema.parse(invalidKeyMap as unknown as Map<string, number>);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        //console.log(zodError.issues[0].path);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('should reject when a value is not a number', () => {
      const schema = createMapSchema<string, number>({
        target: 'Target',
        keySchema: z.string(),
        valueSchema: z.number(),
      });
      const invalidValueMap = new Map([
        ['a', 'not-a-number' as unknown as number],
      ]);
      try {
        schema.parse(invalidValueMap as unknown as Map<string, number>);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        //console.log(zodError.issues[0].path);
        expect(zodError.issues[0].message).toBe(
          'Expected number, received string'
        );
      }
    });
  });
});
