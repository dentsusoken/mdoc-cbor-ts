import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { dcqlMetaSchema } from '../DcqlMeta';

describe('dcqlMetaSchema', () => {
  describe('should accept valid DCQL meta data', () => {
    it('accepts meta with doctype_value', () => {
      const result = dcqlMetaSchema.parse({
        doctype_value: 'org.iso.18013.5.1.mDL',
      });
      expect(result).toEqual({
        doctype_value: 'org.iso.18013.5.1.mDL',
      });
    });

    it('accepts various string doctype_values', () => {
      expect(
        dcqlMetaSchema.parse({
          doctype_value: 'org.example.v1',
        }).doctype_value
      ).toBe('org.example.v1');

      expect(
        dcqlMetaSchema.parse({
          doctype_value: 'com.test.document',
        }).doctype_value
      ).toBe('com.test.document');
    });
  });

  describe('should reject invalid DCQL meta data', () => {
    it('rejects empty string doctype_value', () => {
      try {
        dcqlMetaSchema.parse({
          doctype_value: '',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['doctype_value']);
        expect(zodError.issues[0].message).toBe(
          'String must contain at least 1 character(s)'
        );
      }
    });

    it('rejects missing doctype_value', () => {
      try {
        dcqlMetaSchema.parse({});
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['doctype_value']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects doctype_value that is not a string (number)', () => {
      try {
        dcqlMetaSchema.parse({
          doctype_value: 123,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['doctype_value']);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('rejects doctype_value that is not a string (null)', () => {
      try {
        dcqlMetaSchema.parse({
          doctype_value: null,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['doctype_value']);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received null'
        );
      }
    });

    it('rejects doctype_value that is not a string (boolean)', () => {
      try {
        dcqlMetaSchema.parse({
          doctype_value: true,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['doctype_value']);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received boolean'
        );
      }
    });

    it('rejects doctype_value that is not a string (array)', () => {
      try {
        dcqlMetaSchema.parse({
          doctype_value: [],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['doctype_value']);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received array'
        );
      }
    });

    it('rejects doctype_value that is not a string (object)', () => {
      try {
        dcqlMetaSchema.parse({
          doctype_value: {},
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['doctype_value']);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received object'
        );
      }
    });
  });

  describe('safeParse', () => {
    it('returns success for valid meta data', () => {
      expect(
        dcqlMetaSchema.safeParse({
          doctype_value: 'org.iso.18013.5.1.mDL',
        }).success
      ).toBe(true);
    });

    it('returns error for invalid meta data', () => {
      expect(dcqlMetaSchema.safeParse({}).success).toBe(false);
      expect(dcqlMetaSchema.safeParse({ doctype_value: '' }).success).toBe(
        false
      );
      expect(dcqlMetaSchema.safeParse({ doctype_value: 123 }).success).toBe(
        false
      );
    });

    it('returns ZodError for invalid meta data', () => {
      const result = dcqlMetaSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError);
      }
    });
  });
});
