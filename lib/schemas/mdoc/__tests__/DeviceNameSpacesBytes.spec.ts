import { TypedMap } from '@jfromaniello/typedmap';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ByteString } from '@/cbor/ByteString';
import { KVMap } from '@/types/KVMap';
import { deviceNameSpacesBytesSchema } from '../DeviceNameSpacesBytes';

describe('DeviceNameSpacesBytes', () => {
  it('should accept valid CBOR tags', () => {
    const validTags = [
      new ByteString(new TypedMap<KVMap<Record<string, never>>>()),
      new ByteString(
        new TypedMap<KVMap<Record<string, unknown>>>([
          ['org.iso.18013.5.1', { given_name: 'John' }],
        ])
      ),
    ];

    validTags.forEach((tag) => {
      const result = deviceNameSpacesBytesSchema.parse(tag);
      expect(result).toBeInstanceOf(ByteString);
      expect(result.data).toEqual(tag.data);
    });
  });

  it('should throw specific error messages for invalid input', () => {
    const testCases = [
      {
        input: null,
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        input: undefined,
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        input: true,
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        input: 123,
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        input: 'string',
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        input: [],
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        input: {},
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        input: { tag: 24, value: 0 },
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
    ];

    testCases.forEach((testCase) => {
      try {
        deviceNameSpacesBytesSchema.parse(testCase.input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(testCase.expectedMessage);
      }
    });
  });

  it('should throw error for invalid device name spaces structure with null value', () => {
    // Test with null value to trigger DeviceSignedItems error
    const invalidByteString = new ByteString(
      new TypedMap<KVMap<Record<string, unknown>>>([
        ['org.iso.18013.5.1', null],
      ])
    );

    try {
      deviceNameSpacesBytesSchema.parse(invalidByteString);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'DeviceSignedItems: Expected an object with data element identifiers as keys and valid data element values. Please provide a valid device-signed items mapping.'
      );
    }
  });

  it('should throw error for invalid device name spaces structure with string value', () => {
    // Test with string value to trigger DeviceSignedItems error
    const invalidByteString = new ByteString(
      new TypedMap<KVMap<Record<string, unknown>>>([
        ['org.iso.18013.5.1', 'invalid-string-value'],
      ])
    );

    try {
      deviceNameSpacesBytesSchema.parse(invalidByteString);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'DeviceSignedItems: Expected an object with data element identifiers as keys and valid data element values. Please provide a valid device-signed items mapping.'
      );
    }
  });
});
