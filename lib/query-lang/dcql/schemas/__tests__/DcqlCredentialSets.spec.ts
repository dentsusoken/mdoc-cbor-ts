import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { dcqlCredentialSetSchema } from '../DcqlCredentialSet';

describe('dcqlCredentialSetSchema', () => {
  describe('should accept valid credential sets', () => {
    it('accepts credential set with single option containing one credential ID', () => {
      const result = dcqlCredentialSetSchema.parse({
        options: [['credential-1']],
      });
      expect(result).toEqual({
        options: [['credential-1']],
        required: true,
      });
    });

    it('accepts credential set with single option containing multiple credential IDs', () => {
      const result = dcqlCredentialSetSchema.parse({
        options: [['credential-1', 'credential-2', 'credential-3']],
      });
      expect(result).toEqual({
        options: [['credential-1', 'credential-2', 'credential-3']],
        required: true,
      });
    });

    it('accepts credential set with multiple options', () => {
      const result = dcqlCredentialSetSchema.parse({
        options: [['credential-1', 'credential-2'], ['credential-3']],
      });
      expect(result).toEqual({
        options: [['credential-1', 'credential-2'], ['credential-3']],
        required: true,
      });
    });

    it('accepts credential set with multiple options of various sizes', () => {
      const result = dcqlCredentialSetSchema.parse({
        options: [
          ['credential-1'],
          ['credential-2', 'credential-3', 'credential-4'],
          ['credential-5', 'credential-6'],
        ],
      });
      expect(result.options).toHaveLength(3);
      expect(result.options[0]).toEqual(['credential-1']);
      expect(result.options[2]).toEqual(['credential-5', 'credential-6']);
    });

    it('accepts credential set with required set to false', () => {
      const result = dcqlCredentialSetSchema.parse({
        options: [['credential-1']],
        required: false,
      });
      expect(result.required).toBe(false);
    });

    it('defaults required to true when omitted', () => {
      const result = dcqlCredentialSetSchema.parse({
        options: [['credential-1']],
      });
      expect(result.required).toBe(true);
    });
  });

  describe('should reject invalid credential sets', () => {
    it('rejects missing options', () => {
      try {
        dcqlCredentialSetSchema.parse({});
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['options']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects empty options array', () => {
      try {
        dcqlCredentialSetSchema.parse({
          options: [],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['options']);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('rejects non-array input (string)', () => {
      try {
        dcqlCredentialSetSchema.parse('not-an-object');
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

    it('rejects non-array input (number)', () => {
      try {
        dcqlCredentialSetSchema.parse(123);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received number'
        );
      }
    });

    it('rejects non-array input (null)', () => {
      try {
        dcqlCredentialSetSchema.parse(null);
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

    it('rejects non-array input (boolean)', () => {
      try {
        dcqlCredentialSetSchema.parse(true);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received boolean'
        );
      }
    });

    it('rejects options that are not an array', () => {
      try {
        dcqlCredentialSetSchema.parse({
          options: 'not-an-array',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['options']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects options array with non-array element (string)', () => {
      try {
        dcqlCredentialSetSchema.parse({
          options: ['not-an-array'],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['options', 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects options array with non-array element (number)', () => {
      try {
        dcqlCredentialSetSchema.parse({
          options: [123],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['options', 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received number'
        );
      }
    });

    it('rejects options array with empty inner array', () => {
      try {
        dcqlCredentialSetSchema.parse({
          options: [[]],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['options', 0]);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('rejects options array with empty string element', () => {
      try {
        dcqlCredentialSetSchema.parse({
          options: [['']],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['options', 0, 0]);
        expect(zodError.issues[0].message).toBe(
          'String must contain at least 1 character(s)'
        );
      }
    });

    it('rejects options array with non-string element (number)', () => {
      try {
        dcqlCredentialSetSchema.parse({
          options: [[123]],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['options', 0, 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('rejects options array with non-string element (null)', () => {
      try {
        dcqlCredentialSetSchema.parse({
          options: [[null]],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['options', 0, 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received null'
        );
      }
    });

    it('rejects options array with non-string element (boolean)', () => {
      try {
        dcqlCredentialSetSchema.parse({
          options: [[true]],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['options', 0, 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received boolean'
        );
      }
    });

    it('rejects options array with mixed valid and invalid elements', () => {
      try {
        dcqlCredentialSetSchema.parse({
          options: [['credential-1', '']],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['options', 0, 1]);
        expect(zodError.issues[0].message).toBe(
          'String must contain at least 1 character(s)'
        );
      }
    });

    it('rejects required that is not a boolean (string)', () => {
      try {
        dcqlCredentialSetSchema.parse({
          options: [['credential-1']],
          required: 'true',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['required']);
        expect(zodError.issues[0].message).toBe(
          'Expected boolean, received string'
        );
      }
    });

    it('rejects required that is not a boolean (number)', () => {
      try {
        dcqlCredentialSetSchema.parse({
          options: [['credential-1']],
          required: 1,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['required']);
        expect(zodError.issues[0].message).toBe(
          'Expected boolean, received number'
        );
      }
    });

    it('rejects required that is not a boolean (null)', () => {
      try {
        dcqlCredentialSetSchema.parse({
          options: [['credential-1']],
          required: null,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['required']);
        expect(zodError.issues[0].message).toBe(
          'Expected boolean, received null'
        );
      }
    });
  });

  describe('safeParse', () => {
    it('returns success for valid credential sets', () => {
      const result = dcqlCredentialSetSchema.safeParse({
        options: [['credential-1', 'credential-2'], ['credential-3']],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          options: [['credential-1', 'credential-2'], ['credential-3']],
          required: true,
        });
      }
    });

    it('returns success for single credential set', () => {
      const result = dcqlCredentialSetSchema.safeParse({
        options: [['credential-1', 'credential-2', 'credential-3']],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.options).toEqual([
          ['credential-1', 'credential-2', 'credential-3'],
        ]);
        expect(result.data.required).toBe(true);
      }
    });

    it('returns success for credential set with required false', () => {
      const result = dcqlCredentialSetSchema.safeParse({
        options: [['credential-1']],
        required: false,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.required).toBe(false);
      }
    });

    it('returns error for empty options array', () => {
      const result = dcqlCredentialSetSchema.safeParse({
        options: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['options']);
        expect(result.error.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('returns error for missing options', () => {
      const result = dcqlCredentialSetSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['options']);
        expect(result.error.issues[0].message).toBe('Required');
      }
    });

    it('returns error for empty string element', () => {
      const result = dcqlCredentialSetSchema.safeParse({
        options: [['']],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['options', 0, 0]);
        expect(result.error.issues[0].message).toBe(
          'String must contain at least 1 character(s)'
        );
      }
    });

    it('returns error for non-string element', () => {
      const result = dcqlCredentialSetSchema.safeParse({
        options: [[123]],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['options', 0, 0]);
        expect(result.error.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('returns error for empty inner array', () => {
      const result = dcqlCredentialSetSchema.safeParse({
        options: [[]],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['options', 0]);
        expect(result.error.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('returns error for non-object input', () => {
      const result = dcqlCredentialSetSchema.safeParse('not-an-object');
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
