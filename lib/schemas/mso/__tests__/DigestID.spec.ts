import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { digestIDSchema } from '../DigestID';

describe('DigestID', () => {
  describe('valid inputs', () => {
    it('should accept positive integer number', () => {
      const input = 42;
      const result = digestIDSchema.parse(input);
      expect(typeof result).toBe('number');
      expect(result).toBe(42);
    });

    it('should accept digit-only string and normalize to number', () => {
      const input = '123';
      const result = digestIDSchema.parse(input);
      expect(typeof result).toBe('number');
      expect(result).toBe(123);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const unionMessage =
      'DigestID: Please provide a positive integer (as number or string of digits)';
    const testCases: Array<{ name: string; input: unknown; expected: string }> =
      [
        { name: 'boolean', input: true, expected: unionMessage },
        { name: 'null', input: null, expected: unionMessage },
        { name: 'undefined', input: undefined, expected: unionMessage },
        { name: 'object', input: { a: 1 }, expected: unionMessage },
        { name: 'array', input: [1, 2], expected: unionMessage },
      ];

    testCases.forEach(({ name, input, expected }) => {
      it(`should throw error for ${name}`, () => {
        try {
          digestIDSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('number branch validations', () => {
    it('should throw for zero (not positive)', () => {
      try {
        digestIDSchema.parse(0);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'DigestID: Please provide a positive integer greater than 0'
        );
      }
    });

    it('should throw for negative number', () => {
      try {
        digestIDSchema.parse(-5);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'DigestID: Please provide a positive integer greater than 0'
        );
      }
    });

    it('should throw for non-integer number', () => {
      try {
        digestIDSchema.parse(1.5);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'DigestID: Please provide an integer (no decimal places)'
        );
      }
    });
  });

  describe('string branch validations', () => {
    const unionMessage =
      'DigestID: Please provide a positive integer (as number or string of digits)';

    it('should throw for non-digit string', () => {
      try {
        digestIDSchema.parse('12a');
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(unionMessage);
      }
    });

    it('should throw for negative string', () => {
      try {
        digestIDSchema.parse('-1');
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(unionMessage);
      }
    });

    it('should throw for zero string after normalization', () => {
      try {
        digestIDSchema.parse('0');
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'DigestID: Please provide a positive integer greater than 0'
        );
      }
    });
  });
});
