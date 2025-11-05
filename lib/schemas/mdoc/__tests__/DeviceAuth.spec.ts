import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  createDeviceAuth,
  deviceAuthSchema,
  DEVICE_AUTH_AT_LEAST_ONE_MESSAGE,
} from '../DeviceAuth';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { containerInvalidValueMessage } from '@/schemas/messages/containerInvalidValueMessage';
import { getTypeName } from '@/utils/getTypeName';
import { createTag18 } from '@/cbor/createTag18';

describe('DeviceAuth', () => {
  describe('should accept valid device authentication', () => {
    const testCases = [
      {
        name: 'device signature only',
        input: ((): Map<string, unknown> => {
          const tuple: [
            Uint8Array,
            Map<number, string>,
            Uint8Array,
            Uint8Array,
          ] = [
            new Uint8Array([]),
            new Map<number, string>([[1, 'value']]),
            new Uint8Array([]),
            new Uint8Array([]),
          ];
          return new Map([['deviceSignature', createTag18(tuple)]]);
        })(),
        expectedSignature: true,
        expectedMac: false,
      },
      {
        name: 'device MAC only',
        input: ((): Map<string, unknown> => {
          const tuple = [
            new Uint8Array([]),
            new Map<number, string>([[1, 'value']]),
            new Uint8Array([]),
            new Uint8Array([]),
          ] as const;
          return new Map([['deviceMac', new Tag(tuple, 17)]]);
        })(),
        expectedSignature: false,
        expectedMac: true,
      },
      {
        name: 'both device signature and MAC',
        input: ((): Map<string, unknown> => {
          const sign1Tuple: [
            Uint8Array,
            Map<number, string>,
            Uint8Array,
            Uint8Array,
          ] = [
            new Uint8Array([]),
            new Map<number, string>([[1, 'value']]),
            new Uint8Array([]),
            new Uint8Array([]),
          ];
          const mac0Tuple: [
            Uint8Array,
            Map<number, string>,
            Uint8Array,
            Uint8Array,
          ] = [
            new Uint8Array([]),
            new Map<number, string>([[1, 'value']]),
            new Uint8Array([]),
            new Uint8Array([]),
          ];
          return new Map([
            ['deviceSignature', createTag18(sign1Tuple)],
            ['deviceMac', new Tag(mac0Tuple, 17)],
          ]);
        })(),
        expectedSignature: true,
        expectedMac: true,
      },
    ];

    testCases.forEach(({ name, input, expectedSignature, expectedMac }) => {
      it(`should accept ${name}`, () => {
        const result = deviceAuthSchema.parse(input);
        const signature = result.get('deviceSignature');
        const mac = result.get('deviceMac');

        if (expectedSignature) {
          expect(signature).toBeInstanceOf(Tag);
          expect((signature as Tag).tag).toBe(18);
        } else {
          expect(signature).toBeUndefined();
        }

        if (expectedMac) {
          expect(mac).toBeInstanceOf(Tag);
          expect((mac as Tag).tag).toBe(17);
        } else {
          expect(mac).toBeUndefined();
        }
      });
    });
  });

  describe('should throw error for invalid input', () => {
    const TARGET = 'DeviceAuth';

    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName(null),
        }),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName(undefined),
        }),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName(true),
        }),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName(123),
        }),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName('string'),
        }),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName([]),
        }),
      },
      {
        name: 'object input',
        input: {},
        expectedMessage: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName({}),
        }),
      },
      {
        name: 'Map with null deviceSignature',
        input: new Map([['deviceSignature', null]]),
        expectedMessage: containerInvalidValueMessage({
          target: TARGET,
          path: ['deviceSignature'],
          originalMessage: containerInvalidTypeMessage({
            target: 'DeviceSignature',
            expected:
              '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(18)',
            received: getTypeName(null),
          }),
        }),
      },
      {
        name: 'Map with null deviceMac',
        input: new Map([['deviceMac', null]]),
        expectedMessage: containerInvalidValueMessage({
          target: TARGET,
          path: ['deviceMac'],
          originalMessage: containerInvalidTypeMessage({
            target: 'DeviceMac',
            expected:
              '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(17)',
            received: getTypeName(null),
          }),
        }),
      },
      {
        name: 'Map with Tag deviceSignature',
        input: new Map([['deviceSignature', new Tag(0, 17)]]),
        expectedMessage: containerInvalidValueMessage({
          target: TARGET,
          path: ['deviceSignature'],
          originalMessage: containerInvalidTypeMessage({
            target: 'DeviceSignature',
            expected: 'Tag(18)',
            received: 'Tag(17)',
          }),
        }),
      },
      {
        name: 'Map with Tag deviceMac',
        input: new Map([['deviceMac', new Tag(0, 18)]]),
        expectedMessage: containerInvalidValueMessage({
          target: TARGET,
          path: ['deviceMac'],
          originalMessage: containerInvalidTypeMessage({
            target: 'DeviceMac',
            expected: 'Tag(17)',
            received: 'Tag(18)',
          }),
        }),
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

  describe('createDeviceAuth', () => {
    it('creates DeviceAuth with deviceSignature only', () => {
      const sign1Tuple: [
        Uint8Array,
        Map<number, string>,
        Uint8Array,
        Uint8Array,
      ] = [
        new Uint8Array([]),
        new Map<number, string>([[1, 'value']]),
        new Uint8Array([]),
        new Uint8Array([]),
      ];
      const deviceSignature = createTag18(sign1Tuple);

      const deviceAuth = createDeviceAuth([
        ['deviceSignature', deviceSignature],
      ]);

      expect(deviceAuth).toBeInstanceOf(Map);
      expect(deviceAuth.get('deviceSignature')).toBe(deviceSignature);
      expect(deviceAuth.get('deviceMac')).toBeUndefined();
      deviceAuthSchema.parse(deviceAuth);
    });

    it('creates DeviceAuth with deviceMac only', () => {
      const mac0Tuple: [
        Uint8Array,
        Map<number, string>,
        Uint8Array,
        Uint8Array,
      ] = [
        new Uint8Array([]),
        new Map<number, string>([[1, 'value']]),
        new Uint8Array([]),
        new Uint8Array([]),
      ];
      const deviceMac = new Tag(mac0Tuple, 17);

      const deviceAuth = createDeviceAuth([['deviceMac', deviceMac]]);

      expect(deviceAuth).toBeInstanceOf(Map);
      expect(deviceAuth.get('deviceMac')).toBe(deviceMac);
      expect(deviceAuth.get('deviceSignature')).toBeUndefined();
      deviceAuthSchema.parse(deviceAuth);
    });

    it('creates DeviceAuth with both deviceSignature and deviceMac', () => {
      const sign1Tuple: [
        Uint8Array,
        Map<number, string>,
        Uint8Array,
        Uint8Array,
      ] = [
        new Uint8Array([]),
        new Map<number, string>([[1, 'value']]),
        new Uint8Array([]),
        new Uint8Array([]),
      ];
      const mac0Tuple: [
        Uint8Array,
        Map<number, string>,
        Uint8Array,
        Uint8Array,
      ] = [
        new Uint8Array([]),
        new Map<number, string>([[1, 'value']]),
        new Uint8Array([]),
        new Uint8Array([]),
      ];
      const deviceSignature = createTag18(sign1Tuple);
      const deviceMac = new Tag(mac0Tuple, 17);

      const deviceAuth = createDeviceAuth([
        ['deviceSignature', deviceSignature],
        ['deviceMac', deviceMac],
      ]);

      expect(deviceAuth).toBeInstanceOf(Map);
      expect(deviceAuth.get('deviceSignature')).toBe(deviceSignature);
      expect(deviceAuth.get('deviceMac')).toBe(deviceMac);
      deviceAuthSchema.parse(deviceAuth);
    });
  });
});
