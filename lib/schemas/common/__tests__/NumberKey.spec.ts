import { describe, expect, it } from 'vitest';
import { numberKeySchema } from '../NumberKey';
import { z } from 'zod';

describe('NumberKey', () => {
  it('should accept valid number inputs', () => {
    const validNumbers = [1, 123, 999, 1000];

    validNumbers.forEach((number) => {
      expect(numberKeySchema.parse(number)).toBe(number);
    });
  });

  it('should accept valid string inputs and transform to number', () => {
    const validStrings = ['1', '123', '999', '1000'];

    validStrings.forEach((string) => {
      const result = numberKeySchema.parse(string);
      expect(typeof result).toBe('number');
      expect(result).toBe(Number(string));
    });
  });

  it('should throw invalid_union error for non-number/non-string inputs', () => {
    const invalidInputs = [true, { key: 'value' }, [1, 2, 3], null, undefined];
    for (const input of invalidInputs) {
      try {
        numberKeySchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'NumberKey: Please provide a positive integer (as number or string)'
        );
      }
    }
  });

  it('should throw error for boolean inputs', () => {
    try {
      numberKeySchema.parse(true);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NumberKey: Please provide a positive integer (as number or string)'
      );
    }
  });

  it('should throw error for null input', () => {
    try {
      numberKeySchema.parse(null);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NumberKey: Please provide a positive integer (as number or string)'
      );
    }
  });

  it('should throw error for undefined input', () => {
    try {
      numberKeySchema.parse(undefined);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NumberKey: Please provide a positive integer (as number or string)'
      );
    }
  });

  it('should throw error for object inputs', () => {
    try {
      numberKeySchema.parse({ key: 'value' });
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NumberKey: Please provide a positive integer (as number or string)'
      );
    }
  });

  it('should throw error for array inputs', () => {
    try {
      numberKeySchema.parse([1, 2, 3]);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NumberKey: Please provide a positive integer (as number or string)'
      );
    }
  });

  it('should throw error for decimal numbers', () => {
    try {
      numberKeySchema.parse(1.5);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NumberKey: Please provide an integer (no decimal places)'
      );
    }
  });

  it('should throw error for negative numbers', () => {
    const negativeNumbers = [-1, -123, -999];

    for (const number of negativeNumbers) {
      try {
        numberKeySchema.parse(number);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'NumberKey: Please provide a positive integer greater than 0'
        );
      }
    }
  });

  it('should throw error for zero', () => {
    try {
      numberKeySchema.parse(0);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NumberKey: Please provide a positive integer greater than 0'
      );
    }
  });

  it('should throw error for non-digit strings', () => {
    const invalidStrings = ['abc', '123abc', 'abc123', '12.34', '12,34'];

    for (const string of invalidStrings) {
      try {
        numberKeySchema.parse(string);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'NumberKey: Please provide a string containing only digits (e.g., "123")'
        );
      }
    }
  });

  it('should throw error for zero as string', () => {
    try {
      numberKeySchema.parse('0');
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NumberKey: Please provide a positive integer greater than 0'
      );
    }
  });

  it('should throw error for negative numbers as strings', () => {
    const negativeStrings = ['-1', '-123', '-999'];

    for (const string of negativeStrings) {
      try {
        numberKeySchema.parse(string);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'NumberKey: Please provide a string containing only digits (e.g., "123")'
        );
      }
    }
  });

  it('should handle large numbers correctly', () => {
    const largeNumbers = [999999, 1000000, 2147483647];

    largeNumbers.forEach((number) => {
      expect(numberKeySchema.parse(number)).toBe(number);
    });
  });

  it('should handle large numbers as strings correctly', () => {
    const largeStrings = ['999999', '1000000', '2147483647'];

    largeStrings.forEach((string) => {
      const result = numberKeySchema.parse(string);
      expect(typeof result).toBe('number');
      expect(result).toBe(Number(string));
    });
  });
});
