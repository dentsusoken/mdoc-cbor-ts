import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceSignedItemsSchema } from '../DeviceSignedItems';

describe('DeviceSignedItems', () => {
  describe('should accept valid device signed items', () => {
    const testCases = [
      {
        name: 'personal information',
        input: {
          given_name: 'John',
          family_name: 'Doe',
        },
      },
      {
        name: 'numeric data',
        input: {
          age: 30,
          height: 180.5,
        },
      },
      {
        name: 'tagged data',
        input: {
          photo: new Tag(24, 0),
          signature: new Tag(24, 123),
        },
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = deviceSignedItemsSchema.parse(input);
        expect(result).toEqual(input);
      });
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'DeviceSignedItems: Expected an object with data element identifiers as keys and valid data element values. Please provide a valid device-signed items mapping.',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'DeviceSignedItems: This field is required. Please provide a device-signed items mapping object.',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'DeviceSignedItems: Expected an object with data element identifiers as keys and valid data element values. Please provide a valid device-signed items mapping.',
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage:
          'DeviceSignedItems: Expected an object with data element identifiers as keys and valid data element values. Please provide a valid device-signed items mapping.',
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage:
          'DeviceSignedItems: Expected an object with data element identifiers as keys and valid data element values. Please provide a valid device-signed items mapping.',
      },
      {
        name: 'array input',
        input: [],
        expectedMessage:
          'DeviceSignedItems: Expected an object with data element identifiers as keys and valid data element values. Please provide a valid device-signed items mapping.',
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceSignedItemsSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });

  describe('should throw error for invalid objects', () => {
    const testCases = [
      {
        name: 'empty object',
        input: {},
        expectedMessage:
          'DeviceSignedItems: At least one data element must be provided. The object cannot be empty.',
      },

      {
        name: 'object with empty string key',
        input: { '': 'value' },
        expectedMessage:
          'DataElementIdentifier: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")',
      },
      {
        name: 'object with whitespace-only key',
        input: { '   ': 'value' },
        expectedMessage:
          'DataElementIdentifier: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")',
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceSignedItemsSchema.parse(input);
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
