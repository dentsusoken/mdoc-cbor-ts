import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { DateTime } from '@/cbor/DateTime';
import { decodeCbor } from '@/cbor/codec';
import { validityInfoSchema } from '../ValidityInfo';
import { dateTimeInvalidDateMessage } from '@/schemas/common/DateTime';

// Helper: build a DateTime instance that is invalid (created via CBOR tag 0 with an invalid string)
const buildInvalidDateTimeFromCbor = (): DateTime => {
  // 0xc0 = tag(0), followed by text(12) "invalid-date"
  const data = new Uint8Array([
    0xc0, 0x6c, 0x69, 0x6e, 0x76, 0x61, 0x6c, 0x69, 0x64, 0x2d, 0x64, 0x61,
    0x74, 0x65,
  ]);
  return decodeCbor(data) as DateTime;
};

const invalidDateTime = buildInvalidDateTimeFromCbor();

describe('ValidityInfo Schema', () => {
  describe('valid cases', () => {
    it('should validate a complete ValidityInfo object', () => {
      const expected = {
        signed: new DateTime('2024-03-20T10:00:00Z'),
        validFrom: new DateTime('2024-03-20T10:00:00Z'),
        validUntil: new DateTime('2025-03-20T10:00:00Z'),
        expectedUpdate: new DateTime('2024-09-20T10:00:00Z'),
      };
      const mapInput = new Map<string, unknown>([
        ['signed', expected.signed],
        ['validFrom', expected.validFrom],
        ['validUntil', expected.validUntil],
        ['expectedUpdate', expected.expectedUpdate],
      ]);
      const result = validityInfoSchema.parse(mapInput);
      expect(result).toEqual(expected);
    });

    it('should validate without optional expectedUpdate', () => {
      const expected = {
        signed: new DateTime('2024-03-20T10:00:00Z'),
        validFrom: new DateTime('2024-03-20T10:00:00Z'),
        validUntil: new DateTime('2025-03-20T10:00:00Z'),
      };
      const mapInput = new Map<string, unknown>([
        ['signed', expected.signed],
        ['validFrom', expected.validFrom],
        ['validUntil', expected.validUntil],
      ]);
      const result = validityInfoSchema.parse(mapInput);
      expect(result).toEqual(expected);
    });
  });

  describe('invalid cases', () => {
    it('should throw error when signed is not a DateTime instance', () => {
      const mapInput = new Map<string, unknown>([
        ['signed', invalidDateTime],
        ['validFrom', new DateTime('2024-03-20T10:00:00Z')],
        ['validUntil', new DateTime('2025-03-20T10:00:00Z')],
      ]);
      try {
        validityInfoSchema.parse(mapInput);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            dateTimeInvalidDateMessage('Signed')
          );
        }
      }
    });

    it('should throw error when validFrom is an invalid DateTime instance', () => {
      const mapInput = new Map<string, unknown>([
        ['signed', new DateTime('2024-03-20T10:00:00Z')],
        ['validFrom', invalidDateTime],
        ['validUntil', new DateTime('2025-03-20T10:00:00Z')],
      ]);

      try {
        validityInfoSchema.parse(mapInput);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            dateTimeInvalidDateMessage('ValidFrom')
          );
        }
      }
    });

    it('should throw error when validUntil is not a DateTime instance', () => {
      const mapInput = new Map<string, unknown>([
        ['signed', new DateTime('2024-03-20T10:00:00Z')],
        ['validFrom', new DateTime('2024-03-20T10:00:00Z')],
        ['validUntil', invalidDateTime],
      ]);
      try {
        validityInfoSchema.parse(mapInput);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            dateTimeInvalidDateMessage('ValidUntil')
          );
        }
      }
    });

    it('should throw error when optional expectedUpdate is provided with wrong type', () => {
      const mapInput = new Map<string, unknown>([
        ['signed', new DateTime('2024-03-20T10:00:00Z')],
        ['validFrom', new DateTime('2024-03-20T10:00:00Z')],
        ['validUntil', new DateTime('2025-03-20T10:00:00Z')],
        ['expectedUpdate', invalidDateTime],
      ]);
      try {
        validityInfoSchema.parse(mapInput);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            dateTimeInvalidDateMessage('ExpectedUpdate')
          );
        }
      }
    });
  });
});
