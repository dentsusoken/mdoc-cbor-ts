import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { authorizedNameSpacesSchema } from '../AuthorizedNameSpaces';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { containerEmptyMessage } from '@/schemas/messages/containerEmptyMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('AuthorizedNameSpaces', () => {
  const TARGET = 'AuthorizedNameSpaces';

  describe('should accept valid non-empty arrays', () => {
    const cases: Array<{ name: string; input: string[] }> = [
      { name: 'single item', input: ['org.iso.18013.5.1'] },
      {
        name: 'multiple items',
        input: ['org.iso.18013.5.1', 'com.example.namespace'],
      },
    ];

    cases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = authorizedNameSpacesSchema.parse(input);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual(input);
      });
    });
  });

  describe('should reject invalid types with consistent message', () => {
    const cases: { name: string; input: unknown; expected: string }[] = [
      {
        name: 'boolean input',
        input: true,
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Array',
          received: getTypeName(true),
        }),
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Array',
          received: getTypeName({ key: 'value' }),
        }),
      },
      {
        name: 'null input',
        input: null,
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Array',
          received: getTypeName(null),
        }),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Array',
          received: getTypeName(undefined),
        }),
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          authorizedNameSpacesSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('should enforce non-empty array', () => {
    it('should reject empty array by default', () => {
      try {
        authorizedNameSpacesSchema.parse([]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(containerEmptyMessage(TARGET));
      }
    });
  });
});
