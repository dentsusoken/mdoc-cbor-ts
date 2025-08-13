import { TypedMap } from '@jfromaniello/typedmap';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ByteString } from '@/cbor/ByteString';
import {
  DEVICE_NAMESPACES_BYTES_INVALID_TYPE_MESSAGE,
  deviceNameSpacesBytesSchema,
} from '../DeviceNameSpacesBytes';
import { DEVICE_NAMESPACES_EMPTY_MESSAGE } from '../DeviceNameSpaces';
import { DEVICE_SIGNED_ITEMS_INVALID_TYPE_MESSAGE } from '../DeviceSignedItems';

describe('DeviceNameSpacesBytes', () => {
  describe('should accept valid CBOR tags', () => {
    it('should accept TypedMap with data', () => {
      const input = new ByteString(
        new TypedMap<[string, unknown]>([
          [
            'org.iso.18013.5.1',
            new Map<string, unknown>([['given_name', 'John']]),
          ],
        ])
      );
      const result = deviceNameSpacesBytesSchema.parse(input);
      expect(result).toBeInstanceOf(ByteString);
      expect(result.data).toEqual(input.data);
    });

    it('should throw for empty TypedMap', () => {
      const input = new ByteString(new TypedMap<[string, unknown]>());
      try {
        deviceNameSpacesBytesSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          DEVICE_NAMESPACES_EMPTY_MESSAGE
        );
      }
    });
  });

  describe('should throw specific error messages for invalid input', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: DEVICE_NAMESPACES_BYTES_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: DEVICE_NAMESPACES_BYTES_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: DEVICE_NAMESPACES_BYTES_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: DEVICE_NAMESPACES_BYTES_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: DEVICE_NAMESPACES_BYTES_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: DEVICE_NAMESPACES_BYTES_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'object input',
        input: {},
        expectedMessage: DEVICE_NAMESPACES_BYTES_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'tag object input',
        input: { tag: 24, value: 0 },
        expectedMessage: DEVICE_NAMESPACES_BYTES_INVALID_TYPE_MESSAGE,
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
          new TypedMap<[string, unknown]>([
            ['org.iso.18013.5.1', null as unknown as Map<string, unknown>],
          ])
        ),
        expectedMessage: DEVICE_SIGNED_ITEMS_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'string value',
        input: new ByteString(
          new TypedMap<[string, unknown]>([
            [
              'org.iso.18013.5.1',
              'invalid-string-value' as unknown as Map<string, unknown>,
            ],
          ])
        ),
        expectedMessage: DEVICE_SIGNED_ITEMS_INVALID_TYPE_MESSAGE,
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
