import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { pexConstraintsSchema } from '../PexConstraints';

describe('pexConstraintsSchema', () => {
  describe('should accept valid constraints', () => {
    it('accepts empty constraints object', () => {
      const result = pexConstraintsSchema.parse({});
      expect(result).toEqual({});
    });

    it('accepts constraints with limit_disclosure only (required)', () => {
      const result = pexConstraintsSchema.parse({
        limit_disclosure: 'required',
      });
      expect(result).toEqual({
        limit_disclosure: 'required',
      });
    });

    it('accepts constraints with limit_disclosure only (preferred)', () => {
      const result = pexConstraintsSchema.parse({
        limit_disclosure: 'preferred',
      });
      expect(result).toEqual({
        limit_disclosure: 'preferred',
      });
    });

    it('accepts constraints with fields only', () => {
      const result = pexConstraintsSchema.parse({
        fields: [
          {
            path: ["$['org.iso.18013.5.1']['given_name']"],
          },
        ],
      });
      expect(result).toEqual({
        fields: [
          {
            path: ["$['org.iso.18013.5.1']['given_name']"],
            intent_to_retain: false,
          },
        ],
      });
    });

    it('accepts constraints with multiple fields', () => {
      const result = pexConstraintsSchema.parse({
        fields: [
          {
            path: ["$['org.iso.18013.5.1']['given_name']"],
            intent_to_retain: true,
          },
          {
            path: ["$['org.iso.18013.5.1']['family_name']"],
            intent_to_retain: false,
          },
        ],
      });
      expect(result.fields).toHaveLength(2);
      expect(result.fields?.[0].path).toEqual([
        "$['org.iso.18013.5.1']['given_name']",
      ]);
      expect(result.fields?.[0].intent_to_retain).toBe(true);
      expect(result.fields?.[1].path).toEqual([
        "$['org.iso.18013.5.1']['family_name']",
      ]);
      expect(result.fields?.[1].intent_to_retain).toBe(false);
    });

    it('accepts constraints with both limit_disclosure and fields', () => {
      const result = pexConstraintsSchema.parse({
        limit_disclosure: 'required',
        fields: [
          {
            path: ["$['org.iso.18013.5.1']['given_name']"],
            intent_to_retain: true,
          },
        ],
      });
      expect(result).toEqual({
        limit_disclosure: 'required',
        fields: [
          {
            path: ["$['org.iso.18013.5.1']['given_name']"],
            intent_to_retain: true,
          },
        ],
      });
    });

    it('accepts fields with filter', () => {
      const result = pexConstraintsSchema.parse({
        fields: [
          {
            path: ["$['org.iso.18013.5.1']['age']"],
            filter: {
              type: 'number',
              const: 18,
            },
          },
        ],
      });
      expect(result.fields?.[0].filter).toEqual({
        type: 'number',
        const: 18,
      });
    });
  });

  describe('should reject invalid constraints', () => {
    it('rejects limit_disclosure that is not a valid enum value (string)', () => {
      try {
        pexConstraintsSchema.parse({
          limit_disclosure: 'invalid',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['limit_disclosure']);
        expect(zodError.issues[0].message).toBe(
          "Invalid enum value. Expected 'required' | 'preferred', received 'invalid'"
        );
      }
    });

    it('rejects limit_disclosure that is not a string (number)', () => {
      try {
        pexConstraintsSchema.parse({
          limit_disclosure: 123,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['limit_disclosure']);
        expect(zodError.issues[0].message).toBe(
          "Expected 'required' | 'preferred', received number"
        );
      }
    });

    it('rejects limit_disclosure that is not a string (null)', () => {
      try {
        pexConstraintsSchema.parse({
          limit_disclosure: null,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['limit_disclosure']);
        expect(zodError.issues[0].message).toBe(
          "Expected 'required' | 'preferred', received null"
        );
      }
    });

    it('rejects limit_disclosure that is not a string (boolean)', () => {
      try {
        pexConstraintsSchema.parse({
          limit_disclosure: true,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['limit_disclosure']);
        expect(zodError.issues[0].message).toBe(
          "Expected 'required' | 'preferred', received boolean"
        );
      }
    });

    it('rejects limit_disclosure that is not a string (object)', () => {
      try {
        pexConstraintsSchema.parse({
          limit_disclosure: { value: 'required' },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['limit_disclosure']);
        expect(zodError.issues[0].message).toBe(
          "Expected 'required' | 'preferred', received object"
        );
      }
    });

    it('rejects fields that is not an array (string)', () => {
      try {
        pexConstraintsSchema.parse({
          fields: 'not-an-array',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['fields']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects fields that is not an array (number)', () => {
      try {
        pexConstraintsSchema.parse({
          fields: 123,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['fields']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received number'
        );
      }
    });

    it('rejects fields that is not an array (null)', () => {
      try {
        pexConstraintsSchema.parse({
          fields: null,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['fields']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received null'
        );
      }
    });

    it('rejects fields that is not an array (boolean)', () => {
      try {
        pexConstraintsSchema.parse({
          fields: true,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['fields']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received boolean'
        );
      }
    });

    it('rejects fields that is not an array (object)', () => {
      try {
        pexConstraintsSchema.parse({
          fields: { field: 'value' },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['fields']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received object'
        );
      }
    });

    it('rejects fields array with invalid field (missing path)', () => {
      try {
        pexConstraintsSchema.parse({
          fields: [{}],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['fields', 0, 'path']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects fields array with invalid field (empty path array)', () => {
      try {
        pexConstraintsSchema.parse({
          fields: [{ path: [] }],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['fields', 0, 'path']);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('rejects fields array with invalid field (non-string path element)', () => {
      try {
        pexConstraintsSchema.parse({
          fields: [{ path: [123] }],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['fields', 0, 'path', 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('rejects fields array with invalid filter', () => {
      try {
        pexConstraintsSchema.parse({
          fields: [
            {
              path: ["$['org.iso.18013.5.1']['field']"],
              filter: {
                type: 123, // invalid: should be string
              },
            },
          ],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([
          'fields',
          0,
          'filter',
          'type',
        ]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('rejects input that is not an object (string)', () => {
      try {
        pexConstraintsSchema.parse('not-an-object');
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
        pexConstraintsSchema.parse([]);
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
        pexConstraintsSchema.parse(null);
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
    it('returns success for empty constraints', () => {
      const result = pexConstraintsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it('returns success for valid constraints with limit_disclosure', () => {
      const result = pexConstraintsSchema.safeParse({
        limit_disclosure: 'preferred',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          limit_disclosure: 'preferred',
        });
      }
    });

    it('returns success for valid constraints with fields', () => {
      const result = pexConstraintsSchema.safeParse({
        fields: [
          {
            path: ["$['org.iso.18013.5.1']['given_name']"],
            intent_to_retain: true,
          },
        ],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fields).toHaveLength(1);
        expect(result.data.fields?.[0].path).toEqual([
          "$['org.iso.18013.5.1']['given_name']",
        ]);
        expect(result.data.fields?.[0].intent_to_retain).toBe(true);
      }
    });

    it('returns success for valid constraints with both properties', () => {
      const result = pexConstraintsSchema.safeParse({
        limit_disclosure: 'required',
        fields: [
          {
            path: ["$['org.iso.18013.5.1']['given_name']"],
          },
        ],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit_disclosure).toBe('required');
        expect(result.data.fields).toHaveLength(1);
      }
    });

    it('returns error for invalid limit_disclosure', () => {
      const result = pexConstraintsSchema.safeParse({
        limit_disclosure: 'invalid',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['limit_disclosure']);
        expect(result.error.issues[0].message).toBe(
          "Invalid enum value. Expected 'required' | 'preferred', received 'invalid'"
        );
      }
    });

    it('returns error for invalid fields', () => {
      const result = pexConstraintsSchema.safeParse({
        fields: [{ path: [] }],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['fields', 0, 'path']);
        expect(result.error.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('returns error for non-object input', () => {
      const result = pexConstraintsSchema.safeParse('not-an-object');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([]);
        expect(result.error.issues[0].message).toBe(
          'Expected object, received string'
        );
      }
    });
  });
});
