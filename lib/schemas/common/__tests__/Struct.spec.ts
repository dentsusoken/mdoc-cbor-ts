import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createStructSchema } from '../Struct';
import { mapInvalidTypeMessage } from '../containers/Map';
import { requiredMessage } from '../Required';

describe('createStructSchema', () => {
  it('should accept valid Map and return parsed object (object schema passes)', () => {
    const schema = createStructSchema({
      target: 'Target',
      objectSchema: z.object({ a: z.string(), b: z.number() }),
    });
    const input = new Map<string, unknown>([
      ['a', 'hello'],
      ['b', 42],
    ]);
    const result = schema.parse(input);
    expect(result).toEqual({ a: 'hello', b: 42 });
  });

  describe('should reject invalid input types with prefixed messages', () => {
    const target = 'Target';
    const invalidType = mapInvalidTypeMessage(target);
    const requiredMsg = requiredMessage(target);
    const schema = createStructSchema({
      target,
      objectSchema: z.object({}),
    });

    const cases: { name: string; input: unknown; expected: string }[] = [
      { name: 'string input', input: 'not a map', expected: invalidType },
      {
        name: 'number input',
        input: 123,
        expected: invalidType,
      },
      {
        name: 'boolean input',
        input: true,
        expected: invalidType,
      },
      {
        name: 'null input',
        input: null,
        expected: requiredMsg,
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: requiredMsg,
      },
      {
        name: 'plain object input',
        input: { a: 1 },
        expected: invalidType,
      },
      {
        name: 'array input',
        input: [['a', 1]],
        expected: invalidType,
      },
      {
        name: 'set input',
        input: new Set([1, 2, 3]),
        expected: invalidType,
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

  describe('should provide clear transform error when object schema fails', () => {
    it('should point to the failing path and include the original message (wrong type)', () => {
      const schema = createStructSchema({
        target: 'Target',
        objectSchema: z.object({ a: z.string(), b: z.number() }),
      });
      const bad = new Map<string, unknown>([
        ['a', 123],
        ['b', 1],
      ]);
      try {
        schema.parse(bad);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['a']);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('should report missing required property with path', () => {
      const schema = createStructSchema({
        target: 'Target',
        objectSchema: z.object({ a: z.string() }),
      });
      const bad = new Map<string, unknown>([]);
      try {
        schema.parse(bad);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['a']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });
  });
});
