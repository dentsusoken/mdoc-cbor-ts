import { describe, expect, it } from 'vitest';
import { ByteString } from '../../cbor';
import { deviceNameSpacesBytesSchema } from './DeviceNameSpacesBytes';

describe('DeviceNameSpacesBytes', () => {
  it('should accept valid CBOR tags', () => {
    const validTags = [
      new ByteString({}),
      new ByteString({
        'org.iso.18013.5.1': [{ given_name: 'John' }],
      }),
    ];

    validTags.forEach((tag) => {
      expect(() => deviceNameSpacesBytesSchema.parse(tag)).not.toThrow();
      const result = deviceNameSpacesBytesSchema.parse(tag);
      expect(result).toBeInstanceOf(ByteString);
      expect(result.data).toEqual(tag.data);
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
