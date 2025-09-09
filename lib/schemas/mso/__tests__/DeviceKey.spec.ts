import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceKeySchema, DEVICE_KEY_MISSING_KTY_MESSAGE } from '../DeviceKey';
import { mapInvalidTypeMessage } from '@/schemas/common/Map';
import { requiredMessage } from '@/schemas/common/Required';

describe('DeviceKey', () => {
  describe('valid inputs', () => {
    it('should accept Map with numeric kty label (1)', () => {
      const key = new Map<number, unknown>([[1, 2]]);
      const result = deviceKeySchema.parse(key);
      expect(result).toEqual(key);
    });

    it('should accept Map with additional labels', () => {
      const key = new Map<number, unknown>([
        [1, 2], // kty
        [-2, Uint8Array.from([1, 2, 3])],
      ]);
      const result = deviceKeySchema.parse(key);
      expect(result).toEqual(key);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const invalidTypeMes = mapInvalidTypeMessage('DeviceKey');
    const requiredMes = requiredMessage('DeviceKey');
    const testCases: Array<{ name: string; input: unknown; expected: string }> =
      [
        { name: 'null', input: null, expected: requiredMes },
        { name: 'undefined', input: undefined, expected: requiredMes },
        { name: 'boolean', input: true, expected: invalidTypeMes },
        { name: 'number', input: 123, expected: invalidTypeMes },
        { name: 'string', input: 'string', expected: invalidTypeMes },
        { name: 'array', input: [1, 2, 3], expected: invalidTypeMes },
        {
          name: 'plain object',
          input: { key: 'value' },
          expected: invalidTypeMes,
        },
        { name: 'empty object', input: {}, expected: invalidTypeMes },
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

  describe('field validations', () => {
    it('should require kty (label 1) or "kty"', () => {
      try {
        deviceKeySchema.parse(new Map<number, unknown>([[-1, 1]]));
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(DEVICE_KEY_MISSING_KTY_MESSAGE);
      }
    });
  });
});
