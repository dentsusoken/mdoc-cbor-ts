import { describe, expect, it } from 'vitest';
import { documentErrorSchema } from '../DocumentError';
import { z } from 'zod';

describe('DocumentError', () => {
  describe('should accept valid document errors', () => {
    const testCases = [
      {
        name: 'single document error',
        input: {
          'org.iso.18013.5.1.mDL': 0,
        },
      },
      {
        name: 'multiple document errors',
        input: {
          'com.example.document': 1,
          'test.document': -1,
        },
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
        input: {},
        expectedMessage:
          'DocumentError: At least one document type and error code pair is required.',
      },
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'DocumentError: Expected an object with document types as keys and error codes as values.',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'DocumentError: Expected an object with document types as keys and error codes as values.',
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage:
          'DocumentError: Expected an object with document types as keys and error codes as values.',
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage:
          'DocumentError: Expected an object with document types as keys and error codes as values.',
      },
      {
        name: 'array input',
        input: [],
        expectedMessage:
          'DocumentError: Expected an object with document types as keys and error codes as values.',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'DocumentError: This field is required. Please provide a valid document error object.',
      },
      {
        name: 'object with null error code value',
        input: {
          'org.iso.18013.5.1.mDL': null,
        },
        expectedMessage:
          'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.',
      },
      {
        name: 'object with decimal error code value',
        input: {
          'org.iso.18013.5.1.mDL': 1.5,
        },
        expectedMessage:
          'ErrorCode: Please provide an integer (no decimal places).',
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
  });
});
