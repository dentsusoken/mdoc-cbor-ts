import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  dataElementsArraySchema,
  DATA_ELEMENTS_ARRAY_INVALID_TYPE_MESSAGE,
  DATA_ELEMENTS_ARRAY_REQUIRED_MESSAGE,
  DATA_ELEMENTS_ARRAY_NON_EMPTY_MESSAGE,
} from '../DataElementsArray';

describe('DataElementsArray', () => {
  it('should accept a non-empty array of identifiers', () => {
    const input = ['given_name', 'family_name'];
    const result = dataElementsArraySchema.parse(input);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(input);
  });

  it('should throw for empty array with specific message', () => {
    try {
      dataElementsArraySchema.parse([]);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        DATA_ELEMENTS_ARRAY_NON_EMPTY_MESSAGE
      );
    }
  });

  it('should throw for invalid input types', () => {
    const cases: unknown[] = ['not-array', 123, true, null, undefined, {}];

    cases.forEach((input) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dataElementsArraySchema.parse(input as any);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        const expected =
          input === undefined
            ? DATA_ELEMENTS_ARRAY_REQUIRED_MESSAGE
            : DATA_ELEMENTS_ARRAY_INVALID_TYPE_MESSAGE;
        expect(zodError.issues[0].message).toBe(expected);
      }
    });
  });

  it('should propagate identifier validation errors', () => {
    try {
      dataElementsArraySchema.parse(['valid', '']);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      // The message comes from DataElementIdentifier
      expect(zodError.issues[0].message).toMatch('DataElementIdentifier:');
    }
  });
});
