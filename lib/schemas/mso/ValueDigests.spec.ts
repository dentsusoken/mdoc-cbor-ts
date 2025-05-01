import { describe, expect, it } from 'vitest';
import { valueDigestsSchema } from './ValueDigests';

describe('ValueDigests', () => {
  it('should accept valid value digests record', () => {
    const validRecords = [
      new Map<string, Map<string, Buffer>>([
        [
          'org.iso.18013.5.1',
          new Map<string, Buffer>([
            ['1', Buffer.from([1, 2, 3])],
            ['2', Buffer.from([4, 5, 6])],
          ]),
        ],
      ]),
      new Map<string, Map<string, Buffer>>([
        [
          'com.example.namespace',
          new Map<string, Buffer>([['1', Buffer.from([1, 2, 3])]]),
        ],
        [
          'test.namespace',
          new Map<string, Buffer>([['2', Buffer.from([4, 5, 6])]]),
        ],
      ]),
    ];

    validRecords.forEach((record) => {
      expect(() => valueDigestsSchema.parse(record)).not.toThrow();
      const result = valueDigestsSchema.parse(record);

      // 期待結果を構築
      const expected: Record<string, Record<string, Buffer>> = {};
      for (const [nsKey, nsMap] of record.entries()) {
        expected[nsKey] = {};
        for (const [digestKey, buffer] of nsMap.entries()) {
          expected[nsKey][digestKey] = buffer;
        }
      }

      expect(result).toEqual(expected);
    });
  });

  it('should throw error for empty record', () => {
    const emptyRecord = new Map();
    expect(() => valueDigestsSchema.parse(emptyRecord)).toThrow();
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [],
      new Map([
        [
          'org.iso.18013.5.1',
          new Map([['invalid-key', Buffer.from([1, 2, 3])]]),
        ],
      ]),
      new Map([['org.iso.18013.5.1', new Map([['1', 'not-buffer']])]]),
      new Map([
        ['org.iso.18013.5.1', new Map([['-1', Buffer.from([1, 2, 3])]])],
      ]),
    ];

    invalidInputs.forEach((input) => {
      expect(() => valueDigestsSchema.parse(input)).toThrow();
    });
  });
});
