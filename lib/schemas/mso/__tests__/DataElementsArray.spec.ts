import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { dataElementsArraySchema } from '../DataElementsArray';
import {
  arrayInvalidTypeMessage,
  arrayRequiredMessage,
  arrayEmptyMessage,
} from '@/schemas/common/Array';

describe('DataElementsArray', () => {
  describe('success cases', () => {
    it('should accept a non-empty array of identifiers', () => {
      const input = ['given_name', 'family_name'];
      const result = dataElementsArraySchema.parse(input);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(input);
    });
  });

  describe('error cases', () => {
    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'empty array',
        input: [],
        expected: arrayEmptyMessage('DataElementsArray'),
      },
      {
        name: 'string input',
        input: 'not-array',
        expected: arrayInvalidTypeMessage('DataElementsArray'),
      },
      {
        name: 'number input',
        input: 123,
        expected: arrayInvalidTypeMessage('DataElementsArray'),
      },
      {
        name: 'boolean input',
        input: true,
        expected: arrayInvalidTypeMessage('DataElementsArray'),
      },
      {
        name: 'null input',
        input: null,
        expected: arrayInvalidTypeMessage('DataElementsArray'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: arrayRequiredMessage('DataElementsArray'),
      },
      {
        name: 'plain object input',
        input: {},
        expected: arrayInvalidTypeMessage('DataElementsArray'),
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(name, () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dataElementsArraySchema.parse(input as any);
          expect.unreachable('Expected parsing to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });
});
