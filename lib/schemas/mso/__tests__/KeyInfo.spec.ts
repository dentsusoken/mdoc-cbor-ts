import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { keyInfoSchema } from '../KeyInfo';
import { INT_INTEGER_MESSAGE_SUFFIX } from '@/schemas/common/Int';
import {
  MAP_INVALID_TYPE_MESSAGE_SUFFIX,
  MAP_REQUIRED_MESSAGE_SUFFIX,
} from '@/schemas/common/Map';

describe('KeyInfo', () => {
  describe('valid inputs', () => {
    const cases: Array<{ name: string; input: Map<number, unknown> }> = [
      { name: 'empty map (allowed)', input: new Map() },
      { name: 'single entry', input: new Map([[1, 'value']]) },
      {
        name: 'multiple entries with negative/positive keys',
        input: new Map<number, unknown>([
          [-1, 123],
          [0, null],
          [2, { a: 1 }],
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
    const prefix = 'KeyInfo: ';
    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'string',
        input: 'not-a-map',
        expected: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'number',
        input: 123,
        expected: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'boolean',
        input: true,
        expected: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'null',
        input: null,
        expected: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'plain object',
        input: { 1: 'value' },
        expected: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'array',
        input: [[1, 'value']],
        expected: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'set',
        input: new Set([1]),
        expected: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'undefined',
        input: undefined,
        expected: `${prefix}${MAP_REQUIRED_MESSAGE_SUFFIX}`,
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
    it('should reject when a key is not an integer', () => {
      const invalid = new Map<number, unknown>([[1.5, 'value']]);
      try {
        keyInfoSchema.parse(invalid as Map<number, unknown>);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          `KeyInfo.Key: ${INT_INTEGER_MESSAGE_SUFFIX}`
        );
      }
    });
  });
});
