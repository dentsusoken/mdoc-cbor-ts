import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { deviceNameSpacesBytesSchema } from './DeviceNameSpacesBytes';

describe('DeviceNameSpacesBytes', () => {
  it('should accept valid CBOR tags', () => {
    const validTags = [new Tag(24, 0), new Tag(24, 123), new Tag(24, 456)];

    validTags.forEach((tag) => {
      expect(() => deviceNameSpacesBytesSchema.parse(tag)).not.toThrow();
      const result = deviceNameSpacesBytesSchema.parse(tag);
      expect(result).toBeInstanceOf(Tag);
      expect(result).toEqual(tag);
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
      { tag: 24, value: 0 },
    ];

    invalidInputs.forEach((input) => {
      expect(() => deviceNameSpacesBytesSchema.parse(input)).toThrow();
    });
  });
});
