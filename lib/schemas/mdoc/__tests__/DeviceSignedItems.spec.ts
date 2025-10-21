import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceSignedItemsSchema } from '../DeviceSignedItems';
import {
  containerEmptyMessage,
  containerInvalidTypeMessage,
  containerInvalidValueMessage,
} from '@/schemas/messages';
import { getTypeName } from '@/utils/getTypeName';

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
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = deviceSignedItemsSchema.parse(input);
        expect(result).toBeInstanceOf(Map);
        expect(result).toEqual(input);
      });
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceSignedItems',
          expected: 'Map',
          received: getTypeName(null),
        }),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceSignedItems',
          expected: 'Map',
          received: getTypeName(undefined),
        }),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceSignedItems',
          expected: 'Map',
          received: getTypeName(true),
        }),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceSignedItems',
          expected: 'Map',
          received: getTypeName(123),
        }),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceSignedItems',
          expected: 'Map',
          received: getTypeName('string'),
        }),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceSignedItems',
          expected: 'Map',
          received: getTypeName([]),
        }),
      },
      {
        name: 'plain object (not Map)',
        input: {},
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceSignedItems',
          expected: 'Map',
          received: getTypeName({}),
        }),
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
        expectedMessage: containerEmptyMessage('DeviceSignedItems'),
      },
      {
        name: 'empty string key',
        input: new Map<string, unknown>([['', 'value']]),
        expectedMessage: containerInvalidValueMessage({
          target: 'DeviceSignedItems',
          path: [0, 'key'],
          originalMessage: 'String must contain at least 1 character(s)',
        }),
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
