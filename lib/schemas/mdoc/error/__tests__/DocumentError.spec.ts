import { describe, expect, it } from 'vitest';
import { documentErrorSchema } from '../DocumentError';

describe('DocumentError', () => {
  it('should accept valid document errors', () => {
    const validErrors = [
      {
        'org.iso.18013.5.1.mDL': 0,
      },
      {
        'com.example.document': 1,
        'test.document': -1,
      },
    ];

    validErrors.forEach((errors) => {
      const result = documentErrorSchema.parse(errors);
      expect(result).toEqual(errors);
    });
  });

  it('should throw error for empty record', () => {
    const emptyRecord = {};
    expect(() => documentErrorSchema.parse(emptyRecord)).toThrow();
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [],
      {
        'org.iso.18013.5.1.mDL': null,
      },
      {
        'org.iso.18013.5.1.mDL': 1.5,
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => documentErrorSchema.parse(input)).toThrow();
    });
  });
});
