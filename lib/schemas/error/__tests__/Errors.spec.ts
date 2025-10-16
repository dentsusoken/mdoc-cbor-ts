import { describe, expect, it } from 'vitest';
import { errorsSchema } from '../Errors';
import {
  mapEmptyMessage,
  mapInvalidTypeMessage,
} from '@/schemas/common/container/Map';
import { intIntegerMessage } from '@/schemas/common/Int';
import { requiredMessage } from '@/schemas/common/Required';
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
    const testCases = [
      {
        name: 'empty record',
        input: new Map(),
        expectedMessage: mapEmptyMessage('Errors'),
      },
      {
        name: 'null input',
        input: null,
        expectedMessage: requiredMessage('Errors'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: mapInvalidTypeMessage('Errors'),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: mapInvalidTypeMessage('Errors'),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: mapInvalidTypeMessage('Errors'),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: mapInvalidTypeMessage('Errors'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: requiredMessage('Errors'),
      },
      {
        name: 'object with null error items value',
        input: new Map<string, unknown>([['org.iso.18013.5.1', null]]),
        expectedMessage: requiredMessage('ErrorItems'),
      },
      {
        name: 'object with null error code value',
        input: new Map<string, Map<string, unknown>>([
          [
            'org.iso.18013.5.1',
            new Map<string, unknown>([['valid_identifier', null]]),
          ],
        ]),
        expectedMessage: requiredMessage('ErrorCode'),
      },
      {
        name: 'object with decimal error code value',
        input: new Map<string, Map<string, number>>([
          [
            'org.iso.18013.5.1',
            new Map<string, number>([['valid_identifier', 1.5]]),
          ],
        ]),
        expectedMessage: intIntegerMessage('ErrorCode'),
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
        expect(zodError.issues[0].message).toBe(mapEmptyMessage('Errors'));
      }
    });
  });
});
