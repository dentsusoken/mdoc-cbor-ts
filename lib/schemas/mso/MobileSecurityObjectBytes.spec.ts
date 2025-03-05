import { describe, expect, it } from 'vitest';
import { mobileSecurityObjectBytesSchema } from './MobileSecurityObjectBytes';

describe('MobileSecurityObjectBytes', () => {
  it('should accept valid binary data', () => {
    const validBytes = [
      Buffer.from([]),
      Buffer.from([1, 2, 3]),
      Buffer.from('test'),
      new Uint8Array([1, 2, 3]),
    ];

    validBytes.forEach((bytes) => {
      expect(() => mobileSecurityObjectBytesSchema.parse(bytes)).not.toThrow();
      const result = mobileSecurityObjectBytesSchema.parse(bytes);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result).toEqual(Buffer.from(bytes));
    });
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      { key: 'value' },
      [1, 2, 3],
    ];

    invalidInputs.forEach((input) => {
      expect(() => mobileSecurityObjectBytesSchema.parse(input)).toThrow();
    });
  });
});
