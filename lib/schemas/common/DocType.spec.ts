import { describe, expect, it } from 'vitest';
import { docTypeSchema } from './DocType';

describe('DocType', () => {
  it('should accept valid document type strings', () => {
    const validDocTypes = [
      'org.iso.18013.5.1.mDL',
      'com.example.document',
      'test.document',
      'a.b.c.document',
    ];

    validDocTypes.forEach((docType) => {
      expect(() => docTypeSchema.parse(docType)).not.toThrow();
      expect(docTypeSchema.parse(docType)).toBe(docType);
    });
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      123,
      true,
      null,
      undefined,
      { key: 'value' },
      [1, 2, 3],
    ];

    invalidInputs.forEach((input) => {
      expect(() => docTypeSchema.parse(input)).toThrow();
    });
  });
});
