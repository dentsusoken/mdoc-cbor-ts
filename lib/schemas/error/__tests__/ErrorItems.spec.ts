import { describe, expect, it } from 'vitest';
import { errorItemsSchema } from '../ErrorItems';
import {
  mapEmptyMessage,
  mapInvalidTypeMessage,
} from '@/schemas/common/container/Map';
import { intIntegerMessage } from '@/schemas/common/Int';
import { requiredMessage } from '@/schemas/common/Required';
import { z } from 'zod';

describe('ErrorItems', () => {
  describe('should accept valid error items', () => {
    const testCases = [
      {
        name: 'single error item',
        input: new Map<string, number>([['given_name', 0]]),
      },
      {
        name: 'multiple error items',
        input: new Map<string, number>([
          ['age', 1],
          ['height', -1],
        ]),
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = errorItemsSchema.parse(input);
        expect(result).toEqual(input);
      });
    });
  });

  describe('should throw error for invalid inputs', () => {
    const testCases = [
      {
        name: 'empty record',
        input: new Map(),
        expectedMessage: mapEmptyMessage('ErrorItems'),
      },
      {
        name: 'null input',
        input: null,
        expectedMessage: requiredMessage('ErrorItems'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: mapInvalidTypeMessage('ErrorItems'),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: mapInvalidTypeMessage('ErrorItems'),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: mapInvalidTypeMessage('ErrorItems'),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: mapInvalidTypeMessage('ErrorItems'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: requiredMessage('ErrorItems'),
      },
      {
        name: 'object with null error code value',
        input: new Map<string, unknown>([['valid_identifier', null]]),
        expectedMessage: requiredMessage('ErrorCode'),
      },
      {
        name: 'object with decimal error code value',
        input: new Map<string, number>([['valid_identifier', 1.5]]),
        expectedMessage: intIntegerMessage('ErrorCode'),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          errorItemsSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });

    it('should throw EMPTY_MESSAGE for empty map', () => {
      try {
        errorItemsSchema.parse(new Map());
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(mapEmptyMessage('ErrorItems'));
      }
    });
  });
});
