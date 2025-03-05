import { describe, expect, it } from 'vitest';
import { valueDigestsSchema } from './ValueDigests';

describe('ValueDigests', () => {
  it('should accept valid value digests record', () => {
    const validRecords = [
      {
        'org.iso.18013.5.1': {
          1: Buffer.from([1, 2, 3]),
          2: Buffer.from([4, 5, 6]),
        },
      },
      {
        'com.example.namespace': {
          1: Buffer.from([1, 2, 3]),
        },
        'test.namespace': {
          2: Buffer.from([4, 5, 6]),
        },
      },
    ];

    validRecords.forEach((record) => {
      expect(() => valueDigestsSchema.parse(record)).not.toThrow();
      const result = valueDigestsSchema.parse(record);
      expect(result).toEqual(record);
    });
  });

  it('should throw error for empty record', () => {
    const emptyRecord = {};
    expect(() => valueDigestsSchema.parse(emptyRecord)).toThrow();
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
        'org.iso.18013.5.1': {
          'invalid-key': Buffer.from([1, 2, 3]),
        },
      },
      {
        'org.iso.18013.5.1': {
          1: 'not-buffer',
        },
      },
      {
        'org.iso.18013.5.1': {
          '-1': Buffer.from([1, 2, 3]),
        },
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => valueDigestsSchema.parse(input)).toThrow();
    });
  });
});
