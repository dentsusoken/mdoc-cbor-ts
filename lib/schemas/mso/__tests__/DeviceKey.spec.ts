import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceKeySchema, DEVICE_KEY_MISSING_KTY_MESSAGE } from '../DeviceKey';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';
import { Key, KeyType } from '@/cose/types';

describe('DeviceKey', () => {
  describe('valid inputs', () => {
    it('should accept Map with kty label', () => {
      const key = new Map<number, unknown>([[Key.KeyType, KeyType.EC]]);
      const result = deviceKeySchema.parse(key);
      expect(result).toEqual(key);
    });

    it('should accept Map with additional labels', () => {
      const key = new Map<number, unknown>([
        [Key.KeyType, KeyType.EC],
        [Key.x, Uint8Array.from([1, 2, 3])],
      ]);
      const result = deviceKeySchema.parse(key);
      expect(result).toEqual(key);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const expectedMessage = (v: unknown): string =>
      containerInvalidTypeMessage({
        target: 'DeviceKey',
        expected: 'Map',
        received: getTypeName(v),
      });

    const testCases: Array<{ name: string; input: unknown; expected: string }> =
      [
        { name: 'null', input: null, expected: expectedMessage(null) },
        {
          name: 'undefined',
          input: undefined,
          expected: expectedMessage(undefined),
        },
        { name: 'boolean', input: true, expected: expectedMessage(true) },
        { name: 'number', input: 123, expected: expectedMessage(123) },
        {
          name: 'string',
          input: 'string',
          expected: expectedMessage('string'),
        },
        {
          name: 'array',
          input: [1, 2, 3],
          expected: expectedMessage([1, 2, 3]),
        },
        {
          name: 'plain object',
          input: { key: 'value' },
          expected: expectedMessage({ key: 'value' }),
        },
        { name: 'empty object', input: {}, expected: expectedMessage({}) },
      ];

    testCases.forEach(({ name, input, expected }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceKeySchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('schema validations', () => {
    it('should require kty (label 1)', () => {
      try {
        deviceKeySchema.parse(new Map<number, unknown>([[Key.Curve, 1]]));
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(DEVICE_KEY_MISSING_KTY_MESSAGE);
      }
    });

    it('should reject non-numeric key label type (string key)', () => {
      try {
        deviceKeySchema.parse(new Map<string | number, unknown>([['xxx', 1]]));
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
      }
    });
  });
});
