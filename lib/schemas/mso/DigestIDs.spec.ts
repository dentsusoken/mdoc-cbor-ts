import { describe, expect, it } from 'vitest';
import { digestIDsSchema } from './DigestIDs';

describe('DigestIDs', () => {
  it('should accept valid digest IDs record', () => {
    const validDigestIDs = new Map([
      [1, Buffer.from([1, 2, 3])],
      [2, Buffer.from([4, 5, 6])],
      [3, Buffer.from([7, 8, 9])],
    ]);

    expect(() => digestIDsSchema.parse(validDigestIDs)).not.toThrow();
    const result = digestIDsSchema.parse(validDigestIDs);
    expect(result).toEqual(
      Object.fromEntries(
        Array.from(validDigestIDs.entries()).map(([key, value]) => [
          key.toString(),
          value,
        ])
      )
    );
  });

  it('should throw error for empty record', () => {
    const emptyDigestIDs = new Map();
    expect(() => digestIDsSchema.parse(emptyDigestIDs)).toThrow();
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [1, 2, 3],
      new Map([['invalid-key', Buffer.from([1, 2, 3])]]),
      new Map([[1, 'not-buffer']]),
      new Map([[-1, Buffer.from([1, 2, 3])]]),
    ];

    invalidInputs.forEach((input) => {
      expect(() => digestIDsSchema.parse(input)).toThrow();
    });
  });
});
