import { Mac0, Sign1 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceSignedSchema } from '../DeviceSigned';
import {
  mapInvalidTypeMessage,
  mapRequiredMessage,
} from '@/schemas/common/Map';
import { tag24InvalidTypeMessage } from '@/schemas/common/Tag24';
import { createTag24 } from '@/cbor';

describe('DeviceSigned', () => {
  describe('valid device signed data', () => {
    const sign1 = new Sign1(
      new Uint8Array([]),
      new Map<number, string>([[1, 'value']]),
      new Uint8Array([]),
      new Uint8Array([])
    );
    const mac0 = new Mac0(
      new Uint8Array([]),
      new Map<number, string>([[1, 'value']]),
      new Uint8Array([]),
      new Uint8Array([])
    );

    it('should accept device signed data with deviceSignature', () => {
      const data = new Map<string, unknown>([
        ['nameSpaces', createTag24(new Map())],
        [
          'deviceAuth',
          new Map([['deviceSignature', sign1.getContentForEncoding()]]),
        ],
      ]);

      const result = deviceSignedSchema.parse(data);
      expect(result.nameSpaces).toEqual(data.get('nameSpaces'));
      expect(result.deviceAuth.deviceSignature).toBeInstanceOf(Sign1);
      expect(result.deviceAuth.deviceSignature).toEqual(sign1);
    });

    it('should accept device signed data with deviceMac', () => {
      const data = new Map<string, unknown>([
        ['nameSpaces', createTag24(new Map())],
        ['deviceAuth', new Map([['deviceMac', mac0.getContentForEncoding()]])],
      ]);

      const result = deviceSignedSchema.parse(data);
      expect(result.nameSpaces).toEqual(data.get('nameSpaces'));
      expect(result.deviceAuth.deviceMac).toBeInstanceOf(Mac0);
      expect(result.deviceAuth.deviceMac).toEqual(mac0);
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
        expectedMessage: mapInvalidTypeMessage('DeviceSigned'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: mapRequiredMessage('DeviceSigned'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: mapInvalidTypeMessage('DeviceSigned'),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: mapInvalidTypeMessage('DeviceSigned'),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: mapInvalidTypeMessage('DeviceSigned'),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: mapInvalidTypeMessage('DeviceSigned'),
      },
      {
        name: 'object input',
        input: {},
        expectedMessage: mapInvalidTypeMessage('DeviceSigned'),
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
    const sign1 = new Sign1(
      Uint8Array.from([]),
      new Map<number, string>([[1, 'value']]),
      Uint8Array.from([]),
      Uint8Array.from([])
    );
    const tag24 = createTag24(new Map());

    const testCases = [
      {
        name: 'null nameSpaces',
        input: new Map<string, unknown>([
          ['nameSpaces', null],
          [
            'deviceAuth',
            new Map([['deviceSignature', sign1.getContentForEncoding()]]),
          ],
        ]),
        expectedMessage: tag24InvalidTypeMessage('DeviceNameSpacesBytes'),
      },
      {
        name: 'null deviceAuth',
        input: new Map<string, unknown>([
          ['nameSpaces', tag24],
          ['deviceAuth', null],
        ]),
        expectedMessage: mapInvalidTypeMessage('DeviceAuth'),
      },
      {
        name: 'null deviceSignature in deviceAuth',
        input: new Map<string, unknown>([
          ['nameSpaces', tag24],
          ['deviceAuth', new Map([['deviceSignature', null]])],
        ]),
        expectedMessage:
          'DeviceSignature: Expected an array with 4 elements (protected headers, unprotected headers, payload, signature). Please provide a valid COSE_Sign1 structure.',
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
