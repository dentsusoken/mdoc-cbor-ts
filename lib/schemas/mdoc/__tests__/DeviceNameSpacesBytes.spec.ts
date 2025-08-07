import { TypedMap } from '@jfromaniello/typedmap';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ByteString } from '@/cbor/ByteString';
import { KVMap } from '@/types/KVMap';
import { deviceNameSpacesBytesSchema } from '../DeviceNameSpacesBytes';

describe('DeviceNameSpacesBytes', () => {
  describe('should accept valid CBOR tags', () => {
    const testCases = [
      {
        name: 'empty TypedMap',
        input: new ByteString(new TypedMap<KVMap<Record<string, never>>>()),
      },
      {
        name: 'TypedMap with data',
        input: new ByteString(
          new TypedMap<KVMap<Record<string, unknown>>>([
            ['org.iso.18013.5.1', { given_name: 'John' }],
          ])
        ),
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = deviceNameSpacesBytesSchema.parse(input);
        expect(result).toBeInstanceOf(ByteString);
        expect(result.data).toEqual(input.data);
      });
    });
  });

  describe('should throw specific error messages for invalid input', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        name: 'array input',
        input: [],
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        name: 'object input',
        input: {},
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        name: 'tag object input',
        input: { tag: 24, value: 0 },
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceNameSpacesBytesSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });

  describe('should throw error for invalid device name spaces structure', () => {
    const testCases = [
      {
        name: 'null value',
        input: new ByteString(
          new TypedMap<KVMap<Record<string, unknown>>>([
            ['org.iso.18013.5.1', null],
          ])
        ),
        expectedMessage:
          'DeviceSignedItems: Expected an object with data element identifiers as keys and valid data element values. Please provide a valid device-signed items mapping.',
      },
      {
        name: 'string value',
        input: new ByteString(
          new TypedMap<KVMap<Record<string, unknown>>>([
            ['org.iso.18013.5.1', 'invalid-string-value'],
          ])
        ),
        expectedMessage:
          'DeviceSignedItems: Expected an object with data element identifiers as keys and valid data element values. Please provide a valid device-signed items mapping.',
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceNameSpacesBytesSchema.parse(input);
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
