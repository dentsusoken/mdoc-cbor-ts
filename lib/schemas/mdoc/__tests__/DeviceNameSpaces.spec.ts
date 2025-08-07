import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceNameSpacesSchema } from '../DeviceNameSpaces';

describe('DeviceNameSpaces', () => {
  describe('should accept valid device name spaces records', () => {
    const testCases = [
      {
        name: 'multiple namespaces with tagged items',
        input: {
          'com.example.namespace': {
            item1: new Tag(24, 0),
            item2: new Tag(24, 123),
          },
          'test.namespace': {
            item3: new Tag(24, 456),
          },
        },
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = deviceNameSpacesSchema.parse(input);
        expect(result).toEqual(input);
      });
    });
  });

  describe('should accept empty object', () => {
    it('should accept empty object', () => {
      const emptyObject = {};
      const result = deviceNameSpacesSchema.parse(emptyObject);
      expect(result).toEqual(emptyObject);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'DeviceNameSpaces: Expected an object with namespace keys and device-signed items values. Please provide a valid namespace mapping.',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'DeviceNameSpaces: This field is required. Please provide a namespace mapping object.',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'DeviceNameSpaces: Expected an object with namespace keys and device-signed items values. Please provide a valid namespace mapping.',
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage:
          'DeviceNameSpaces: Expected an object with namespace keys and device-signed items values. Please provide a valid namespace mapping.',
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage:
          'DeviceNameSpaces: Expected an object with namespace keys and device-signed items values. Please provide a valid namespace mapping.',
      },
      {
        name: 'array input',
        input: [],
        expectedMessage:
          'DeviceNameSpaces: Expected an object with namespace keys and device-signed items values. Please provide a valid namespace mapping.',
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceNameSpacesSchema.parse(input);
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
        name: 'object with invalid namespace keys',
        input: {
          'invalid-namespace': {},
        },
        expectedMessage:
          'DeviceSignedItems: At least one data element must be provided. The object cannot be empty.',
      },
      {
        name: 'object with null values',
        input: {
          'org.iso.18013.5.1': null,
        },
        expectedMessage:
          'DeviceSignedItems: Expected an object with data element identifiers as keys and valid data element values. Please provide a valid device-signed items mapping.',
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceNameSpacesSchema.parse(input);
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
