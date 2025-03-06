import { describe, expect, it } from 'vitest';
import { mdlSchema } from './mdlSchema';

describe('mdlSchema', () => {
  it('should validate valid MDL data', () => {
    const validData = {
      document_number: '123456789',
      given_name: 'John Doe',
    };

    const result = mdlSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('should reject invalid document_number', () => {
    const invalidData = {
      document_number: 123, // number instead of string
      given_name: 'John Doe',
    };

    const result = mdlSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid given_name', () => {
    const invalidData = {
      document_number: '123456789',
      given_name: 123, // number instead of string
    };

    const result = mdlSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const invalidData = {
      document_number: '123456789',
      // missing given_name
    };

    const result = mdlSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject additional fields', () => {
    const invalidData = {
      document_number: '123456789',
      given_name: 'John Doe',
      additional_field: 'value',
    };

    const result = mdlSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
