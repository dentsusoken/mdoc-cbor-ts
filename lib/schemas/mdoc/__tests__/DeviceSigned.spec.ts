import { Mac0, Sign1 } from '@auth0/cose';
import { TypedMap } from '@jfromaniello/typedmap';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ByteString } from '@/cbor';
import { deviceSignedSchema } from '../DeviceSigned';

describe('DeviceSigned', () => {
  describe('valid device signed data', () => {
    const sign1 = new Sign1(
      Buffer.from([]),
      new Map<number, string>([[1, 'value']]),
      Buffer.from([]),
      Buffer.from([])
    );
    const mac0 = new Mac0(
      Buffer.from([]),
      new Map<number, string>([[1, 'value']]),
      Buffer.from([]),
      Buffer.from([])
    );

    it('should accept device signed data with deviceSignature', () => {
      const data = new Map<string, unknown>([
        ['nameSpaces', new ByteString(new TypedMap([]))],
        [
          'deviceAuth',
          new Map([['deviceSignature', sign1.getContentForEncoding()]]),
        ],
      ]);

      const result = deviceSignedSchema.parse(data);
      expect(result.nameSpaces).toEqual(data.get('nameSpaces'));
      expect(result.deviceAuth.deviceSignature).toBeInstanceOf(Sign1);
      expect(result.deviceAuth.deviceSignature?.protectedHeaders).toEqual(
        sign1.protectedHeaders
      );
    });

    it('should accept device signed data with deviceMac', () => {
      const data = new Map<string, unknown>([
        ['nameSpaces', new ByteString(new TypedMap([]))],
        ['deviceAuth', new Map([['deviceMac', mac0.getContentForEncoding()]])],
      ]);

      const result = deviceSignedSchema.parse(data);
      expect(result.nameSpaces).toEqual(data.get('nameSpaces'));
      expect(result.deviceAuth.deviceMac).toBeInstanceOf(Mac0);
      expect(result.deviceAuth.deviceMac?.protectedHeaders).toEqual(
        mac0.protectedHeaders
      );
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
        expectedMessage:
          'DeviceSigned: Expected a Map with keys "nameSpaces" and "deviceAuth". Please provide a valid device-signed mapping.',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'DeviceSigned: This field is required. Please provide a device-signed mapping.',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'DeviceSigned: Expected a Map with keys "nameSpaces" and "deviceAuth". Please provide a valid device-signed mapping.',
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage:
          'DeviceSigned: Expected a Map with keys "nameSpaces" and "deviceAuth". Please provide a valid device-signed mapping.',
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage:
          'DeviceSigned: Expected a Map with keys "nameSpaces" and "deviceAuth". Please provide a valid device-signed mapping.',
      },
      {
        name: 'array input',
        input: [],
        expectedMessage:
          'DeviceSigned: Expected a Map with keys "nameSpaces" and "deviceAuth". Please provide a valid device-signed mapping.',
      },
      {
        name: 'object input',
        input: {},
        expectedMessage:
          'DeviceSigned: Expected a Map with keys "nameSpaces" and "deviceAuth". Please provide a valid device-signed mapping.',
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
      Buffer.from([]),
      new Map<number, string>([[1, 'value']]),
      Buffer.from([]),
      Buffer.from([])
    );
    const byteString = new ByteString(new TypedMap([]));

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
        expectedMessage:
          'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
      },
      {
        name: 'null deviceAuth',
        input: new Map<string, unknown>([
          ['nameSpaces', byteString],
          ['deviceAuth', null],
        ]),
        expectedMessage:
          'DeviceAuth: Expected a Map with authentication method keys and values. Please provide a valid authentication mapping.',
      },
      {
        name: 'null deviceSignature in deviceAuth',
        input: new Map<string, unknown>([
          ['nameSpaces', byteString],
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
