import { describe, expect, it } from 'vitest';
import { errorItemsSchema } from './ErrorItems';

describe('ErrorItems', () => {
  it('should accept valid error items', () => {
    const validItems = [
      {
        given_name: 0,
      },
      {
        age: 1,
        height: -1,
      },
    ];

    validItems.forEach((items) => {
      expect(() => errorItemsSchema.parse(items)).not.toThrow();
      const result = errorItemsSchema.parse(items);
      expect(result).toEqual(items);
    });
  });

  it('should throw error for empty record', () => {
    const emptyRecord = {};
    expect(() => errorItemsSchema.parse(emptyRecord)).toThrow();
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
        valid_identifier: null,
      },
      {
        valid_identifier: 1.5,
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => errorItemsSchema.parse(input)).toThrow();
    });
  });
});
