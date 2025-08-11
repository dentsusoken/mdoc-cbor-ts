import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { statusSchema } from '../Status';

describe('Status', () => {
  it('should accept valid status codes', () => {
    const validStatusCodes = [0, 10, 11, 12];

    validStatusCodes.forEach((code) => {
      expect(statusSchema.parse(code)).toBe(code);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const typeErrorMessage =
      'Status: Expected a status code number (0, 10, 11, 12).';
    const testCases: Array<{
      name: string;
      input: unknown;
      expected: string;
    }> = [
      { name: 'string "0"', input: '0', expected: typeErrorMessage },
      { name: 'string "10"', input: '10', expected: typeErrorMessage },
      { name: 'string "11"', input: '11', expected: typeErrorMessage },
      { name: 'string "12"', input: '12', expected: typeErrorMessage },
      { name: 'boolean true', input: true, expected: typeErrorMessage },
      { name: 'null', input: null, expected: typeErrorMessage },
    ];

    testCases.forEach(({ name, input, expected }) => {
      it(`should throw error for ${name}`, () => {
        try {
          statusSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  it('should throw error for undefined (required)', () => {
    try {
      statusSchema.parse(undefined);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'Status: This field is required. Please provide a status code.'
      );
    }
  });

  describe('should throw error for invalid numeric values', () => {
    const valueErrorMessage =
      'Status: Invalid status code. Allowed values are 0, 10, 11, 12.';
    const invalidNumbers = [-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 100];

    invalidNumbers.forEach((num) => {
      it(`should throw error for value ${num}`, () => {
        try {
          statusSchema.parse(num);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(valueErrorMessage);
        }
      });
    });
  });
});
