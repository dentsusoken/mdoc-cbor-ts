import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { inputDescriptorFormatSchema } from '../InputDescriptorFormat';

describe('inputDescriptorFormatSchema', () => {
  describe('should accept valid format definitions', () => {
    it('accepts format with single algorithm', () => {
      const result = inputDescriptorFormatSchema.parse({
        mso_mdoc: {
          alg: ['ES256'],
        },
      });
      expect(result).toEqual({
        mso_mdoc: {
          alg: ['ES256'],
        },
      });
    });

    it('accepts format with multiple algorithms', () => {
      const result = inputDescriptorFormatSchema.parse({
        mso_mdoc: {
          alg: ['ES256', 'ES384', 'ES512'],
        },
      });
      expect(result).toEqual({
        mso_mdoc: {
          alg: ['ES256', 'ES384', 'ES512'],
        },
      });
    });

    it('accepts format with ES256 only', () => {
      const result = inputDescriptorFormatSchema.parse({
        mso_mdoc: {
          alg: ['ES256'],
        },
      });
      expect(result.mso_mdoc.alg).toEqual(['ES256']);
    });

    it('accepts format with ES384 only', () => {
      const result = inputDescriptorFormatSchema.parse({
        mso_mdoc: {
          alg: ['ES384'],
        },
      });
      expect(result.mso_mdoc.alg).toEqual(['ES384']);
    });

    it('accepts format with ES512 only', () => {
      const result = inputDescriptorFormatSchema.parse({
        mso_mdoc: {
          alg: ['ES512'],
        },
      });
      expect(result.mso_mdoc.alg).toEqual(['ES512']);
    });

    it('accepts format with mixed algorithms', () => {
      const result = inputDescriptorFormatSchema.parse({
        mso_mdoc: {
          alg: ['ES256', 'ES384'],
        },
      });
      expect(result.mso_mdoc.alg).toEqual(['ES256', 'ES384']);
    });
  });

  describe('should reject invalid format definitions', () => {
    it('rejects missing mso_mdoc', () => {
      try {
        inputDescriptorFormatSchema.parse({});
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects mso_mdoc that is not an object (string)', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: 'not-an-object',
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc']);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received string'
        );
      }
    });

    it('rejects mso_mdoc that is not an object (number)', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: 123,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc']);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received number'
        );
      }
    });

    it('rejects mso_mdoc that is not an object (null)', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: null,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc']);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received null'
        );
      }
    });

    it('rejects mso_mdoc that is not an object (boolean)', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: true,
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc']);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received boolean'
        );
      }
    });

    it('rejects mso_mdoc that is not an object (array)', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: [],
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc']);
        expect(zodError.issues[0].message).toBe(
          'Expected object, received array'
        );
      }
    });

    it('rejects mso_mdoc with missing alg', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: {},
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc', 'alg']);
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('rejects mso_mdoc.alg that is not an array (string)', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: {
            alg: 'ES256',
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc', 'alg']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received string'
        );
      }
    });

    it('rejects mso_mdoc.alg that is not an array (number)', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: {
            alg: 123,
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc', 'alg']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received number'
        );
      }
    });

    it('rejects mso_mdoc.alg that is not an array (null)', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: {
            alg: null,
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc', 'alg']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received null'
        );
      }
    });

    it('rejects mso_mdoc.alg that is not an array (boolean)', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: {
            alg: true,
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc', 'alg']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received boolean'
        );
      }
    });

    it('rejects mso_mdoc.alg that is not an array (object)', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: {
            alg: { algorithm: 'ES256' },
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc', 'alg']);
        expect(zodError.issues[0].message).toBe(
          'Expected array, received object'
        );
      }
    });

    it('rejects empty mso_mdoc.alg array', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: {
            alg: [],
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc', 'alg']);
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('rejects mso_mdoc.alg array with non-string element (number)', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: {
            alg: [123],
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc', 'alg', 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('rejects mso_mdoc.alg array with non-string element (null)', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: {
            alg: [null],
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc', 'alg', 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received null'
        );
      }
    });

    it('rejects mso_mdoc.alg array with non-string element (boolean)', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: {
            alg: [true],
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc', 'alg', 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received boolean'
        );
      }
    });

    it('rejects mso_mdoc.alg array with non-string element (object)', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: {
            alg: [{ name: 'ES256' }],
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc', 'alg', 0]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received object'
        );
      }
    });

    it('rejects mso_mdoc.alg array with mixed types', () => {
      try {
        inputDescriptorFormatSchema.parse({
          mso_mdoc: {
            alg: ['ES256', 123],
          },
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['mso_mdoc', 'alg', 1]);
        expect(zodError.issues[0].message).toBe(
          'Expected string, received number'
        );
      }
    });

    it('rejects input that is not an object (string)', () => {
      try {
        inputDescriptorFormatSchema.parse('not-an-object');
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
        inputDescriptorFormatSchema.parse([]);
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
        inputDescriptorFormatSchema.parse(null);
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
    it('returns success for valid format', () => {
      const result = inputDescriptorFormatSchema.safeParse({
        mso_mdoc: {
          alg: ['ES256', 'ES384'],
        },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          mso_mdoc: {
            alg: ['ES256', 'ES384'],
          },
        });
      }
    });

    it('returns error for invalid format', () => {
      const result = inputDescriptorFormatSchema.safeParse({
        mso_mdoc: {
          alg: [],
        },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['mso_mdoc', 'alg']);
        expect(result.error.issues[0].message).toBe(
          'Array must contain at least 1 element(s)'
        );
      }
    });

    it('returns error for missing mso_mdoc', () => {
      const result = inputDescriptorFormatSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['mso_mdoc']);
        expect(result.error.issues[0].message).toBe('Required');
      }
    });

    it('returns error for non-object mso_mdoc', () => {
      const result = inputDescriptorFormatSchema.safeParse({
        mso_mdoc: 'not-an-object',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['mso_mdoc']);
        expect(result.error.issues[0].message).toBe(
          'Expected object, received string'
        );
      }
    });

    it('returns error for missing alg', () => {
      const result = inputDescriptorFormatSchema.safeParse({
        mso_mdoc: {},
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['mso_mdoc', 'alg']);
        expect(result.error.issues[0].message).toBe('Required');
      }
    });
  });
});
