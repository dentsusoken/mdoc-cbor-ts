import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { drivingPrivilegeSchema } from '../drivingPrivilegeSchema';
import { fullDateInvalidTypeMessage } from '@/schemas/cbor/FullDate';

describe('drivingPrivilegeSchema', () => {
  describe('valid cases', () => {
    it('should validate minimal object with required fields only', () => {
      const input = {
        vehicle_category_code: 'B',
      };
      const result = drivingPrivilegeSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.vehicle_category_code).toBe('B');
      }
    });

    it('should validate with dates and codes array', () => {
      const input = {
        vehicle_category_code: 'BE',
        issue_date: '2022-01-01',
        expiry_date: '2027-01-01',
        codes: [{ code: '78' }, { code: '96', sign: '+', value: '96' }],
      };
      const result = drivingPrivilegeSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.vehicle_category_code).toBe('BE');
        expect(Array.isArray(result.data.codes)).toBe(true);
        expect(result.data.codes?.length).toBe(2);
      }
    });
  });

  describe('invalid cases', () => {
    it('should reject empty vehicle_category_code', () => {
      const input = {
        vehicle_category_code: '',
      };
      try {
        drivingPrivilegeSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        const issue = zerr.issues[0];
        expect(issue.path).toEqual(['vehicle_category_code']);
        expect(issue.message).toBe(
          'String must contain at least 1 character(s)'
        );
      }
    });

    it('should reject empty codes array when provided', () => {
      const input = {
        vehicle_category_code: 'B',
        codes: [],
      };
      try {
        drivingPrivilegeSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        const issue = zerr.issues[0];
        expect(issue.path).toEqual(['codes']);
        expect(issue.message).toBe('Array must contain at least 1 element(s)');
      }
    });

    it('should reject code object missing required code field', () => {
      const input = {
        vehicle_category_code: 'B',
        codes: [{ sign: '+', value: '96' }],
      };
      try {
        drivingPrivilegeSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        const issue = zerr.issues[0];
        expect(issue.path).toEqual(['codes', 0, 'code']);
        expect(issue.message).toBe('Required');
      }
    });

    it('should reject invalid issue_date type', () => {
      const input = {
        vehicle_category_code: 'B',
        issue_date: 123 as unknown as string,
      };
      try {
        drivingPrivilegeSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        const issue = zerr.issues[0];
        expect(issue.path).toEqual(['issue_date']);
        expect(issue.message).toBe(fullDateInvalidTypeMessage(123));
      }
    });
  });
});
