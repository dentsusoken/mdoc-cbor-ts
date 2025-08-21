import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { keyInfoSchema } from '../KeyInfo';
import { intIntegerMessage } from '@/schemas/common/Int';
import {
  mapInvalidTypeMessage,
  mapRequiredMessage,
} from '@/schemas/common/Map';

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
    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'string',
        input: 'not-a-map',
        expected: mapInvalidTypeMessage('KeyInfo'),
      },
      {
        name: 'number',
        input: 123,
        expected: mapInvalidTypeMessage('KeyInfo'),
      },
      {
        name: 'boolean',
        input: true,
        expected: mapInvalidTypeMessage('KeyInfo'),
      },
      {
        name: 'null',
        input: null,
        expected: mapInvalidTypeMessage('KeyInfo'),
      },
      {
        name: 'plain object',
        input: { 1: 'value' },
        expected: mapInvalidTypeMessage('KeyInfo'),
      },
      {
        name: 'array',
        input: [[1, 'value']],
        expected: mapInvalidTypeMessage('KeyInfo'),
      },
      {
        name: 'set',
        input: new Set([1]),
        expected: mapInvalidTypeMessage('KeyInfo'),
      },
      {
        name: 'undefined',
        input: undefined,
        expected: mapRequiredMessage('KeyInfo'),
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          keyInfoSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
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
        expect(zodError.issues[0].message).toBe(intIntegerMessage('Label'));
      }
    });
  });
});
