import { describe, expect, it } from 'vitest';
import { dataElementIdentifierSchema } from '../DataElementIdentifier';
import { z } from 'zod';

describe('DataElementIdentifier', () => {
  it('should accept valid data element identifiers', () => {
    const validIdentifiers = [
      'org.iso.18013.5.1',
      'com.example.identifier',
      'test.identifier',
      'a.b.c.identifier',
    ];

    validIdentifiers.forEach((identifier) => {
      expect(dataElementIdentifierSchema.parse(identifier)).toBe(identifier);
    });
  });

  it('should throw invalid_type error for non-string inputs', () => {
    const invalidTypeInputs = [123, true, { key: 'value' }, [1, 2, 3]];
    for (const input of invalidTypeInputs) {
      try {
        dataElementIdentifierSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'DataElementIdentifier: Expected a string, but received a different type. Please provide a string identifier.'
        );
      }
    }
  });

  it('should throw invalid_type error for null input', () => {
    try {
      dataElementIdentifierSchema.parse(null);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'DataElementIdentifier: Expected a string, but received a different type. Please provide a string identifier.'
      );
    }
  });

  it('should throw invalid_type error for undefined input', () => {
    try {
      dataElementIdentifierSchema.parse(undefined);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'DataElementIdentifier: This field is required. Please provide a string identifier.'
      );
    }
  });

  it('should throw too_small error for empty string', () => {
    try {
      dataElementIdentifierSchema.parse('');
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'DataElementIdentifier: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")'
      );
    }
  });

  it('should throw custom error for whitespace-only string', () => {
    try {
      dataElementIdentifierSchema.parse('   ');
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'DataElementIdentifier: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")'
      );
    }
  });
});
