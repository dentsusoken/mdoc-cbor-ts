import { describe, expect, it } from 'vitest';
import { authorizedDataElementsSchema } from './AuthorizedDataElements';

describe('AuthorizedDataElements', () => {
  it('should accept valid authorized data elements record', () => {
    const validRecords = [
      new Map([['org.iso.18013.5.1', ['given_name', 'family_name']]]),
      new Map([
        ['com.example.namespace', ['id', 'type']],
        ['test.namespace', ['value']],
      ]),
    ];

    validRecords.forEach((record) => {
      expect(() => authorizedDataElementsSchema.parse(record)).not.toThrow();
      const result = authorizedDataElementsSchema.parse(record);
      expect(result).toEqual(Object.fromEntries(record));
    });
  });

  it('should throw error for empty record', () => {
    const emptyRecord = new Map();
    expect(() => authorizedDataElementsSchema.parse(emptyRecord)).toThrow();
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [],
      new Map([['org.iso.18013.5.1', []]]),
      new Map([['org.iso.18013.5.1', [123]]]),
      new Map([['org.iso.18013.5.1', [true]]]),
      new Map([['org.iso.18013.5.1', [{ key: 'value' }]]]),
    ];

    invalidInputs.forEach((input) => {
      expect(() => authorizedDataElementsSchema.parse(input)).toThrow();
    });
  });
});
