import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { DateTime } from '@/cbor/DateTime';
import { decodeCbor } from '@/cbor/codec';
import {
  createDateTimeSchema,
  DATETIME_INVALID_TYPE_MESSAGE_SUFFIX,
  DATETIME_INVALID_DATE_MESSAGE_SUFFIX,
} from '../DateTime';

describe('DateTime Schema', () => {
  const testSchema = createDateTimeSchema('TestTarget');

  describe('valid cases', () => {
    it('should validate a valid DateTime instance', () => {
      const dateTime = new DateTime('2024-03-20T15:30:00Z');
      const result = testSchema.parse(dateTime);
      expect(result).toBeInstanceOf(DateTime);
      expect(result.toISOString()).toBe('2024-03-20T15:30:00Z');
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
            `TestTarget: ${DATETIME_INVALID_TYPE_MESSAGE_SUFFIX}`
          );
        }
      }
    });

    it('should throw error for non-DateTime instance', () => {
      try {
        testSchema.parse('2024-03-20T15:30:00Z');
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            `TestTarget: ${DATETIME_INVALID_TYPE_MESSAGE_SUFFIX}`
          );
        }
      }
    });

    it('should throw error for Invalid Date DateTime instance from CBOR', () => {
      // Create an Invalid Date by decoding CBOR with invalid date string
      // Tag 0 = 0xc0, followed by string "invalid-date"
      const invalidCborData = new Uint8Array([
        0xc0, 0x6c, 0x69, 0x6e, 0x76, 0x61, 0x6c, 0x69, 0x64, 0x2d, 0x64, 0x61,
        0x74, 0x65,
      ]);

      const invalidDateTime = decodeCbor(invalidCborData) as DateTime;
      expect(invalidDateTime).toBeInstanceOf(DateTime);
      expect(() => invalidDateTime.toISOString()).toThrow(
        new RangeError('Invalid time value')
      );

      try {
        testSchema.parse(invalidDateTime);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            `TestTarget: ${DATETIME_INVALID_DATE_MESSAGE_SUFFIX}`
          );
        }
      }
    });
  });
});
