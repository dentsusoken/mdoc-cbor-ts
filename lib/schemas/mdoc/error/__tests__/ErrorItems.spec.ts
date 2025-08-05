import { describe, expect, it } from 'vitest';
import { errorItemsSchema } from '../ErrorItems';
import { z } from 'zod';

describe('ErrorItems', () => {
  it('should accept valid error items', () => {
    const validItems = [
      {
        given_name: 0,
      },
      {
        age: 1,
        height: -1,
      },
    ];

    validItems.forEach((items) => {
      expect(() => errorItemsSchema.parse(items)).not.toThrow();
      const result = errorItemsSchema.parse(items);
      expect(result).toEqual(items);
    });
  });

  it('should throw error for empty record', () => {
    try {
      errorItemsSchema.parse({});
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'ErrorItems: At least one data element identifier and error code pair is required.'
      );
    }
  });

  it('should throw invalid_type error for non-object inputs', () => {
    const invalidInputs = [null, true, 123, 'string', []];

    for (const input of invalidInputs) {
      try {
        errorItemsSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'ErrorItems: Expected an object with data element identifiers as keys and error codes as values.'
        );
      }
    }
  });

  it('should throw error for undefined input', () => {
    try {
      errorItemsSchema.parse(undefined);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'ErrorItems: This field is required. Please provide a valid error items object.'
      );
    }
  });

  it('should throw error for object with null error code value', () => {
    try {
      errorItemsSchema.parse({
        valid_identifier: null,
      });
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'ErrorCode: Expected a number, but received a different type. Please provide a valid integer.'
      );
    }
  });

  it('should throw error for object with decimal error code value', () => {
    try {
      errorItemsSchema.parse({
        valid_identifier: 1.5,
      });
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'ErrorCode: Please provide an integer (no decimal places).'
      );
    }
  });
});
