import { describe, expect, it } from 'vitest';
import { documentErrorSchema } from '../DocumentError';
import {
  mapEmptyMessage,
  mapInvalidTypeMessage,
} from '@/schemas/common/container/Map';
import { intIntegerMessage } from '@/schemas/common/Int';
import { requiredMessage } from '@/schemas/common/Required';
import { z } from 'zod';

describe('DocumentError', () => {
  describe('should accept valid document errors', () => {
    const testCases = [
      {
        name: 'single document error',
        input: new Map<string, number>([['org.iso.18013.5.1.mDL', 0]]),
      },
      {
        name: 'multiple document errors',
        input: new Map<string, number>([
          ['com.example.document', 1],
          ['test.document', -1],
        ]),
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = documentErrorSchema.parse(input);
        expect(result).toEqual(input);
      });
    });
  });

  describe('should throw error for invalid inputs', () => {
    const testCases = [
      {
        name: 'empty record',
        input: new Map(),
        expectedMessage: mapEmptyMessage('DocumentError'),
      },
      {
        name: 'null input',
        input: null,
        expectedMessage: requiredMessage('DocumentError'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: mapInvalidTypeMessage('DocumentError'),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: mapInvalidTypeMessage('DocumentError'),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: mapInvalidTypeMessage('DocumentError'),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: mapInvalidTypeMessage('DocumentError'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: requiredMessage('DocumentError'),
      },
      {
        name: 'object with null error code value',
        input: new Map<string, unknown>([['org.iso.18013.5.1.mDL', null]]),
        expectedMessage: requiredMessage('ErrorCode'),
      },
      {
        name: 'object with decimal error code value',
        input: new Map<string, number>([['org.iso.18013.5.1.mDL', 1.5]]),
        expectedMessage: intIntegerMessage('ErrorCode'),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          documentErrorSchema.parse(input);
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
        documentErrorSchema.parse(new Map());
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          mapEmptyMessage('DocumentError')
        );
      }
    });
  });
});
