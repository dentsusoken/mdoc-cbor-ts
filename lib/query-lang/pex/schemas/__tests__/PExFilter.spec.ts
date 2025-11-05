import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { pexFilterSchema } from '../PExFilter';

describe('PExFilterSchema', () => {
  describe('should accept valid filters', () => {
    it('accepts empty object', () => {
      const result = pexFilterSchema.parse({});
      expect(result).toEqual({});
    });

    it('accepts filter with type only', () => {
      const result = pexFilterSchema.parse({
        type: 'string',
      });
      expect(result).toEqual({
        type: 'string',
      });
    });

    it('accepts filter with const only', () => {
      const result = pexFilterSchema.parse({
        const: 'test-value',
      });
      expect(result).toEqual({
        const: 'test-value',
      });
    });

    it('accepts filter with enum only', () => {
      const result = pexFilterSchema.parse({
        enum: ['value1', 'value2', 'value3'],
      });
      expect(result).toEqual({
        enum: ['value1', 'value2', 'value3'],
      });
    });

    it('accepts filter with type and const', () => {
      const result = pexFilterSchema.parse({
        type: 'string',
        const: 'exact-match',
      });
      expect(result).toEqual({
        type: 'string',
        const: 'exact-match',
      });
    });

    it('accepts filter with type and enum', () => {
      const result = pexFilterSchema.parse({
        type: 'string',
        enum: ['option1', 'option2'],
      });
      expect(result).toEqual({
        type: 'string',
        enum: ['option1', 'option2'],
      });
    });

    it('accepts filter with const and enum', () => {
      const result = pexFilterSchema.parse({
        const: 42,
        enum: [10, 20, 30, 42],
      });
      expect(result).toEqual({
        const: 42,
        enum: [10, 20, 30, 42],
      });
    });

    it('accepts filter with all fields', () => {
      const result = pexFilterSchema.parse({
        type: 'number',
        const: 100,
        enum: [100, 200, 300],
      });
      expect(result).toEqual({
        type: 'number',
        const: 100,
        enum: [100, 200, 300],
      });
    });

    it('accepts empty enum array', () => {
      const result = pexFilterSchema.parse({
        enum: [],
      });
      expect(result.enum).toEqual([]);
    });

    it('accepts enum with mixed value types', () => {
      const result = pexFilterSchema.parse({
        enum: ['string', 123, true, null],
      });
      expect(result.enum).toEqual(['string', 123, true, null]);
    });

    it('accepts const with various value types', () => {
      const stringResult = pexFilterSchema.parse({
        const: 'string-value',
      });
      expect(stringResult.const).toBe('string-value');

      const numberResult = pexFilterSchema.parse({
        const: 42,
      });
      expect(numberResult.const).toBe(42);

      const booleanResult = pexFilterSchema.parse({
        const: true,
      });
      expect(booleanResult.const).toBe(true);

      const nullResult = pexFilterSchema.parse({
        const: null,
      });
      expect(nullResult.const).toBeNull();

      const objectResult = pexFilterSchema.parse({
        const: { key: 'value' },
      });
      expect(objectResult.const).toEqual({ key: 'value' });

      const arrayResult = pexFilterSchema.parse({
        const: [1, 2, 3],
      });
      expect(arrayResult.const).toEqual([1, 2, 3]);
    });
  });

  describe('should reject invalid filters', () => {
    it('rejects type that is not a string (number)', () => {
      try {
        pexFilterSchema.parse({
          type: 123,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['type']);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('rejects type that is not a string (null)', () => {
      try {
        pexFilterSchema.parse({
          type: null,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['type']);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received null'
        );
      }
    });

    it('rejects type that is not a string (boolean)', () => {
      try {
        pexFilterSchema.parse({
          type: true,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['type']);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received boolean'
        );
      }
    });

    it('rejects type that is not a string (object)', () => {
      try {
        pexFilterSchema.parse({
          type: { invalid: 'type' },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['type']);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received object'
        );
      }
    });

    it('rejects enum that is not an array (string)', () => {
      try {
        pexFilterSchema.parse({
          enum: 'not-an-array',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['enum']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects enum that is not an array (number)', () => {
      try {
        pexFilterSchema.parse({
          enum: 123,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['enum']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received number'
        );
      }
    });

    it('rejects enum that is not an array (null)', () => {
      try {
        pexFilterSchema.parse({
          enum: null,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['enum']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received null'
        );
      }
    });

    it('rejects enum that is not an array (boolean)', () => {
      try {
        pexFilterSchema.parse({
          enum: false,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['enum']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received boolean'
        );
      }
    });

    it('rejects enum that is not an array (object)', () => {
      try {
        pexFilterSchema.parse({
          enum: { not: 'array' },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['enum']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received object'
        );
      }
    });

    it('rejects unknown fields (strict mode)', () => {
      try {
        pexFilterSchema.parse({
          type: 'string',
          unknownField: 'should-be-rejected',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          "Unrecognized key(s) in object: 'unknownField'"
        );
      }
    });

    it('rejects multiple unknown fields (strict mode)', () => {
      try {
        pexFilterSchema.parse({
          type: 'string',
          unknownField1: 'value1',
          unknownField2: 'value2',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          "Unrecognized key(s) in object: 'unknownField1', 'unknownField2'"
        );
      }
    });

    it('rejects input that is not an object (string)', () => {
      try {
        pexFilterSchema.parse('not-an-object');
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received string'
        );
      }
    });

    it('rejects input that is not an object (array)', () => {
      try {
        pexFilterSchema.parse([]);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received array'
        );
      }
    });

    it('rejects input that is not an object (null)', () => {
      try {
        pexFilterSchema.parse(null);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received null'
        );
      }
    });
  });

  describe('safeParse', () => {
    it('returns success for valid filter', () => {
      const result = pexFilterSchema.safeParse({
        type: 'string',
        const: 'value',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          type: 'string',
          const: 'value',
        });
      }
    });

    it('returns error for invalid filter', () => {
      const result = pexFilterSchema.safeParse({
        type: 123,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['type']);
        expect(result.error.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('returns error for unknown field', () => {
      const result = pexFilterSchema.safeParse({
        type: 'string',
        unknownField: 'value',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([]);
        expect(result.error.issues[0].message).toBe(
          "Unrecognized key(s) in object: 'unknownField'"
        );
      }
    });
  });
});
