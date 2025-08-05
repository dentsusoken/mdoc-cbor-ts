import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceNameSpacesSchema } from '../DeviceNameSpaces';

describe('DeviceNameSpaces', () => {
  it('should accept valid device name spaces records', () => {
    const validRecords = [
      {
        'com.example.namespace': {
          item1: new Tag(24, 0),
          item2: new Tag(24, 123),
        },
        'test.namespace': {
          item3: new Tag(24, 456),
        },
      },
    ];

    validRecords.forEach((record) => {
      const result = deviceNameSpacesSchema.parse(record);
      expect(result).toEqual(record);
    });
  });

  it('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        input: null,
        expectedMessage:
          'DeviceNameSpaces: Expected an object with namespace keys and device-signed items values. Please provide a valid namespace mapping.',
      },
      {
        input: undefined,
        expectedMessage:
          'DeviceNameSpaces: This field is required. Please provide a namespace mapping object.',
      },
      {
        input: true,
        expectedMessage:
          'DeviceNameSpaces: Expected an object with namespace keys and device-signed items values. Please provide a valid namespace mapping.',
      },
      {
        input: 123,
        expectedMessage:
          'DeviceNameSpaces: Expected an object with namespace keys and device-signed items values. Please provide a valid namespace mapping.',
      },
      {
        input: 'string',
        expectedMessage:
          'DeviceNameSpaces: Expected an object with namespace keys and device-signed items values. Please provide a valid namespace mapping.',
      },
      {
        input: [],
        expectedMessage:
          'DeviceNameSpaces: Expected an object with namespace keys and device-signed items values. Please provide a valid namespace mapping.',
      },
    ];

    testCases.forEach((testCase) => {
      try {
        deviceNameSpacesSchema.parse(testCase.input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(testCase.expectedMessage);
      }
    });
  });

  it('should accept empty object', () => {
    const emptyObject = {};
    const result = deviceNameSpacesSchema.parse(emptyObject);
    expect(result).toEqual(emptyObject);
  });

  it('should throw error for object with invalid namespace keys', () => {
    try {
      deviceNameSpacesSchema.parse({
        'invalid-namespace': {},
      });
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'DeviceSignedItems: At least one data element must be provided. The object cannot be empty.'
      );
    }
  });

  it('should throw error for object with invalid values', () => {
    try {
      deviceNameSpacesSchema.parse({
        'org.iso.18013.5.1': null,
      });
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe('Expected object, received null');
    }
  });
});
