import { describe, expect, it, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { toISODateTimeString } from '@/utils/toISODateTimeString';
import { validityInfoSchema, type ValidityInfo } from '../ValidityInfo';
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

      // Test that result is a Map
      expect(result).toBeInstanceOf(Map);
      expect(result.get('signed')).toEqual({
        tag: 0,
        value: toISODateTimeString(new Date('2024-03-20T10:00:00Z')),
      });
      expect(result.get('validFrom')).toEqual({
        tag: 0,
        value: toISODateTimeString(new Date('2024-03-20T10:00:00Z')),
      });
      expect(result.get('validUntil')).toEqual({
        tag: 0,
        value: toISODateTimeString(new Date('2025-03-20T10:00:00Z')),
      });
      expect(result.get('expectedUpdate')).toEqual({
        tag: 0,
        value: toISODateTimeString(new Date('2024-09-20T10:00:00Z')),
      });
    });

    it('should validate without optional expectedUpdate (ISO strings)', () => {
      const input = new Map<string, unknown>([
        ['signed', '2024-03-20T10:00:00Z'],
        ['validFrom', '2024-03-20T10:00:00Z'],
        ['validUntil', '2025-03-20T10:00:00Z'],
      ]);
      const result = validityInfoSchema.parse(input);

      // Test that result is a Map
      expect(result).toBeInstanceOf(Map);
      expect(result.get('signed')).toEqual({
        tag: 0,
        value: toISODateTimeString(new Date('2024-03-20T10:00:00Z')),
      });
      expect(result.get('validFrom')).toEqual({
        tag: 0,
        value: toISODateTimeString(new Date('2024-03-20T10:00:00Z')),
      });
      expect(result.get('validUntil')).toEqual({
        tag: 0,
        value: toISODateTimeString(new Date('2025-03-20T10:00:00Z')),
      });
      expect(result.get('expectedUpdate')).toBeUndefined();
    });
  });

  describe('type tests', () => {
    it('should have correct return type', () => {
      const input = new Map<string, unknown>([
        ['signed', '2024-03-20T10:00:00Z'],
        ['validFrom', '2024-03-20T10:00:00Z'],
        ['validUntil', '2025-03-20T10:00:00Z'],
        ['expectedUpdate', '2024-09-20T10:00:00Z'],
      ]);
      const result = validityInfoSchema.parse(input);

      // Test that result is of type ValidityInfo (StrictMap)
      expectTypeOf(result).toEqualTypeOf<ValidityInfo>();
      expect(result).toBeInstanceOf(Map);
    });

    it('should have correct get method types', () => {
      const input = new Map<string, unknown>([
        ['signed', '2024-03-20T10:00:00Z'],
        ['validFrom', '2024-03-20T10:00:00Z'],
        ['validUntil', '2025-03-20T10:00:00Z'],
        ['expectedUpdate', '2024-09-20T10:00:00Z'],
      ]);
      const result = validityInfoSchema.parse(input);

      // Test that get method returns the correct types
      const signed = result.get('signed');
      const validFrom = result.get('validFrom');
      const validUntil = result.get('validUntil');
      const expectedUpdate = result.get('expectedUpdate');

      // These should be Tag objects - test runtime behavior
      expect(typeof signed).toBe('object');
      expect(typeof validFrom).toBe('object');
      expect(typeof validUntil).toBe('object');
      expect(typeof expectedUpdate).toBe('object');

      // Test that they have the correct Tag structure
      expect(signed).toHaveProperty('tag', 0);
      expect(signed).toHaveProperty('value');
      expect(validFrom).toHaveProperty('tag', 0);
      expect(validFrom).toHaveProperty('value');
      expect(validUntil).toHaveProperty('tag', 0);
      expect(validUntil).toHaveProperty('value');
      expect(expectedUpdate).toHaveProperty('tag', 0);
      expect(expectedUpdate).toHaveProperty('value');
    });

    it('should have correct key types', () => {
      const input = new Map<string, unknown>([
        ['signed', '2024-03-20T10:00:00Z'],
        ['validFrom', '2024-03-20T10:00:00Z'],
        ['validUntil', '2025-03-20T10:00:00Z'],
      ]);
      const result = validityInfoSchema.parse(input);

      // Test that keys are properly typed
      const keys = Array.from(result.keys());
      expect(keys).toContain('signed');
      expect(keys).toContain('validFrom');
      expect(keys).toContain('validUntil');
      expect(keys).not.toContain('expectedUpdate');
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
            `ValidityInfo.signed: ${dateTimeInvalidFormatMessage('Signed')}`
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
            `ValidityInfo.validFrom: ${dateTimeInvalidFormatMessage('ValidFrom')}`
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
            `ValidityInfo.validUntil: ${dateTimeInvalidFormatMessage('ValidUntil')}`
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
            `ValidityInfo.expectedUpdate: ${dateTimeInvalidFormatMessage('ExpectedUpdate')}`
          );
        }
      }
    });
  });
});
