import { describe, expect, it } from 'vitest';
import { digestIDSchema } from './DigestID';

describe('DigestID', () => {
  it('should accept valid numeric digest IDs', () => {
    const validNumericIds = [1, 2, 3, 100, 1000];

    validNumericIds.forEach((id) => {
      expect(() => digestIDSchema.parse(id)).not.toThrow();
      expect(digestIDSchema.parse(id)).toBe(id);
    });
  });

  it('should accept valid string digest IDs', () => {
    const validStringIds = ['1', '2', '3', '100', '1000'];

    validStringIds.forEach((id) => {
      expect(() => digestIDSchema.parse(id)).not.toThrow();
      expect(digestIDSchema.parse(id)).toBe(Number(id));
    });
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      -1,
      0,
      1.5,
      '1.5',
      'abc',
      true,
      null,
      undefined,
      { key: 'value' },
      [1, 2, 3],
    ];

    invalidInputs.forEach((input) => {
      expect(() => digestIDSchema.parse(input)).toThrow();
    });
  });
});
