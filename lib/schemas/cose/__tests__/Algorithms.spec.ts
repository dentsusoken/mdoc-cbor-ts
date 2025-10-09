import { describe, expect, it } from 'vitest';
import { Algorithms } from '../../../cose/types';
import { createAlgorithmsSchema } from '../Algorithms';

describe('createAlgorithmsSchema', () => {
  const target = 'TestAlgorithms';
  const algorithmsSchema = createAlgorithmsSchema(target);

  describe('should accept valid algorithm values', () => {
    it('should accept EdDSA (-8)', () => {
      const result = algorithmsSchema.parse(-8);
      expect(result).toBe(-8);
      expect(result).toBe(Algorithms.EdDSA);
    });

    it('should accept ES256 (-7)', () => {
      const result = algorithmsSchema.parse(-7);
      expect(result).toBe(-7);
      expect(result).toBe(Algorithms.ES256);
    });

    it('should accept ES384 (-35)', () => {
      const result = algorithmsSchema.parse(-35);
      expect(result).toBe(-35);
      expect(result).toBe(Algorithms.ES384);
    });

    it('should accept ES512 (-36)', () => {
      const result = algorithmsSchema.parse(-36);
      expect(result).toBe(-36);
      expect(result).toBe(Algorithms.ES512);
    });

    it('should accept Algorithms enum values', () => {
      expect(algorithmsSchema.parse(Algorithms.EdDSA)).toBe(-8);
      expect(algorithmsSchema.parse(Algorithms.ES256)).toBe(-7);
      expect(algorithmsSchema.parse(Algorithms.ES384)).toBe(-35);
      expect(algorithmsSchema.parse(Algorithms.ES512)).toBe(-36);
    });
  });

  describe('should reject invalid values', () => {
    it('should reject invalid numbers', () => {
      const invalidValues = [0, 1, -1, -9, -6, 100, 999, -100];

      invalidValues.forEach((value) => {
        expect(() => algorithmsSchema.parse(value)).toThrow();
      });
    });

    it('should reject string values', () => {
      const invalidStrings = ['EdDSA', 'ES256', '-7', '-8'];

      invalidStrings.forEach((value) => {
        expect(() => algorithmsSchema.parse(value)).toThrow();
      });
    });

    it('should reject null and undefined', () => {
      expect(() => algorithmsSchema.parse(null)).toThrow();
      expect(() => algorithmsSchema.parse(undefined)).toThrow();
    });

    it('should reject objects and arrays', () => {
      expect(() => algorithmsSchema.parse({})).toThrow();
      expect(() => algorithmsSchema.parse([])).toThrow();
      expect(() => algorithmsSchema.parse({ alg: -7 })).toThrow();
    });

    it('should provide custom error message with target prefix', () => {
      try {
        algorithmsSchema.parse(999);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain(`${target}:`);
        expect(errorMessage).toContain(
          'Invalid algorithm. Must be one of: EdDSA (-8), ES256 (-7), ES384 (-35), ES512 (-36)'
        );
      }
    });
  });

  describe('safeParse behavior', () => {
    it('should return success for valid values', () => {
      const result = algorithmsSchema.safeParse(-7);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(-7);
      }
    });

    it('should return error for invalid values', () => {
      const result = algorithmsSchema.safeParse(999);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(`${target}:`);
        expect(result.error.issues[0].message).toContain('Invalid algorithm');
      }
    });
  });

  describe('target parameter', () => {
    it('should use provided target in error message', () => {
      const customTarget = 'CustomProtectedHeaders';
      const customSchema = createAlgorithmsSchema(customTarget);

      try {
        customSchema.parse(999);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain(`${customTarget}:`);
      }
    });

    it('should work with different target names', () => {
      const schema1 = createAlgorithmsSchema('Target1');
      const schema2 = createAlgorithmsSchema('Target2');

      // Both should validate the same values
      expect(schema1.parse(-7)).toBe(-7);
      expect(schema2.parse(-7)).toBe(-7);

      // But have different error messages
      try {
        schema1.parse(999);
      } catch (error) {
        expect((error as Error).message).toContain('Target1:');
      }

      try {
        schema2.parse(999);
      } catch (error) {
        expect((error as Error).message).toContain('Target2:');
      }
    });
  });
});
