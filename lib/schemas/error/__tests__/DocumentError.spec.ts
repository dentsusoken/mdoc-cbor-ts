import { describe, expect, it } from 'vitest';
import { documentErrorSchema } from '../DocumentError';
import {
  MAP_EMPTY_MESSAGE_SUFFIX,
  MAP_INVALID_TYPE_MESSAGE_SUFFIX,
  MAP_REQUIRED_MESSAGE_SUFFIX,
} from '@/schemas/common/Map';
import {
  INT_INVALID_TYPE_MESSAGE_SUFFIX,
  INT_INTEGER_MESSAGE_SUFFIX,
} from '@/schemas/common/Int';
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
    const prefix = 'DocumentError: ';
    const DOCUMENT_ERROR_EMPTY_MESSAGE = `${prefix}${MAP_EMPTY_MESSAGE_SUFFIX}`;
    const testCases = [
      {
        name: 'empty record',
        input: new Map(),
        expectedMessage: DOCUMENT_ERROR_EMPTY_MESSAGE,
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
        input: new Map<string, unknown>([['org.iso.18013.5.1.mDL', null]]),
        expectedMessage: `ErrorCode: ${INT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'object with decimal error code value',
        input: new Map<string, number>([['org.iso.18013.5.1.mDL', 1.5]]),
        expectedMessage: `ErrorCode: ${INT_INTEGER_MESSAGE_SUFFIX}`,
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
        expect(zodError.issues[0].message).toBe(DOCUMENT_ERROR_EMPTY_MESSAGE);
      }
    });
  });
});
