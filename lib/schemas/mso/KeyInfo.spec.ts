import { describe, expect, it } from 'vitest';
import { keyInfoSchema } from './KeyInfo';

describe('KeyInfo', () => {
  it('should accept valid key info record', () => {
    const validRecords = [
      {
        1: 'value1',
        '-1': 123,
      },
      {
        '1': true,
        '-2': null,
        '0': undefined,
      },
      {
        1: { nested: 'value' },
        '-2': [1, 2, 3],
      },
    ];

    validRecords.forEach((record) => {
      expect(() => keyInfoSchema.parse(record)).not.toThrow();
      const result = keyInfoSchema.parse(record);
      expect(result).toEqual(record);
    });
  });

  it('should accept empty record', () => {
    const emptyRecord = {};
    expect(() => keyInfoSchema.parse(emptyRecord)).not.toThrow();
    expect(keyInfoSchema.parse(emptyRecord)).toEqual(emptyRecord);
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
        key1: 'value1',
      },
      {
        '1.5': 'value',
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => keyInfoSchema.parse(input)).toThrow();
    });
  });
});
