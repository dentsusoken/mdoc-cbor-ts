import { COSEKey } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { deviceKeyInfoSchema } from './DeviceKeyInfo';

describe('DeviceKeyInfo', () => {
  it('should accept valid device key info with required fields', () => {
    const validKeyInfo = new Map([['deviceKey', new Map<number, any>()]]);

    expect(() => deviceKeyInfoSchema.parse(validKeyInfo)).not.toThrow();
    const result = deviceKeyInfoSchema.parse(validKeyInfo);
    expect(result).toEqual({
      deviceKey: new COSEKey([]),
    });
  });

  it('should accept valid device key info with all fields', () => {
    const validKeyInfo = new Map([
      ['deviceKey', new Map<number, any>()],
      ['keyAuthorizations', new Map()],
      ['keyInfo', new Map()],
    ]);

    expect(() => deviceKeyInfoSchema.parse(validKeyInfo)).not.toThrow();
    const result = deviceKeyInfoSchema.parse(validKeyInfo);
    expect(result).toEqual({
      deviceKey: new COSEKey([]),
      keyAuthorizations: {},
      keyInfo: {},
    });
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
      new Map([
        ['keyAuthorizations', new Map()],
        ['keyInfo', new Map()],
      ]),
      new Map<string, any>([
        ['deviceKey', {}],
        ['keyAuthorizations', new Map()],
        ['keyInfo', new Map()],
      ]),
    ];

    invalidInputs.forEach((input) => {
      expect(() => deviceKeyInfoSchema.parse(input)).toThrow();
    });
  });
});
