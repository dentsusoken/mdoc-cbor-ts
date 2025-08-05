import { describe, expect, it } from 'vitest';
import { nameSpaceSchema } from '../NameSpace';
import { z } from 'zod';

describe('NameSpace', () => {
  it('should accept valid string namespaces', () => {
    const validNamespaces = [
      'org.iso.18013.5.1',
      'com.example.namespace',
      'test.namespace',
      'a.b.c',
    ];

    validNamespaces.forEach((namespace) => {
      expect(nameSpaceSchema.parse(namespace)).toBe(namespace);
    });
  });

  it('should throw invalid_type error for non-string inputs', () => {
    const invalidTypeInputs = [123, true, { key: 'value' }, [1, 2, 3]];
    for (const input of invalidTypeInputs) {
      try {
        nameSpaceSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'NameSpace: Expected a string, but received a different type. Please provide a string identifier.'
        );
      }
    }
  });

  it('should throw invalid_type error for null input', () => {
    try {
      nameSpaceSchema.parse(null);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NameSpace: Expected a string, but received a different type. Please provide a string identifier.'
      );
    }
  });

  it('should throw invalid_type error for undefined input', () => {
    try {
      nameSpaceSchema.parse(undefined);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NameSpace: This field is required. Please provide a string identifier.'
      );
    }
  });

  it('should throw too_small error for empty string', () => {
    try {
      nameSpaceSchema.parse('');
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NameSpace: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")'
      );
    }
  });

  it('should throw custom error for whitespace-only string', () => {
    try {
      nameSpaceSchema.parse('   ');
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'NameSpace: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")'
      );
    }
  });
});
