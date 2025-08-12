import { COSEKey } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  deviceKeySchema,
  DEVICE_KEY_INVALID_TYPE_MESSAGE,
  DEVICE_KEY_REQUIRED_MESSAGE,
  DEVICE_KEY_MISSING_KTY_MESSAGE,
} from '../DeviceKey';

describe('DeviceKey', () => {
  describe('valid inputs', () => {
    it('should accept Map with numeric kty label (1)', () => {
      const key = new Map<number, unknown>([[1, 2]]);
      const result = deviceKeySchema.parse(key);
      expect(result).toBeInstanceOf(COSEKey);
    });

    it('should accept Map with additional labels', () => {
      const key = new Map<number, unknown>([
        [1, 2], // kty
        [-2, Buffer.from([1, 2, 3])],
      ]);
      const result = deviceKeySchema.parse(key);
      expect(result).toBeInstanceOf(COSEKey);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const schemaMessage = DEVICE_KEY_INVALID_TYPE_MESSAGE;
    const testCases: Array<{ name: string; input: unknown; expected: string }> =
      [
        { name: 'null', input: null, expected: schemaMessage },
        { name: 'boolean', input: true, expected: schemaMessage },
        { name: 'number', input: 123, expected: schemaMessage },
        { name: 'string', input: 'string', expected: schemaMessage },
        { name: 'array', input: [1, 2, 3], expected: schemaMessage },
        {
          name: 'plain object',
          input: { key: 'value' },
          expected: schemaMessage,
        },
        { name: 'empty object', input: {}, expected: schemaMessage },
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

    it('should throw error for undefined (required)', () => {
      try {
        deviceKeySchema.parse(undefined);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(DEVICE_KEY_REQUIRED_MESSAGE);
      }
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
