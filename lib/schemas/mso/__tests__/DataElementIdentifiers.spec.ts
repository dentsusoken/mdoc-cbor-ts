import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { dataElementIdentifiersSchema } from '../DataElementIdentifiers';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { containerEmptyMessage } from '@/schemas/messages/containerEmptyMessage';
import { getTypeName } from '@/utils/getTypeName';

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
        expected: containerEmptyMessage('DataElementIdentifiers'),
      },
      {
        name: 'string input',
        input: 'not-array',
        expected: containerInvalidTypeMessage({
          target: 'DataElementIdentifiers',
          expected: 'Array',
          received: getTypeName('not-array'),
        }),
      },
      {
        name: 'number input',
        input: 123,
        expected: containerInvalidTypeMessage({
          target: 'DataElementIdentifiers',
          expected: 'Array',
          received: getTypeName(123),
        }),
      },
      {
        name: 'boolean input',
        input: true,
        expected: containerInvalidTypeMessage({
          target: 'DataElementIdentifiers',
          expected: 'Array',
          received: getTypeName(true),
        }),
      },
      {
        name: 'null input',
        input: null,
        expected: containerInvalidTypeMessage({
          target: 'DataElementIdentifiers',
          expected: 'Array',
          received: getTypeName(null),
        }),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: containerInvalidTypeMessage({
          target: 'DataElementIdentifiers',
          expected: 'Array',
          received: getTypeName(undefined),
        }),
      },
      {
        name: 'plain object input',
        input: {},
        expected: containerInvalidTypeMessage({
          target: 'DataElementIdentifiers',
          expected: 'Array',
          received: getTypeName({}),
        }),
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
