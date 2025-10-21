import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { keyInfoSchema } from '../KeyInfo';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('KeyInfo', () => {
  describe('valid inputs', () => {
    const cases: Array<{
      name: string;
      input: Map<number | string, unknown>;
    }> = [
      { name: 'empty map (allowed)', input: new Map() },
      { name: 'single numeric entry', input: new Map([[1, 'value']]) },
      { name: 'single string entry', input: new Map([['custom', 42]]) },
      {
        name: 'multiple entries with negative/positive keys',
        input: new Map<number | string, unknown>([
          [-1, 123],
          [0, null],
          [2, { a: 1 }],
          ['alg', 'ES256'],
        ]),
      },
    ];

    cases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = keyInfoSchema.parse(input);
        expect(result).toBeInstanceOf(Map);
        expect(result).toEqual(input);
      });
    });
  });

  describe('invalid container types', () => {
    const cases: Array<{ name: string; input: unknown }> = [
      {
        name: 'string',
        input: 'not-a-map',
      },
      {
        name: 'number',
        input: 123,
      },
      {
        name: 'boolean',
        input: true,
      },
      {
        name: 'null',
        input: null,
      },
      {
        name: 'plain object',
        input: { 1: 'value' },
      },
      {
        name: 'array',
        input: [[1, 'value']],
      },
      {
        name: 'set',
        input: new Set([1]),
      },
      {
        name: 'undefined',
        input: undefined,
      },
    ];

    cases.forEach(({ name, input }) => {
      it(`should reject ${name}`, () => {
        try {
          keyInfoSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expected = containerInvalidTypeMessage({
            target: 'KeyInfo',
            expected: 'Map',
            received: getTypeName(input),
          });
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('invalid key values', () => {
    it('should reject when a numeric key is not an integer', () => {
      const invalid = new Map<number, unknown>([[1.5, 'value']]);
      try {
        keyInfoSchema.parse(invalid as Map<number, unknown>);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        // createMapSchema prefixes the labelSchema error with the container path
        expect(zodError.issues[0].message).toBe(
          'KeyInfo[0].key: Expected integer, received float'
        );
      }
    });
  });
});
