import { describe, expect, it } from 'vitest';
import { keyInfoSchema } from './KeyInfo';

describe('KeyInfo', () => {
  it('should accept valid key info record', () => {
    const validRecords = [
      new Map<number, any>([
        [1, 'value1'],
        [-1, 123],
      ]),
      new Map<number, any>([
        [1, true],
        [-2, null],
        [0, undefined],
      ]),
      new Map<number, any>([
        [1, { nested: 'value' }],
        [-2, [1, 2, 3]],
      ]),
    ];

    validRecords.forEach((record) => {
      expect(() => keyInfoSchema.parse(record)).not.toThrow();
      const result = keyInfoSchema.parse(record);
      expect(result).toEqual(
        Object.fromEntries(
          Array.from(record.entries()).map(([key, value]) => [
            key.toString(),
            value,
          ])
        )
      );
    });
  });

  it('should accept empty record', () => {
    const emptyRecord = new Map<number, any>();
    expect(() => keyInfoSchema.parse(emptyRecord)).not.toThrow();
    expect(keyInfoSchema.parse(emptyRecord)).toEqual({});
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [],
      new Map<string, any>([['key1', 'value1']]),
      new Map<any, any>([['1.5', 'value']]),
    ];

    invalidInputs.forEach((input) => {
      expect(() => keyInfoSchema.parse(input)).toThrow();
    });
  });
});
