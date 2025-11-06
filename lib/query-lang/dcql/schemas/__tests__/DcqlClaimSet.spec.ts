import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { dcqlClaimSetSchema } from '../DcqlClaimSet';

describe('dcqlClaimSetSchema', () => {
  describe('should accept valid claim sets', () => {
    it('accepts single claim', () => {
      const result = dcqlClaimSetSchema.parse([
        'org.iso.18013.5.1.mDL.given_name',
      ]);
      expect(result).toEqual(['org.iso.18013.5.1.mDL.given_name']);
    });

    it('accepts multiple claims', () => {
      const result = dcqlClaimSetSchema.parse([
        'org.iso.18013.5.1.mDL.given_name',
        'org.iso.18013.5.1.mDL.family_name',
      ]);
      expect(result).toEqual([
        'org.iso.18013.5.1.mDL.given_name',
        'org.iso.18013.5.1.mDL.family_name',
      ]);
    });

    it('accepts claim set with many claims', () => {
      const result = dcqlClaimSetSchema.parse([
        'org.iso.18013.5.1.mDL.given_name',
        'org.iso.18013.5.1.mDL.family_name',
        'org.iso.18013.5.1.mDL.birth_date',
        'org.iso.18013.5.1.mDL.license_number',
      ]);
      expect(result).toHaveLength(4);
      expect(result[0]).toBe('org.iso.18013.5.1.mDL.given_name');
      expect(result[3]).toBe('org.iso.18013.5.1.mDL.license_number');
    });

    it('accepts claim set with single character strings', () => {
      const result = dcqlClaimSetSchema.parse(['a', 'b']);
      expect(result).toEqual(['a', 'b']);
    });

    it('accepts claim set with various string formats', () => {
      const result = dcqlClaimSetSchema.parse([
        'simple',
        'with.dots',
        'with_underscores',
        'with-dashes',
        'with123numbers',
      ]);
      expect(result).toHaveLength(5);
    });
  });

  describe('should reject invalid claim sets', () => {
    it('rejects empty array', () => {
      try {
        dcqlClaimSetSchema.parse([]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('rejects non-array input (string)', () => {
      try {
        dcqlClaimSetSchema.parse('not-an-array');
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects non-array input (number)', () => {
      try {
        dcqlClaimSetSchema.parse(123);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received number'
        );
      }
    });

    it('rejects non-array input (null)', () => {
      try {
        dcqlClaimSetSchema.parse(null);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received null'
        );
      }
    });

    it('rejects non-array input (boolean)', () => {
      try {
        dcqlClaimSetSchema.parse(true);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received boolean'
        );
      }
    });

    it('rejects non-array input (object)', () => {
      try {
        dcqlClaimSetSchema.parse({});
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received object'
        );
      }
    });

    it('rejects array with empty string element', () => {
      try {
        dcqlClaimSetSchema.parse(['']);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0]);
        expect(zodError.issues[0].message).toBe(
          'String must contain at least 1 character(s)'
        );
      }
    });

    it('rejects array with multiple empty string elements', () => {
      try {
        dcqlClaimSetSchema.parse(['', '']);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0]);
        expect(zodError.issues[0].message).toBe(
          'String must contain at least 1 character(s)'
        );
      }
    });

    it('rejects array with mixed valid and empty string elements', () => {
      try {
        dcqlClaimSetSchema.parse(['valid', '']);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([1]);
        expect(zodError.issues[0].message).toBe(
          'String must contain at least 1 character(s)'
        );
      }
    });

    it('rejects array with non-string element (number)', () => {
      try {
        dcqlClaimSetSchema.parse([123]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('rejects array with non-string element (null)', () => {
      try {
        dcqlClaimSetSchema.parse([null]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received null'
        );
      }
    });

    it('rejects array with non-string element (boolean)', () => {
      try {
        dcqlClaimSetSchema.parse([true]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received boolean'
        );
      }
    });

    it('rejects array with non-string element (object)', () => {
      try {
        dcqlClaimSetSchema.parse([{}]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received object'
        );
      }
    });

    it('rejects array with mixed valid and invalid elements', () => {
      try {
        dcqlClaimSetSchema.parse(['valid', 123]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([1]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });
  });

  describe('safeParse', () => {
    it('returns success for valid claim set', () => {
      const result = dcqlClaimSetSchema.safeParse([
        'org.iso.18013.5.1.mDL.given_name',
        'org.iso.18013.5.1.mDL.family_name',
      ]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([
          'org.iso.18013.5.1.mDL.given_name',
          'org.iso.18013.5.1.mDL.family_name',
        ]);
      }
    });

    it('returns success for single claim', () => {
      const result = dcqlClaimSetSchema.safeParse([
        'org.iso.18013.5.1.mDL.given_name',
      ]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(['org.iso.18013.5.1.mDL.given_name']);
      }
    });

    it('returns error for empty array', () => {
      const result = dcqlClaimSetSchema.safeParse([]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([]);
        expect(result.error.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('returns error for empty string element', () => {
      const result = dcqlClaimSetSchema.safeParse(['']);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([0]);
        expect(result.error.issues[0].message).toBe(
          'String must contain at least 1 character(s)'
        );
      }
    });

    it('returns error for non-string element', () => {
      const result = dcqlClaimSetSchema.safeParse([123]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([0]);
        expect(result.error.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('returns error for non-array input', () => {
      const result = dcqlClaimSetSchema.safeParse('not-an-array');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([]);
        expect(result.error.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });
  });
});
