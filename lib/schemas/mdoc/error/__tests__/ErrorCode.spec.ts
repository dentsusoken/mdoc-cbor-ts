import { describe, expect, it } from 'vitest';
import { errorCodeSchema } from '../ErrorCode';
import { z } from 'zod';

describe('ErrorCode', () => {
  it('should accept valid error codes', () => {
    const validCodes = [0, 1, 2, 100, -1, -2, -100];

    validCodes.forEach((code) => {
      const result = errorCodeSchema.parse(code);
      expect(result).toBe(code);
    });
  });

  it('should throw invalid_type error for non-number inputs', () => {
    const invalidInputs = [true, 'string', [], {}, null];

    for (const input of invalidInputs) {
      try {
        errorCodeSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.'
        );
      }
    }
  });

  it('should throw error for decimal numbers', () => {
    try {
      errorCodeSchema.parse(1.5);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'ErrorCode: Please provide an integer (no decimal places).'
      );
    }
  });

  it('should throw error for undefined input', () => {
    try {
      errorCodeSchema.parse(undefined);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'ErrorCode: This field is required. Please provide a valid integer.'
      );
    }
  });

  it('should throw error for boolean inputs', () => {
    try {
      errorCodeSchema.parse(true);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.'
      );
    }
  });

  it('should throw error for string inputs', () => {
    try {
      errorCodeSchema.parse('string');
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.'
      );
    }
  });

  it('should throw error for object inputs', () => {
    try {
      errorCodeSchema.parse({});
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.'
      );
    }
  });

  it('should throw error for array inputs', () => {
    try {
      errorCodeSchema.parse([]);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.'
      );
    }
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [null, undefined, true, 'string', [], {}, 1.5];

    invalidInputs.forEach((input) => {
      expect(() => errorCodeSchema.parse(input)).toThrow();
    });
  });
});
