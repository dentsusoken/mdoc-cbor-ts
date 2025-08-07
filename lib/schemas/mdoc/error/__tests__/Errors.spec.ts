import { describe, expect, it } from 'vitest';
import { errorsSchema } from '../Errors';
import { z } from 'zod';

describe('Errors', () => {
  describe('should accept valid errors', () => {
    const testCases = [
      {
        name: 'single namespace with single error',
        input: {
          'org.iso.18013.5.1': {
            given_name: 0,
          },
        },
      },
      {
        name: 'multiple namespaces with multiple errors',
        input: {
          'com.example.namespace': {
            item1: 1,
            item2: -1,
          },
          'test.namespace': {
            item3: 2,
          },
        },
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
        input: {},
        expectedMessage:
          'Errors: At least one namespace and error items pair is required.',
      },
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'Errors: Expected an object with namespaces as keys and error items as values.',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'Errors: Expected an object with namespaces as keys and error items as values.',
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage:
          'Errors: Expected an object with namespaces as keys and error items as values.',
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage:
          'Errors: Expected an object with namespaces as keys and error items as values.',
      },
      {
        name: 'array input',
        input: [],
        expectedMessage:
          'Errors: Expected an object with namespaces as keys and error items as values.',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'Errors: This field is required. Please provide a valid errors object.',
      },
      {
        name: 'object with null error items value',
        input: {
          'org.iso.18013.5.1': null,
        },
        expectedMessage:
          'ErrorItems: Expected an object with data element identifiers as keys and error codes as values.',
      },
      {
        name: 'object with null error code value',
        input: {
          'org.iso.18013.5.1': {
            valid_identifier: null,
          },
        },
        expectedMessage:
          'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.',
      },
      {
        name: 'object with decimal error code value',
        input: {
          'org.iso.18013.5.1': {
            valid_identifier: 1.5,
          },
        },
        expectedMessage:
          'ErrorCode: Please provide an integer (no decimal places).',
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
  });
});
