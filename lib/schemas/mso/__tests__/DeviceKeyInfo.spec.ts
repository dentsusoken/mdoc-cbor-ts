import { COSEKey } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceKeyInfoSchema } from '../DeviceKeyInfo';
import {
  mapInvalidTypeMessage,
  mapRequiredMessage,
} from '@/schemas/common/Map';

describe('DeviceKeyInfo', () => {
  describe('valid inputs', () => {
    it('should accept required fields only', () => {
      const input = new Map<string, unknown>([
        ['deviceKey', new Map<number, unknown>([[1, 2]])],
      ]);
      const result = deviceKeyInfoSchema.parse(input);
      expect(result.deviceKey).toBeInstanceOf(COSEKey);
    });

    it('should accept all fields', () => {
      const input = new Map<string, unknown>([
        ['deviceKey', new Map<number, unknown>([[1, 2]])],
        ['keyAuthorizations', new Map()],
        ['keyInfo', new Map()],
      ]);
      const result = deviceKeyInfoSchema.parse(input);
      expect(result.deviceKey).toBeInstanceOf(COSEKey);
      expect(result.keyAuthorizations).toEqual({});
      expect(result.keyInfo).toBeInstanceOf(Map);
      expect((result.keyInfo as Map<unknown, unknown>).size).toBe(0);
    });
  });

  describe('invalid container types', () => {
    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'string',
        input: 'not-a-map',
        expected: mapInvalidTypeMessage('DeviceKeyInfo'),
      },
      {
        name: 'number',
        input: 123,
        expected: mapInvalidTypeMessage('DeviceKeyInfo'),
      },
      {
        name: 'boolean',
        input: true,
        expected: mapInvalidTypeMessage('DeviceKeyInfo'),
      },
      {
        name: 'null',
        input: null,
        expected: mapInvalidTypeMessage('DeviceKeyInfo'),
      },
      {
        name: 'plain object',
        input: { deviceKey: new Map([[1, 2]]) },
        expected: mapInvalidTypeMessage('DeviceKeyInfo'),
      },
      {
        name: 'array',
        input: [['deviceKey', new Map([[1, 2]])]],
        expected: mapInvalidTypeMessage('DeviceKeyInfo'),
      },
      {
        name: 'set',
        input: new Set([1]),
        expected: mapInvalidTypeMessage('DeviceKeyInfo'),
      },
      {
        name: 'undefined',
        input: undefined,
        expected: mapRequiredMessage('DeviceKeyInfo'),
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          deviceKeyInfoSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('invalid field values', () => {
    it('should reject invalid deviceKey type', () => {
      try {
        const input = new Map<string, unknown>([
          // invalid: object instead of Map for deviceKey
          ['deviceKey', {}],
        ]);
        deviceKeyInfoSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          mapInvalidTypeMessage('DeviceKey')
        );
      }
    });
  });
});
