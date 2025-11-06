import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { pexFieldSchema } from '../PexField';

describe('pexFieldSchema', () => {
  describe('should accept valid fields', () => {
    it('accepts field with path only', () => {
      const result = pexFieldSchema.parse({
        path: ["$['org.iso.18013.5.1']['given_name']"],
      });
      expect(result).toEqual({
        path: ["$['org.iso.18013.5.1']['given_name']"],
        intent_to_retain: false,
      });
    });

    it('accepts field with path and intent_to_retain', () => {
      const result = pexFieldSchema.parse({
        path: ["$['org.iso.18013.5.1']['given_name']"],
        intent_to_retain: true,
      });
      expect(result).toEqual({
        path: ["$['org.iso.18013.5.1']['given_name']"],
        intent_to_retain: true,
      });
    });

    it('accepts field with path and filter', () => {
      const result = pexFieldSchema.parse({
        path: ["$['org.iso.18013.5.1']['age']"],
        filter: {
          type: 'number',
          const: 18,
        },
      });
      expect(result).toEqual({
        path: ["$['org.iso.18013.5.1']['age']"],
        intent_to_retain: false,
        filter: {
          type: 'number',
          const: 18,
        },
      });
    });

    it('accepts field with all supported fields', () => {
      const result = pexFieldSchema.parse({
        path: ["$['org.iso.18013.5.1']['status']"],
        intent_to_retain: true,
        filter: {
          type: 'string',
          enum: ['active', 'pending'],
        },
      });
      expect(result).toEqual({
        path: ["$['org.iso.18013.5.1']['status']"],
        intent_to_retain: true,
        filter: {
          type: 'string',
          enum: ['active', 'pending'],
        },
      });
    });

    it('accepts path with multiple elements', () => {
      const result = pexFieldSchema.parse({
        path: [
          "$['org.iso.18013.5.1']['name']",
          "$['org.iso.18013.5.1']['family_name']",
        ],
      });
      expect(result.path).toEqual([
        "$['org.iso.18013.5.1']['name']",
        "$['org.iso.18013.5.1']['family_name']",
      ]);
    });

    it('defaults intent_to_retain to false when omitted', () => {
      const result = pexFieldSchema.parse({
        path: ["$['org.iso.18013.5.1']['field']"],
      });
      expect(result.intent_to_retain).toBe(false);
    });
  });

  describe('should reject invalid fields', () => {
    it('rejects missing path', () => {
      try {
        pexFieldSchema.parse({});
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['path']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects path that is not an array (string)', () => {
      try {
        pexFieldSchema.parse({ path: 'not-an-array' });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['path']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects path that is not an array (number)', () => {
      try {
        pexFieldSchema.parse({ path: 123 });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['path']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received number'
        );
      }
    });

    it('rejects path that is not an array (null)', () => {
      try {
        pexFieldSchema.parse({ path: null });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['path']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received null'
        );
      }
    });

    it('rejects empty path array', () => {
      try {
        pexFieldSchema.parse({ path: [] });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['path']);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('rejects path with non-string element (number)', () => {
      try {
        pexFieldSchema.parse({ path: [123] });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['path', 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('rejects path with non-string element (null)', () => {
      try {
        pexFieldSchema.parse({ path: [null] });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['path', 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received null'
        );
      }
    });

    it('rejects path with non-string element (boolean)', () => {
      try {
        pexFieldSchema.parse({ path: [true] });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['path', 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received boolean'
        );
      }
    });

    it('rejects intent_to_retain that is not a boolean (string)', () => {
      try {
        pexFieldSchema.parse({
          path: ["$['org.iso.18013.5.1']['field']"],
          intent_to_retain: 'true',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['intent_to_retain']);
        expect(zodError.issues[0].message).toBe(
          'Expected boolean, received string'
        );
      }
    });

    it('rejects intent_to_retain that is not a boolean (number)', () => {
      try {
        pexFieldSchema.parse({
          path: ["$['org.iso.18013.5.1']['field']"],
          intent_to_retain: 1,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['intent_to_retain']);
        expect(zodError.issues[0].message).toBe(
          'Expected boolean, received number'
        );
      }
    });

    it('rejects optional field (strict mode)', () => {
      try {
        pexFieldSchema.parse({
          path: ["$['org.iso.18013.5.1']['field']"],
          optional: true,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          "Unrecognized key(s) in object: 'optional'"
        );
      }
    });

    it('rejects invalid filter', () => {
      try {
        pexFieldSchema.parse({
          path: ["$['org.iso.18013.5.1']['field']"],
          filter: {
            type: 123, // invalid: should be string
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['filter', 'type']);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('rejects unknown fields (strict mode)', () => {
      try {
        pexFieldSchema.parse({
          path: ["$['org.iso.18013.5.1']['field']"],
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
        pexFieldSchema.parse({
          path: ["$['org.iso.18013.5.1']['field']"],
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
        pexFieldSchema.parse('not-an-object');
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
        pexFieldSchema.parse([]);
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
        pexFieldSchema.parse(null);
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
    it('returns success for valid field', () => {
      const result = pexFieldSchema.safeParse({
        path: ["$['org.iso.18013.5.1']['given_name']"],
        intent_to_retain: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          path: ["$['org.iso.18013.5.1']['given_name']"],
          intent_to_retain: true,
        });
      }
    });

    it('returns error for invalid field', () => {
      const result = pexFieldSchema.safeParse({
        path: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['path']);
        expect(result.error.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('returns error for unknown field', () => {
      const result = pexFieldSchema.safeParse({
        path: ["$['org.iso.18013.5.1']['field']"],
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

    it('returns error for optional field', () => {
      const result = pexFieldSchema.safeParse({
        path: ["$['org.iso.18013.5.1']['field']"],
        optional: true,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([]);
        expect(result.error.issues[0].message).toBe(
          "Unrecognized key(s) in object: 'optional'"
        );
      }
    });
  });
});
