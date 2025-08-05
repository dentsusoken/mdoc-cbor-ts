import { describe, expect, it } from 'vitest';
import { errorsSchema } from '../Errors';
import { z } from 'zod';

describe('Errors', () => {
  it('should accept valid errors', () => {
    const validErrors = [
      {
        'org.iso.18013.5.1': {
          given_name: 0,
        },
      },
      {
        'com.example.namespace': {
          item1: 1,
          item2: -1,
        },
        'test.namespace': {
          item3: 2,
        },
      },
    ];

    validErrors.forEach((errors) => {
      const result = errorsSchema.parse(errors);
      expect(result).toEqual(errors);
    });
  });

  it('should throw error for empty record', () => {
    try {
      errorsSchema.parse({});
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'Errors: At least one namespace and error items pair is required.'
      );
    }
  });

  it('should throw invalid_type error for non-object inputs', () => {
    const invalidInputs = [null, true, 123, 'string', []];

    for (const input of invalidInputs) {
      try {
        errorsSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Errors: Expected an object with namespaces as keys and error items as values.'
        );
      }
    }
  });

  it('should throw error for undefined input', () => {
    try {
      errorsSchema.parse(undefined);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'Errors: This field is required. Please provide a valid errors object.'
      );
    }
  });

  it('should throw error for object with null error items value', () => {
    try {
      errorsSchema.parse({
        'org.iso.18013.5.1': null,
      });
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'ErrorItems: Expected an object with data element identifiers as keys and error codes as values.'
      );
    }
  });

  it('should throw error for object with null error code value', () => {
    try {
      errorsSchema.parse({
        'org.iso.18013.5.1': {
          valid_identifier: null,
        },
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
      errorsSchema.parse({
        'org.iso.18013.5.1': {
          valid_identifier: 1.5,
        },
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
