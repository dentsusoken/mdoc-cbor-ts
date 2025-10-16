import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { unprotectedHeadersSchema } from '../UnprotectedHeaders';
import { uintInvalidTypeMessage } from '@/schemas/common/Uint';
import { mapInvalidTypeMessage } from '@/schemas/common/container/Map';
import { requiredMessage } from '@/schemas/common/Required';

describe('UnprotectedHeaders', () => {
  describe('should accept valid maps', () => {
    it('should accept empty map (allowEmpty is true)', () => {
      const input = new Map<number, unknown>();
      const result = unprotectedHeadersSchema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should accept map with numeric keys and any values', () => {
      const input = new Map<number, unknown>([
        [1, 'algo'],
        [2, 42],
        [4, Uint8Array.from([1, 2])],
      ]);
      const result = unprotectedHeadersSchema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result).toEqual(input);
    });

    // string keys are not allowed for UnprotectedHeaders (must be unsigned integer keys)
  });

  describe('should reject invalid inputs with consistent messages', () => {
    const target = 'UnprotectedHeaders';
    const invalid = mapInvalidTypeMessage(target);
    const required = requiredMessage(target);
    const cases: { name: string; input: unknown; expected: string }[] = [
      { name: 'string input', input: 'not a map', expected: invalid },
      { name: 'number input', input: 123, expected: invalid },
      { name: 'boolean input', input: true, expected: invalid },
      { name: 'null input', input: null, expected: required },
      { name: 'undefined input', input: undefined, expected: required },
      { name: 'plain object input', input: { a: 1 }, expected: invalid },
      { name: 'array input', input: [['a', 1]], expected: invalid },
      { name: 'set input', input: new Set([1, 2]), expected: invalid },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          unprotectedHeadersSchema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('should reject invalid key types in keys', () => {
    it('should report uint error message from Key schema', () => {
      const input = new Map<unknown, unknown>([[{}, 'value']]);
      try {
        unprotectedHeadersSchema.parse(input as never);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(uintInvalidTypeMessage('Key'));
      }
    });
  });
});
