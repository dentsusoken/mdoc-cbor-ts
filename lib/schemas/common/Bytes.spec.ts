import { describe, expect, it } from 'vitest';
import { bytesSchema } from './Bytes';

describe('Bytes', () => {
  it('should accept and transform Uint8Array to Buffer', () => {
    const uint8Array = new Uint8Array([1, 2, 3]);
    const result = bytesSchema.parse(uint8Array);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.equals(Buffer.from([1, 2, 3]))).toBe(true);
  });

  it('should accept and return Buffer as is', () => {
    const buffer = Buffer.from([1, 2, 3]);
    const result = bytesSchema.parse(buffer);

    console.log('result :>> ', result);
    console.log('buffer :>> ', buffer);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.equals(buffer)).toBe(true);
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
      expect(() => bytesSchema.parse(input)).toThrow();
    });
  });
});
