import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { DateOnly } from '@/cbor/DateOnly';
import { decodeCbor } from '@/cbor/codec';
import {
  createDateOnlySchema,
  dateOnlyInvalidTypeMessage,
  dateOnlyInvalidDateMessage,
} from '../DateOnly';

describe('DateOnly Schema', () => {
  const testSchema = createDateOnlySchema('TestTarget');

  describe('valid cases', () => {
    it('should validate a valid DateOnly instance', () => {
      const dateOnly = new DateOnly('2024-03-20');
      const result = testSchema.parse(dateOnly);
      expect(result).toBeInstanceOf(DateOnly);
      expect(result.toISOString()).toBe('2024-03-20');
    });
  });

  describe('invalid cases', () => {
    it('should throw error for undefined', () => {
      try {
        testSchema.parse(undefined);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            dateOnlyInvalidTypeMessage('TestTarget')
          );
        }
      }
    });

    it('should throw error for non-DateOnly instance', () => {
      try {
        testSchema.parse('2024-03-20');
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            dateOnlyInvalidTypeMessage('TestTarget')
          );
        }
      }
    });

    it('should throw error for Invalid Date DateOnly instance from CBOR', () => {
      // Create an Invalid Date by decoding CBOR with invalid date string
      // DateOnly uses tag 1004, followed by string "invalid-date"
      const invalidCborData = new Uint8Array([
        0xd9,
        0x03,
        0xec, // tag(1004)
        0x6c,
        0x69,
        0x6e,
        0x76,
        0x61,
        0x6c,
        0x69,
        0x64,
        0x2d,
        0x64,
        0x61,
        0x74,
        0x65, // "invalid-date"
      ]);

      const invalidDateOnly = decodeCbor(invalidCborData) as DateOnly;
      expect(invalidDateOnly).toBeInstanceOf(DateOnly);
      expect(() => invalidDateOnly.toISOString()).toThrow(
        new RangeError('Invalid time value')
      );

      try {
        testSchema.parse(invalidDateOnly);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            dateOnlyInvalidDateMessage('TestTarget')
          );
        }
      }
    });
  });
});
