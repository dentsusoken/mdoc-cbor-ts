import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  deviceNameSpacesSchema,
  DEVICE_NAMESPACES_EMPTY_MESSAGE,
  DEVICE_NAMESPACES_INVALID_TYPE_MESSAGE,
  DEVICE_NAMESPACES_REQUIRED_MESSAGE,
} from '../DeviceNameSpaces';
import { nameSpaceSchema } from '@/schemas/common/NameSpace';
import { DEVICE_SIGNED_ITEMS_INVALID_TYPE_MESSAGE } from '../DeviceSignedItems';

// Constants are imported from the schema for consistency

describe('DeviceNameSpaces', () => {
  describe('should accept valid device name spaces records', () => {
    const testCases = [
      {
        name: 'multiple namespaces with tagged items',
        input: new Map<string, Map<string, unknown>>([
          [
            'com.example.namespace',
            new Map<string, unknown>([
              ['item1', new Tag(0, 24)],
              ['item2', new Tag(123, 24)],
            ]),
          ],
          [
            'test.namespace',
            new Map<string, unknown>([['item3', new Tag(456, 24)]]),
          ],
        ]),
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = deviceNameSpacesSchema.parse(input);
        expect(result).toBeInstanceOf(Map);
        expect(Array.from(result.entries())).toEqual(
          Array.from(input.entries())
        );
      });
    });
  });

  // Empty Map is not allowed by schema (must provide at least one namespace)

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: DEVICE_NAMESPACES_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: DEVICE_NAMESPACES_REQUIRED_MESSAGE,
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: DEVICE_NAMESPACES_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: DEVICE_NAMESPACES_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: DEVICE_NAMESPACES_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: DEVICE_NAMESPACES_INVALID_TYPE_MESSAGE,
      },
    ];

    it('should throw the expected message for all invalid type inputs', () => {
      testCases.forEach(({ input, expectedMessage }) => {
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

  describe('should throw error for invalid map entries', () => {
    const emptyNamespaceMessage: string = ((): string => {
      try {
        nameSpaceSchema.parse('');
        return '';
      } catch (error) {
        const zodError = error as z.ZodError;
        return zodError.issues[0].message;
      }
    })();

    const testCases = [
      {
        name: 'empty Map',
        input: new Map<string, Map<string, unknown>>([]),
        expectedMessage: DEVICE_NAMESPACES_EMPTY_MESSAGE,
      },
      {
        name: 'empty namespace key',
        input: new Map<string, unknown>([['', new Map([['item', 'value']])]]),
        expectedMessage: emptyNamespaceMessage,
      },
      {
        name: 'null value for items',
        input: new Map<string, unknown>([
          ['org.iso.18013.5.1', null as unknown as Map<string, unknown>],
        ]),
        expectedMessage: DEVICE_SIGNED_ITEMS_INVALID_TYPE_MESSAGE,
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, (): void => {
        try {
          deviceNameSpacesSchema.parse(input as unknown);
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
