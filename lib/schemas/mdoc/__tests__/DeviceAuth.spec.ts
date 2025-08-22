import { Mac0, Sign1 } from '@auth0/cose';
import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  deviceAuthSchema,
  DEVICE_AUTH_AT_LEAST_ONE_MESSAGE,
} from '../DeviceAuth';
import { mapInvalidTypeMessage, mapRequiredMessage } from '../../common/Map';
import { sign1InvalidTypeMessage } from '../../cose/Sign1';
import { mac0InvalidTypeMessage } from '../../cose/Mac0';

describe('DeviceAuth', () => {
  describe('should accept valid device authentication', () => {
    const testCases = [
      {
        name: 'device signature only',
        input: ((): Map<string, unknown> => {
          const sign1 = new Sign1(
            Buffer.from([]),
            new Map<number, string>([[1, 'value']]),
            Buffer.from([]),
            Buffer.from([])
          );
          return new Map([['deviceSignature', sign1.getContentForEncoding()]]);
        })(),
        expectedSignature: true,
        expectedMac: false,
      },
      {
        name: 'device MAC only',
        input: ((): Map<string, unknown> => {
          const mac0 = new Mac0(
            Buffer.from([]),
            new Map<number, string>([[1, 'value']]),
            Buffer.from([]),
            Buffer.from([])
          );
          return new Map([['deviceMac', mac0.getContentForEncoding()]]);
        })(),
        expectedSignature: false,
        expectedMac: true,
      },
      {
        name: 'both device signature and MAC',
        input: ((): Map<string, unknown> => {
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
          return new Map([
            ['deviceSignature', sign1.getContentForEncoding()],
            ['deviceMac', mac0.getContentForEncoding()],
          ]);
        })(),
        expectedSignature: true,
        expectedMac: true,
      },
    ];

    testCases.forEach(({ name, input, expectedSignature, expectedMac }) => {
      it(`should accept ${name}`, () => {
        const result = deviceAuthSchema.parse(input);
        const signature = result.deviceSignature;
        const mac = result.deviceMac;

        if (expectedSignature) {
          expect(signature).toBeInstanceOf(Sign1);
        } else {
          expect(signature).toBeUndefined();
        }

        if (expectedMac) {
          expect(mac).toBeInstanceOf(Mac0);
        } else {
          expect(mac).toBeUndefined();
        }
      });
    });
  });

  describe('should throw error for invalid input', () => {
    const mapInvalid = mapInvalidTypeMessage('DeviceAuth');
    const mapRequired = mapRequiredMessage('DeviceAuth');
    const dsInvalid = sign1InvalidTypeMessage('DeviceSignature');
    const macInvalid = mac0InvalidTypeMessage('DeviceMac');
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: mapInvalid,
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: mapRequired,
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: mapInvalid,
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: mapInvalid,
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: mapInvalid,
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: mapInvalid,
      },
      {
        name: 'object input',
        input: {},
        expectedMessage: mapInvalid,
      },
      {
        name: 'Map with null deviceSignature',
        input: new Map([['deviceSignature', null]]),
        expectedMessage: dsInvalid,
      },
      {
        name: 'Map with null deviceMac',
        input: new Map([['deviceMac', null]]),
        expectedMessage: macInvalid,
      },
      {
        name: 'Map with Tag deviceSignature',
        input: new Map([['deviceSignature', new Tag(0, 17)]]),
        expectedMessage: dsInvalid,
      },
      {
        name: 'Map with Tag deviceMac',
        input: new Map([['deviceMac', new Tag(0, 18)]]),
        expectedMessage: macInvalid,
      },
      {
        name: 'empty Map',
        input: new Map(),
        expectedMessage: DEVICE_AUTH_AT_LEAST_ONE_MESSAGE,
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceAuthSchema.parse(input);
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
