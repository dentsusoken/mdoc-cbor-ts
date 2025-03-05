import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { deviceSignedItemsSchema } from './DeviceSignedItems';

describe('DeviceSignedItems', () => {
  it('should accept valid device signed items', () => {
    const validItems = [
      {
        given_name: 'John',
        family_name: 'Doe',
      },
      {
        age: 30,
        height: 180.5,
      },
      {
        photo: new Tag(24, 0),
        signature: new Tag(24, 123),
      },
    ];

    validItems.forEach((items) => {
      expect(() => deviceSignedItemsSchema.parse(items)).not.toThrow();
      const result = deviceSignedItemsSchema.parse(items);
      expect(result).toEqual(items);
    });
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [null, undefined, true, 123, 'string', []];

    invalidInputs.forEach((input) => {
      expect(() => deviceSignedItemsSchema.parse(input)).toThrow();
    });
  });
});
