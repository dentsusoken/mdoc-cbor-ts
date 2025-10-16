import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { dataElementIdentifiersSchema } from '../DataElementIdentifiers';
import {
  arrayInvalidTypeMessage,
  arrayEmptyMessage,
} from '@/schemas/common/container/Array';
import { requiredMessage } from '@/schemas/common/Required';

describe('DataElementIdentifiers', () => {
  describe('success cases', () => {
    it('should accept a non-empty array of identifiers', () => {
      const input = ['given_name', 'family_name'];
      const result = dataElementIdentifiersSchema.parse(input);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(input);
    });
  });

  describe('error cases', () => {
    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'empty array',
        input: [],
        expected: arrayEmptyMessage('DataElementIdentifiers'),
      },
      {
        name: 'string input',
        input: 'not-array',
        expected: arrayInvalidTypeMessage('DataElementIdentifiers'),
      },
      {
        name: 'number input',
        input: 123,
        expected: arrayInvalidTypeMessage('DataElementIdentifiers'),
      },
      {
        name: 'boolean input',
        input: true,
        expected: arrayInvalidTypeMessage('DataElementIdentifiers'),
      },
      {
        name: 'null input',
        input: null,
        expected: requiredMessage('DataElementIdentifiers'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: requiredMessage('DataElementIdentifiers'),
      },
      {
        name: 'plain object input',
        input: {},
        expected: arrayInvalidTypeMessage('DataElementIdentifiers'),
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(name, () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dataElementIdentifiersSchema.parse(input as any);
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
