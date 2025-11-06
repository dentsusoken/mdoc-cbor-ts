import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { dcqlCredentialSetsSchema } from '../DcqlCredentialSets';

describe('dcqlCredentialSetsSchema', () => {
  describe('should accept valid credential sets', () => {
    it('accepts single credential set with one index', () => {
      const result = dcqlCredentialSetsSchema.parse([[0]]);
      expect(result).toEqual([[0]]);
    });

    it('accepts single credential set with multiple indices', () => {
      const result = dcqlCredentialSetsSchema.parse([[0, 1, 2]]);
      expect(result).toEqual([[0, 1, 2]]);
    });

    it('accepts multiple credential sets', () => {
      const result = dcqlCredentialSetsSchema.parse([[0, 1], [2]]);
      expect(result).toEqual([[0, 1], [2]]);
    });

    it('accepts multiple credential sets with various sizes', () => {
      const result = dcqlCredentialSetsSchema.parse([[0], [1, 2, 3], [4, 5]]);
      expect(result).toEqual([[0], [1, 2, 3], [4, 5]]);
    });

    it('accepts credential sets with zero', () => {
      const result = dcqlCredentialSetsSchema.parse([[0, 1, 0]]);
      expect(result).toEqual([[0, 1, 0]]);
    });

    it('accepts credential sets with large numbers', () => {
      const result = dcqlCredentialSetsSchema.parse([[100, 200], [300]]);
      expect(result).toEqual([[100, 200], [300]]);
    });

    it('accepts empty credential set arrays (empty inner arrays are allowed)', () => {
      const result = dcqlCredentialSetsSchema.parse([[]]);
      expect(result).toEqual([[]]);
    });

    it('accepts credential sets with empty and non-empty arrays', () => {
      const result = dcqlCredentialSetsSchema.parse([[], [0, 1]]);
      expect(result).toEqual([[], [0, 1]]);
    });
  });

  describe('should reject invalid credential sets', () => {
    it('rejects empty array', () => {
      try {
        dcqlCredentialSetsSchema.parse([]);
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
        dcqlCredentialSetsSchema.parse('not-an-array');
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
        dcqlCredentialSetsSchema.parse(123);
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
        dcqlCredentialSetsSchema.parse(null);
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
        dcqlCredentialSetsSchema.parse(true);
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
        dcqlCredentialSetsSchema.parse({});
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

    it('rejects array with non-array element (string)', () => {
      try {
        dcqlCredentialSetsSchema.parse(['not-an-array']);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0]);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects array with non-array element (number)', () => {
      try {
        dcqlCredentialSetsSchema.parse([123]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0]);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received number'
        );
      }
    });

    it('rejects array with non-array element (null)', () => {
      try {
        dcqlCredentialSetsSchema.parse([null]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0]);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received null'
        );
      }
    });

    it('rejects array with non-array element (object)', () => {
      try {
        dcqlCredentialSetsSchema.parse([{}]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0]);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received object'
        );
      }
    });

    it('rejects credential set with non-number element (string)', () => {
      try {
        dcqlCredentialSetsSchema.parse([['not-a-number']]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0, 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected number, received string'
        );
      }
    });

    it('rejects credential set with non-number element (null)', () => {
      try {
        dcqlCredentialSetsSchema.parse([[null]]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0, 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected number, received null'
        );
      }
    });

    it('rejects credential set with non-number element (boolean)', () => {
      try {
        dcqlCredentialSetsSchema.parse([[true]]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0, 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected number, received boolean'
        );
      }
    });

    it('rejects credential set with non-integer number (float)', () => {
      try {
        dcqlCredentialSetsSchema.parse([[1.5]]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0, 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected integer, received float'
        );
      }
    });

    it('rejects credential set with negative number', () => {
      try {
        dcqlCredentialSetsSchema.parse([[-1]]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0, 0]);
        expect(zodError.issues[0].message).toBe(
          'Number must be greater than or equal to 0'
        );
      }
    });

    it('rejects credential set with mixed valid and invalid elements', () => {
      try {
        dcqlCredentialSetsSchema.parse([[0, -1, 2]]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([0, 1]);
        expect(zodError.issues[0].message).toBe(
          'Number must be greater than or equal to 0'
        );
      }
    });

    it('rejects multiple credential sets with one invalid', () => {
      try {
        dcqlCredentialSetsSchema.parse([[0, 1], [-1]]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([1, 0]);
        expect(zodError.issues[0].message).toBe(
          'Number must be greater than or equal to 0'
        );
      }
    });
  });

  describe('safeParse', () => {
    it('returns success for valid credential sets', () => {
      const result = dcqlCredentialSetsSchema.safeParse([[0, 1], [2]]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([[0, 1], [2]]);
      }
    });

    it('returns success for single credential set', () => {
      const result = dcqlCredentialSetsSchema.safeParse([[0, 1, 2]]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([[0, 1, 2]]);
      }
    });

    it('returns error for empty array', () => {
      const result = dcqlCredentialSetsSchema.safeParse([]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([]);
        expect(result.error.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('returns error for invalid element type', () => {
      const result = dcqlCredentialSetsSchema.safeParse(['not-an-array']);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([0]);
        expect(result.error.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('returns error for negative number', () => {
      const result = dcqlCredentialSetsSchema.safeParse([[-1]]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([0, 0]);
        expect(result.error.issues[0].message).toBe(
          'Number must be greater than or equal to 0'
        );
      }
    });

    it('returns error for non-integer number', () => {
      const result = dcqlCredentialSetsSchema.safeParse([[1.5]]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([0, 0]);
        expect(result.error.issues[0].message).toBe(
          'Expected integer, received float'
        );
      }
    });

    it('returns error for non-array input', () => {
      const result = dcqlCredentialSetsSchema.safeParse('not-an-array');
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
