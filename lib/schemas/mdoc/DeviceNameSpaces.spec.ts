import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { deviceNameSpacesSchema } from './DeviceNameSpaces';

describe('DeviceNameSpaces', () => {
  it('should accept valid device name spaces records', () => {
    const validRecords = [
      {
        'com.example.namespace': {
          item1: new Tag(24, 0),
          item2: new Tag(24, 123),
        },
        'test.namespace': {
          item3: new Tag(24, 456),
        },
      },
    ];

    validRecords.forEach((record) => {
      expect(() => deviceNameSpacesSchema.parse(record)).not.toThrow();
      const result = deviceNameSpacesSchema.parse(record);
      expect(result).toEqual(record);
    });
  });

  it('should not throw error for empty record', () => {
    const emptyRecord = {};
    expect(() => deviceNameSpacesSchema.parse(emptyRecord)).not.toThrow();
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
        'invalid-namespace': {},
      },
      {
        'org.iso.18013.5.1': null,
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => deviceNameSpacesSchema.parse(input)).toThrow();
    });
  });
});
