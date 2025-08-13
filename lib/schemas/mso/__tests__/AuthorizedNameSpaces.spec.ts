import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { authorizedNameSpacesSchema } from '../AuthorizedNameSpaces';
import {
  ARRAY_INVALID_TYPE_MESSAGE_SUFFIX,
  ARRAY_REQUIRED_MESSAGE_SUFFIX,
  ARRAY_EMPTY_MESSAGE_SUFFIX,
} from '@/schemas/common/Array';

describe('AuthorizedNameSpaces', () => {
  const TARGET = 'AuthorizedNameSpaces';
  const prefix = `${TARGET}: `;

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
        expect(zodError.issues[0].message).toBe(
          `${prefix}${ARRAY_EMPTY_MESSAGE_SUFFIX}`
        );
      }
    });
  });
});
