import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { dcqlClaimSchema } from '../DcqlClaim';

describe('dcqlClaimSchema', () => {
  describe('should accept valid DCQL claims', () => {
    it('accepts claim with path only', () => {
      const result = dcqlClaimSchema.parse({
        path: ['org.iso.18013.5.1', 'given_name'],
      });
      expect(result).toEqual({
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: false,
      });
    });

    it('accepts claim with path and values', () => {
      const result = dcqlClaimSchema.parse({
        path: ['org.iso.18013.5.1', 'age'],
        values: [18, 21, 25],
      });
      expect(result).toEqual({
        path: ['org.iso.18013.5.1', 'age'],
        values: [18, 21, 25],
        intent_to_retain: false,
      });
    });

    it('accepts claim with path and intent_to_retain', () => {
      const result = dcqlClaimSchema.parse({
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: true,
      });
      expect(result).toEqual({
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: true,
      });
    });

    it('accepts claim with all fields', () => {
      const result = dcqlClaimSchema.parse({
        path: ['org.iso.18013.5.1', 'status'],
        values: ['active', 'pending'],
        intent_to_retain: true,
      });
      expect(result).toEqual({
        path: ['org.iso.18013.5.1', 'status'],
        values: ['active', 'pending'],
        intent_to_retain: true,
      });
    });

    it('accepts empty values array', () => {
      const result = dcqlClaimSchema.parse({
        path: ['org.iso.18013.5.1', 'field'],
        values: [],
      });
      expect(result.values).toEqual([]);
    });

    it('accepts mixed value types in values array', () => {
      const result = dcqlClaimSchema.parse({
        path: ['org.iso.18013.5.1', 'mixed'],
        values: ['string', 42, true, null, false],
      });
      expect(result.values).toEqual(['string', 42, true, null, false]);
    });

    it('defaults intent_to_retain to false when omitted', () => {
      const result = dcqlClaimSchema.parse({
        path: ['org.iso.18013.5.1', 'field'],
      });
      expect(result.intent_to_retain).toBe(false);
    });
  });

  describe('should reject invalid DCQL claims', () => {
    it('rejects missing path', () => {
      try {
        dcqlClaimSchema.parse({});
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects path that is not a tuple', () => {
      try {
        dcqlClaimSchema.parse({ path: 'not-a-tuple' });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects path with empty array', () => {
      try {
        dcqlClaimSchema.parse({ path: [] });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 2 element(s)'
        );
      }
    });

    it('rejects path with single element', () => {
      try {
        dcqlClaimSchema.parse({ path: ['single'] });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 2 element(s)'
        );
      }
    });

    it('rejects path with three elements', () => {
      try {
        dcqlClaimSchema.parse({ path: ['one', 'two', 'three'] });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Array must contain at most 2 element(s)'
        );
      }
    });

    it('rejects path with non-string first element', () => {
      try {
        dcqlClaimSchema.parse({ path: [123, 'name'] });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('rejects path with non-string second element', () => {
      try {
        dcqlClaimSchema.parse({ path: ['namespace', null] });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Expected string, received null'
        );
      }
    });

    it('rejects path with boolean element', () => {
      try {
        dcqlClaimSchema.parse({ path: [true, 'name'] });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Expected string, received boolean'
        );
      }
    });

    it('rejects values that are not an array', () => {
      try {
        dcqlClaimSchema.parse({
          path: ['org.iso.18013.5.1', 'field'],
          values: 'not-an-array',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects values that are an object', () => {
      try {
        dcqlClaimSchema.parse({
          path: ['org.iso.18013.5.1', 'field'],
          values: {},
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Expected array, received object'
        );
      }
    });

    it('rejects values array with invalid DCQL values (object)', () => {
      try {
        dcqlClaimSchema.parse({
          path: ['org.iso.18013.5.1', 'field'],
          values: [{}],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe('Invalid input');
      }
    });

    it('rejects values array with invalid DCQL values (array)', () => {
      try {
        dcqlClaimSchema.parse({
          path: ['org.iso.18013.5.1', 'field'],
          values: [[]],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe('Invalid input');
      }
    });

    it('rejects values array with invalid DCQL values (undefined)', () => {
      try {
        dcqlClaimSchema.parse({
          path: ['org.iso.18013.5.1', 'field'],
          values: [undefined],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe('Invalid input');
      }
    });

    it('rejects intent_to_retain that is not a boolean (string)', () => {
      try {
        dcqlClaimSchema.parse({
          path: ['org.iso.18013.5.1', 'field'],
          intent_to_retain: 'true',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Expected boolean, received string'
        );
      }
    });

    it('rejects intent_to_retain that is not a boolean (number)', () => {
      try {
        dcqlClaimSchema.parse({
          path: ['org.iso.18013.5.1', 'field'],
          intent_to_retain: 1,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Expected boolean, received number'
        );
      }
    });

    it('rejects intent_to_retain that is not a boolean (null)', () => {
      try {
        dcqlClaimSchema.parse({
          path: ['org.iso.18013.5.1', 'field'],
          intent_to_retain: null,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Expected boolean, received null'
        );
      }
    });
  });

  describe('safeParse', () => {
    it('returns success for valid claims', () => {
      expect(
        dcqlClaimSchema.safeParse({
          path: ['org.iso.18013.5.1', 'field'],
        }).success
      ).toBe(true);
    });

    it('returns error for invalid claims', () => {
      expect(dcqlClaimSchema.safeParse({}).success).toBe(false);
      expect(dcqlClaimSchema.safeParse({ path: 'invalid' }).success).toBe(
        false
      );
    });

    it('returns ZodError for invalid claims', () => {
      const result = dcqlClaimSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError);
      }
    });
  });
});
