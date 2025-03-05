import { describe, expect, it } from 'vitest';
import { digestSchema } from './Digest';

describe('Digest', () => {
  it('should accept valid digest values', () => {
    const validDigests = [
      Buffer.from([]),
      Buffer.from([1, 2, 3]),
      Buffer.from('test'),
      new Uint8Array([1, 2, 3]),
    ];

    validDigests.forEach((digest) => {
      expect(() => digestSchema.parse(digest)).not.toThrow();
      const result = digestSchema.parse(digest);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result).toEqual(Buffer.from(digest));
    });
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      'not bytes',
      123,
      true,
      null,
      undefined,
      { key: 'value' },
      [1, 2, 3],
    ];

    invalidInputs.forEach((input) => {
      expect(() => digestSchema.parse(input)).toThrow();
    });
  });
});
