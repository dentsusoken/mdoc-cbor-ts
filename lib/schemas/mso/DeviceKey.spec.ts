import { COSEKey } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { deviceKeySchema } from './DeviceKey';

describe('DeviceKey', () => {
  it('should accept valid COSEKey instances', () => {
    const validKeys = [
      new Map<number, any>(),
      new Map<number, any>([[-1, 1]]),
      new Map<number, any>([
        [-1, 1],
        [-2, Buffer.from([1, 2, 3])],
      ]),
    ];

    validKeys.forEach((key) => {
      expect(() => deviceKeySchema.parse(key)).not.toThrow();
      const result = deviceKeySchema.parse(key);
      expect(result).toBeInstanceOf(COSEKey);
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
      { key: 'value' },
      {},
    ];

    invalidInputs.forEach((input) => {
      expect(() => deviceKeySchema.parse(input)).toThrow();
    });
  });
});
