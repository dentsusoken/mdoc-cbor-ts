import { describe, expect, it, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { Tag } from 'cbor-x';
import { toISODateTimeString } from '@/utils/toISODateTimeString';
import {
  validityInfoSchema,
  type ValidityInfo,
  createValidityInfo,
} from '../ValidityInfo';
import { dateTimeInvalidFormatMessage } from '@/schemas/cbor/DateTime';

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

      // Type assertions for get method
      expectTypeOf(result.get('signed')).toEqualTypeOf<Tag | undefined>();
      expectTypeOf(result.get('validFrom')).toEqualTypeOf<Tag | undefined>();
      expectTypeOf(result.get('validUntil')).toEqualTypeOf<Tag | undefined>();
      expectTypeOf(result.get('expectedUpdate')).toEqualTypeOf<
        Tag | undefined
      >();
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

    describe('createValidityInfo', () => {
      it('should create empty map and support typed set/get', () => {
        const map = createValidityInfo();
        expect(map).toBeInstanceOf(Map);

        // set Tag(0) values for required keys
        map.set('signed', new Tag('2024-03-20T10:00:00Z', 0));
        map.set('validFrom', new Tag('2024-03-20T10:00:00Z', 0));
        map.set('validUntil', new Tag('2025-03-20T10:00:00Z', 0));

        // get returns Tag | undefined (type-level); runtime shape check
        expect(map.get('signed')).toEqual(new Tag('2024-03-20T10:00:00Z', 0));
        expect(map.get('validFrom')).toEqual(
          new Tag('2024-03-20T10:00:00Z', 0)
        );
        expect(map.get('validUntil')).toEqual(
          new Tag('2025-03-20T10:00:00Z', 0)
        );
      });

      it('should accept initial entries with correct types', () => {
        const initial = [
          ['signed', new Tag('2024-03-20T10:00:00Z', 0)],
          ['validFrom', new Tag('2024-03-20T10:00:00Z', 0)],
          ['validUntil', new Tag('2025-03-20T10:00:00Z', 0)],
        ] as const;

        const map = createValidityInfo(initial);
        expect(map).toBeInstanceOf(Map);
        expect(map.get('signed')).toEqual(new Tag('2024-03-20T10:00:00Z', 0));
        expect(map.get('validFrom')).toEqual(
          new Tag('2024-03-20T10:00:00Z', 0)
        );
        expect(map.get('validUntil')).toEqual(
          new Tag('2025-03-20T10:00:00Z', 0)
        );
        expect(map.get('expectedUpdate')).toBeUndefined();
      });
    });

    it('should support createValidityInfo with correct types', () => {
      const map = createValidityInfo();
      expectTypeOf(map).toEqualTypeOf<ValidityInfo>();
      // Runtime: it's a Map
      expect(map).toBeInstanceOf(Map);
      // Type-safe set/get checks (compile-time):
      // map.set('signed', new Tag('2024-03-20T10:00:00Z', 0));
      // const v = map.get('validFrom');
      // expectTypeOf(v).toEqualTypeOf<Tag | undefined>();
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
            `ValidityInfo.signed: ${dateTimeInvalidFormatMessage(INVALID_ISO)}`
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
            `ValidityInfo.validFrom: ${dateTimeInvalidFormatMessage(INVALID_ISO)}`
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
            `ValidityInfo.validUntil: ${dateTimeInvalidFormatMessage(INVALID_ISO)}`
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
            `ValidityInfo.expectedUpdate: ${dateTimeInvalidFormatMessage(INVALID_ISO)}`
          );
        }
      }
    });
  });
});
