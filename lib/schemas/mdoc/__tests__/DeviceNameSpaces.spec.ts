import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceNameSpacesSchema } from '../DeviceNameSpaces';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { containerInvalidValueMessage } from '@/schemas/messages/containerInvalidValueMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('DeviceNameSpaces', () => {
  describe('should accept valid device name spaces records', () => {
    const testCases = [
      {
        name: 'multiple namespaces',
        input: new Map<string, Map<string, unknown>>([
          [
            'com.example.namespace',
            new Map<string, unknown>([
              ['first_name', 'John'],
              ['last_name', 'Doe'],
            ]),
          ],
          [
            'test.namespace',
            new Map<string, unknown>([['license_number', '123456789']]),
          ],
        ]),
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = deviceNameSpacesSchema.parse(input);
        expect(result).toBeInstanceOf(Map);
        expect(result).toEqual(input);
      });
    });
  });

  // Empty Map is not allowed by schema (must provide at least one namespace)

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceNameSpaces',
          expected: 'Map',
          received: getTypeName(null),
        }),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceNameSpaces',
          expected: 'Map',
          received: getTypeName(undefined),
        }),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceNameSpaces',
          expected: 'Map',
          received: getTypeName(true),
        }),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceNameSpaces',
          expected: 'Map',
          received: getTypeName(123),
        }),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceNameSpaces',
          expected: 'Map',
          received: getTypeName('string'),
        }),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceNameSpaces',
          expected: 'Map',
          received: getTypeName([]),
        }),
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

  describe('should throw error for invalid map entries', () => {
    const testCases = [
      // Top-level empty Map is allowed by schema per current rules; no test here
      {
        name: 'empty namespace key',
        input: new Map<string, unknown>([['', new Map([['item', 'value']])]]),
        expectedMessage: containerInvalidValueMessage({
          target: 'DeviceNameSpaces',
          path: [0, 'key'],
          originalMessage: 'String must contain at least 1 character(s)',
        }),
      },
      {
        name: 'null value for items',
        input: new Map<string, unknown>([
          ['org.iso.18013.5.1', null as unknown as Map<string, unknown>],
        ]),
        expectedMessage: containerInvalidValueMessage({
          target: 'DeviceNameSpaces',
          path: [0, 'value'],
          originalMessage: 'Expected Map, received null',
        }),
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
