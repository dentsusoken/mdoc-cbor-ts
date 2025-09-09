import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { toISODateTimeString } from '@/utils/toISODateTimeString';
import { validityInfoSchema } from '../ValidityInfo';
import { dateTimeInvalidFormatMessage } from '@/schemas/common/DateTime';

const INVALID_ISO = 'not-a-datetime';

describe('ValidityInfo Schema', () => {
  describe('valid cases', () => {
    it('should validate a complete ValidityInfo object (ISO strings)', () => {
      const input = new Map<string, unknown>([
        ['signed', '2024-03-20T10:00:00Z'],
        ['validFrom', '2024-03-20T10:00:00Z'],
        ['validUntil', '2025-03-20T10:00:00Z'],
        ['expectedUpdate', '2024-09-20T10:00:00Z'],
      ]);
      const result = validityInfoSchema.parse(input);
      expect(result).toEqual({
        signed: toISODateTimeString(new Date('2024-03-20T10:00:00Z')),
        validFrom: toISODateTimeString(new Date('2024-03-20T10:00:00Z')),
        validUntil: toISODateTimeString(new Date('2025-03-20T10:00:00Z')),
        expectedUpdate: toISODateTimeString(new Date('2024-09-20T10:00:00Z')),
      });
    });

    it('should validate without optional expectedUpdate (ISO strings)', () => {
      const input = new Map<string, unknown>([
        ['signed', '2024-03-20T10:00:00Z'],
        ['validFrom', '2024-03-20T10:00:00Z'],
        ['validUntil', '2025-03-20T10:00:00Z'],
      ]);
      const result = validityInfoSchema.parse(input);
      expect(result).toEqual({
        signed: toISODateTimeString(new Date('2024-03-20T10:00:00Z')),
        validFrom: toISODateTimeString(new Date('2024-03-20T10:00:00Z')),
        validUntil: toISODateTimeString(new Date('2025-03-20T10:00:00Z')),
      });
    });
  });

  describe('invalid cases', () => {
    it('should throw error when signed has invalid ISO string', () => {
      const input = new Map<string, unknown>([
        ['signed', INVALID_ISO],
        ['validFrom', '2024-03-20T10:00:00Z'],
        ['validUntil', '2025-03-20T10:00:00Z'],
      ]);
      try {
        validityInfoSchema.parse(input);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            dateTimeInvalidFormatMessage('Signed')
          );
        }
      }
    });

    it('should throw error when validFrom has invalid ISO string', () => {
      const input = new Map<string, unknown>([
        ['signed', '2024-03-20T10:00:00Z'],
        ['validFrom', INVALID_ISO],
        ['validUntil', '2025-03-20T10:00:00Z'],
      ]);
      try {
        validityInfoSchema.parse(input);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            dateTimeInvalidFormatMessage('ValidFrom')
          );
        }
      }
    });

    it('should throw error when validUntil has invalid ISO string', () => {
      const input = new Map<string, unknown>([
        ['signed', '2024-03-20T10:00:00Z'],
        ['validFrom', '2024-03-20T10:00:00Z'],
        ['validUntil', INVALID_ISO],
      ]);
      try {
        validityInfoSchema.parse(input);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            dateTimeInvalidFormatMessage('ValidUntil')
          );
        }
      }
    });

    it('should throw error when optional expectedUpdate has invalid ISO string', () => {
      const input = new Map<string, unknown>([
        ['signed', '2024-03-20T10:00:00Z'],
        ['validFrom', '2024-03-20T10:00:00Z'],
        ['validUntil', '2025-03-20T10:00:00Z'],
        ['expectedUpdate', INVALID_ISO],
      ]);
      try {
        validityInfoSchema.parse(input);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            dateTimeInvalidFormatMessage('ExpectedUpdate')
          );
        }
      }
    });
  });
});
