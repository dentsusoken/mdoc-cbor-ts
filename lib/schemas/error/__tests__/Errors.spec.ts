import { describe, expect, it } from 'vitest';
import { errorsSchema } from '../Errors';
import {
  MAP_EMPTY_MESSAGE_SUFFIX,
  MAP_INVALID_TYPE_MESSAGE_SUFFIX,
  MAP_REQUIRED_MESSAGE_SUFFIX,
} from '@/schemas/common/Map';
import { INT_INTEGER_MESSAGE_SUFFIX } from '@/schemas/common/Int';
import { z } from 'zod';

describe('Errors', () => {
  describe('should accept valid errors', () => {
    const testCases = [
      {
        name: 'single namespace with single error',
        input: new Map<string, Map<string, number>>([
          ['org.iso.18013.5.1', new Map<string, number>([['given_name', 0]])],
        ]),
      },
      {
        name: 'multiple namespaces with multiple errors',
        input: new Map<string, Map<string, number>>([
          [
            'com.example.namespace',
            new Map<string, number>([
              ['item1', 1],
              ['item2', -1],
            ]),
          ],
          ['test.namespace', new Map<string, number>([['item3', 2]])],
        ]),
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = errorsSchema.parse(input);
        expect(result).toEqual(input);
      });
    });
  });

  describe('should throw error for invalid inputs', () => {
    const prefix = 'Errors: ';
    const ERRORS_EMPTY_MESSAGE = `${prefix}${MAP_EMPTY_MESSAGE_SUFFIX}`;
    const testCases = [
      {
        name: 'empty record',
        input: new Map(),
        expectedMessage: ERRORS_EMPTY_MESSAGE,
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
        name: 'object with null error items value',
        input: new Map<string, unknown>([['org.iso.18013.5.1', null]]),
        expectedMessage: `ErrorItems: ${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'object with null error code value',
        input: new Map<string, Map<string, unknown>>([
          [
            'org.iso.18013.5.1',
            new Map<string, unknown>([['valid_identifier', null]]),
          ],
        ]),
        expectedMessage:
          'ErrorCode: Expected a number, but received a different type. Please provide an integer.',
      },
      {
        name: 'object with decimal error code value',
        input: new Map<string, Map<string, number>>([
          [
            'org.iso.18013.5.1',
            new Map<string, number>([['valid_identifier', 1.5]]),
          ],
        ]),
        expectedMessage: `ErrorCode: ${INT_INTEGER_MESSAGE_SUFFIX}`,
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          errorsSchema.parse(input);
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
        errorsSchema.parse(new Map());
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(ERRORS_EMPTY_MESSAGE);
      }
    });
  });
});
