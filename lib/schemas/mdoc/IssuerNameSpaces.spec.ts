import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { issuerNameSpacesSchema } from './IssuerNameSpaces';

describe('IssuerNameSpaces', () => {
  it('should accept valid issuer name spaces records', () => {
    const validRecords = [
      {
        'org.iso.18013.5.1': [new Tag(24, 0)],
      },
      {
        'com.example.namespace': [new Tag(24, 123), new Tag(24, 456)],
        'test.namespace': [new Tag(24, 789)],
      },
    ];

    validRecords.forEach((record) => {
      expect(() => issuerNameSpacesSchema.parse(record)).not.toThrow();
      const result = issuerNameSpacesSchema.parse(record);
      expect(result).toEqual(record);
    });
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [],
      {},
      {
        'org.iso.18013.5.1': [],
      },
      {
        'org.iso.18013.5.1': null,
      },
      {
        'org.iso.18013.5.1': undefined,
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => issuerNameSpacesSchema.parse(input)).toThrow();
    });
  });
});
