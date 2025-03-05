import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { issuerSignedItemBytesSchema } from './IssuerSignedItemBytes';

describe('IssuerSignedItemBytes', () => {
  it('should accept valid CBOR tag', () => {
    const validTags = [
      new Tag(Buffer.from([]), 24),
      new Tag(Buffer.from([]), 24),
      new Tag(Buffer.from([]), 24),
    ];

    validTags.forEach((tag) => {
      expect(() => issuerSignedItemBytesSchema.parse(tag)).not.toThrow();
      const result = issuerSignedItemBytesSchema.parse(tag);
      expect(result).toBeInstanceOf(Tag);
      expect(result.tag).toBe(24);
      expect(result.value).toEqual(tag.value);
    });
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      Buffer.from([]),
      { tag: 24, value: 0 },
    ];

    invalidInputs.forEach((input) => {
      expect(() => issuerSignedItemBytesSchema.parse(input)).toThrow();
    });
  });
});
