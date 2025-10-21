import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceSignedSchema } from '../DeviceSigned';
import {
  containerInvalidTypeMessage,
  containerInvalidValueMessage,
} from '@/schemas/messages';
import { getTypeName } from '@/utils/getTypeName';
import { createTag18, createTag24 } from '@/cbor';
import { createTag17 } from '@/cbor/createTag17';

describe('DeviceSigned', () => {
  describe('valid device signed data', () => {
    const sign1 = createTag18([
      new Uint8Array([]),
      new Map<number, string>([[1, 'value']]),
      new Uint8Array([]),
      new Uint8Array([]),
    ]);
    const mac0 = createTag17([
      new Uint8Array([]),
      new Map<number, string>([[1, 'value']]),
      new Uint8Array([]),
      new Uint8Array([]),
    ]);

    it('should accept device signed data with deviceSignature', () => {
      const data = new Map<string, unknown>([
        ['nameSpaces', createTag24(new Map())],
        ['deviceAuth', new Map([['deviceSignature', sign1]])],
      ]);

      const result = deviceSignedSchema.parse(data);
      expect(result).toEqual(data);
    });

    it('should accept device signed data with deviceMac', () => {
      const data = new Map<string, unknown>([
        ['nameSpaces', createTag24(new Map())],
        ['deviceAuth', new Map([['deviceMac', mac0]])],
      ]);

      const result = deviceSignedSchema.parse(data);
      expect(result).toEqual(data);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const testCases: Array<{
      name: string;
      input: unknown;
      expectedMessage: string;
    }> = [
      {
        name: 'null input',
        input: null,
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceSigned',
          expected: 'Map',
          received: getTypeName(null),
        }),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceSigned',
          expected: 'Map',
          received: getTypeName(undefined),
        }),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceSigned',
          expected: 'Map',
          received: getTypeName(true),
        }),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceSigned',
          expected: 'Map',
          received: getTypeName(123),
        }),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceSigned',
          expected: 'Map',
          received: getTypeName('string'),
        }),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceSigned',
          expected: 'Map',
          received: getTypeName([]),
        }),
      },
      {
        name: 'object input',
        input: {},
        expectedMessage: containerInvalidTypeMessage({
          target: 'DeviceSigned',
          expected: 'Map',
          received: getTypeName({}),
        }),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceSignedSchema.parse(input);
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
    const tag24 = createTag24(new Map());
    const sign1 = createTag18([
      new Uint8Array([]),
      new Map<number, string>([[1, 'value']]),
      new Uint8Array([]),
      new Uint8Array([]),
    ]);

    const testCases = [
      {
        name: 'null nameSpaces',
        input: new Map<string, unknown>([
          ['nameSpaces', null],
          ['deviceAuth', new Map([['deviceSignature', sign1]])],
        ]),
        expectedMessage: containerInvalidValueMessage({
          target: 'DeviceSigned',
          path: ['nameSpaces'],
          originalMessage: 'Input not instance of Tag',
        }),
      },
      {
        name: 'null deviceAuth',
        input: new Map<string, unknown>([
          ['nameSpaces', tag24],
          ['deviceAuth', null],
        ]),
        expectedMessage: containerInvalidValueMessage({
          target: 'DeviceSigned',
          path: ['deviceAuth'],
          originalMessage: 'Expected Map, received null',
        }),
      },
      {
        name: 'null deviceSignature in deviceAuth',
        input: new Map<string, unknown>([
          ['nameSpaces', tag24],
          ['deviceAuth', new Map([['deviceSignature', null]])],
        ]),
        expectedMessage: containerInvalidValueMessage({
          target: 'DeviceSigned',
          path: ['deviceAuth', 'deviceSignature'],
          originalMessage:
            'Expected [Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(18), received null',
        }),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceSignedSchema.parse(input);
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
