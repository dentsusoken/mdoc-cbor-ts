import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { issuerSignedItemSchema } from './IssuerSignedItem';

describe('IssuerSignedItem', () => {
  it('should accept valid issuer signed items', () => {
    const validItems = [
      {
        digestID: 1,
        random: Buffer.from([]),
        elementIdentifier: 'given_name',
        elementValue: 'John',
      },
      {
        digestID: 2,
        random: Buffer.from([]),
        elementIdentifier: 'age',
        elementValue: 30,
      },
      {
        digestID: 3,
        random: Buffer.from([]),
        elementIdentifier: 'photo',
        elementValue: new Tag(24, 0),
      },
    ];

    validItems.forEach((item) => {
      expect(() => issuerSignedItemSchema.parse(item)).not.toThrow();
      const result = issuerSignedItemSchema.parse(item);
      expect(result).toEqual(item);
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
        digestID: -1,
        random: Buffer.from([]),
        elementIdentifier: 'given_name',
        elementValue: 'John',
      },
      {
        digestID: 1.5,
        random: Buffer.from([]),
        elementIdentifier: 'given_name',
        elementValue: 'John',
      },
      {
        digestID: 1,
        random: null,
        elementIdentifier: 'given_name',
        elementValue: 'John',
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => issuerSignedItemSchema.parse(input)).toThrow();
    });
  });
});
