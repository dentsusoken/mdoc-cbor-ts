import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceSignedItemsSchema } from '../DeviceSignedItems';
import {
  mapEmptyMessage,
  mapInvalidTypeMessage,
  mapRequiredMessage,
} from '@/schemas/common/Map';
import { nonEmptyTextEmptyMessage } from '@/schemas/common/NonEmptyText';

describe('DeviceSignedItems', () => {
  describe('should accept valid device signed items', () => {
    const testCases = [
      {
        name: 'personal information',
        input: new Map<string, unknown>([
          ['given_name', 'John'],
          ['family_name', 'Doe'],
        ]),
      },
      {
        name: 'numeric data',
        input: new Map<string, unknown>([
          ['age', 30],
          ['height', 180.5],
        ]),
      },
      {
        name: 'tagged data',
        input: new Map<string, unknown>([
          ['photo', new Tag(0, 24)],
          ['signature', new Tag(123, 24)],
        ]),
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = deviceSignedItemsSchema.parse(input);
        expect(result).toBeInstanceOf(Map);
        expect(Array.from(result.entries())).toEqual(
          Array.from(input.entries())
        );
      });
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: mapInvalidTypeMessage('DeviceSignedItems'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: mapRequiredMessage('DeviceSignedItems'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: mapInvalidTypeMessage('DeviceSignedItems'),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: mapInvalidTypeMessage('DeviceSignedItems'),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: mapInvalidTypeMessage('DeviceSignedItems'),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: mapInvalidTypeMessage('DeviceSignedItems'),
      },
      {
        name: 'plain object (not Map)',
        input: {},
        expectedMessage: mapInvalidTypeMessage('DeviceSignedItems'),
      },
    ];
    it('should throw the expected message for all invalid type inputs', () => {
      testCases.forEach(({ input, expectedMessage }) => {
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

  describe('should enforce content rules for Map inputs', () => {
    const testCases = [
      {
        name: 'empty Map',
        input: new Map<string, unknown>([]),
        expectedMessage: mapEmptyMessage('DeviceSignedItems'),
      },
      {
        name: 'empty string key',
        input: new Map<string, unknown>([['', 'value']]),
        expectedMessage: nonEmptyTextEmptyMessage('DataElementIdentifier'),
      },
      {
        name: 'whitespace-only key',
        input: new Map<string, unknown>([['   ', 'value']]),
        expectedMessage: nonEmptyTextEmptyMessage('DataElementIdentifier'),
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
