import { describe, expect, it } from 'vitest';
import { dataElementIdentifierSchema } from '../DataElementIdentifier';

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
      expect(() => dataElementIdentifierSchema.parse(input)).toThrow();
    });
  });
});
