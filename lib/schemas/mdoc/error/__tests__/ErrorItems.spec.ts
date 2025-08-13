import { describe, expect, it } from 'vitest';
import { errorItemsSchema } from '../ErrorItems';
import {
  MAP_EMPTY_MESSAGE_SUFFIX,
  MAP_INVALID_TYPE_MESSAGE_SUFFIX,
  MAP_REQUIRED_MESSAGE_SUFFIX,
} from '../../../common/Map';
import {
  INT_INVALID_TYPE_MESSAGE_SUFFIX,
  INT_INTEGER_MESSAGE_SUFFIX,
} from '../../../common/Int';
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
    const prefix = 'ErrorItems: ';
    const ERROR_ITEMS_EMPTY_MESSAGE = `${prefix}${MAP_EMPTY_MESSAGE_SUFFIX}`;
    const testCases = [
      {
        name: 'empty record',
        input: new Map(),
        expectedMessage: ERROR_ITEMS_EMPTY_MESSAGE,
      },
      {
        name: 'null input',
        input: null,
        expectedMessage: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: `${prefix}${MAP_REQUIRED_MESSAGE_SUFFIX}`,
      },
      {
        name: 'object with null error code value',
        input: new Map<string, unknown>([['valid_identifier', null]]),
        expectedMessage: `ErrorCode: ${INT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'object with decimal error code value',
        input: new Map<string, number>([['valid_identifier', 1.5]]),
        expectedMessage: `ErrorCode: ${INT_INTEGER_MESSAGE_SUFFIX}`,
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
        expect(zodError.issues[0].message).toBe(ERROR_ITEMS_EMPTY_MESSAGE);
      }
    });
  });
});
