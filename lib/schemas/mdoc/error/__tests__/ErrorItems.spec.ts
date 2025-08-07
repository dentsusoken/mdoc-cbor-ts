import { describe, expect, it } from 'vitest';
import { errorItemsSchema } from '../ErrorItems';
import { z } from 'zod';

describe('ErrorItems', () => {
  describe('should accept valid error items', () => {
    const testCases = [
      {
        name: 'single error item',
        input: {
          given_name: 0,
        },
      },
      {
        name: 'multiple error items',
        input: {
          age: 1,
          height: -1,
        },
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
        input: {},
        expectedMessage:
          'ErrorItems: At least one data element identifier and error code pair is required.',
      },
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'ErrorItems: Expected an object with data element identifiers as keys and error codes as values.',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'ErrorItems: Expected an object with data element identifiers as keys and error codes as values.',
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage:
          'ErrorItems: Expected an object with data element identifiers as keys and error codes as values.',
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage:
          'ErrorItems: Expected an object with data element identifiers as keys and error codes as values.',
      },
      {
        name: 'array input',
        input: [],
        expectedMessage:
          'ErrorItems: Expected an object with data element identifiers as keys and error codes as values.',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'ErrorItems: This field is required. Please provide a valid error items object.',
      },
      {
        name: 'object with null error code value',
        input: {
          valid_identifier: null,
        },
        expectedMessage:
          'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.',
      },
      {
        name: 'object with decimal error code value',
        input: {
          valid_identifier: 1.5,
        },
        expectedMessage:
          'ErrorCode: Please provide an integer (no decimal places).',
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
  });
});
