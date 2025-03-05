import { COSEKey } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { deviceKeyInfoSchema } from './DeviceKeyInfo';

describe('DeviceKeyInfo', () => {
  it('should accept valid device key info with required fields', () => {
    const validKeyInfo = {
      deviceKey: new COSEKey([]),
    };

    expect(() => deviceKeyInfoSchema.parse(validKeyInfo)).not.toThrow();
    const result = deviceKeyInfoSchema.parse(validKeyInfo);
    expect(result).toEqual(validKeyInfo);
  });

  it('should accept valid device key info with all fields', () => {
    const validKeyInfo = {
      deviceKey: new COSEKey([]),
      keyAuthorizations: {},
      keyInfo: {},
    };

    expect(() => deviceKeyInfoSchema.parse(validKeyInfo)).not.toThrow();
    const result = deviceKeyInfoSchema.parse(validKeyInfo);
    expect(result).toEqual(validKeyInfo);
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [1, 2, 3],
      {},
      {
        keyAuthorizations: {},
        keyInfo: {},
      },
      {
        deviceKey: {},
        keyAuthorizations: {},
        keyInfo: {},
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => deviceKeyInfoSchema.parse(input)).toThrow();
    });
  });
});
