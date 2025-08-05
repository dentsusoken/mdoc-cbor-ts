import { describe, expect, it } from 'vitest';
import { docTypeSchema } from '../DocType';
import { z } from 'zod';

describe('DocType', () => {
  it('should accept valid document type strings', () => {
    const validDocTypes = [
      'org.iso.18013.5.1.mDL',
      'com.example.document',
      'test.document',
      'a.b.c.document',
    ];

    validDocTypes.forEach((docType) => {
      expect(docTypeSchema.parse(docType)).toBe(docType);
    });
  });

  it('should throw invalid_type error for non-string inputs', () => {
    const invalidTypeInputs = [123, true, { key: 'value' }, [1, 2, 3]];
    for (const input of invalidTypeInputs) {
      try {
        docTypeSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'DocType: Expected a string, but received a different type. Please provide a string identifier.'
        );
      }
    }
  });

  it('should throw invalid_type error for null input', () => {
    try {
      docTypeSchema.parse(null);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'DocType: Expected a string, but received a different type. Please provide a string identifier.'
      );
    }
  });

  it('should throw invalid_type error for undefined input', () => {
    try {
      docTypeSchema.parse(undefined);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'DocType: This field is required. Please provide a string identifier.'
      );
    }
  });

  it('should throw too_small error for empty string', () => {
    try {
      docTypeSchema.parse('');
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'DocType: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1.mDL")'
      );
    }
  });

  it('should throw custom error for whitespace-only string', () => {
    try {
      docTypeSchema.parse('   ');
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'DocType: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1.mDL")'
      );
    }
  });
});
