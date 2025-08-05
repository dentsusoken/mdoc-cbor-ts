import { describe, expect, it } from 'vitest';
import { bytesSchema } from '../Bytes';
import { z } from 'zod';

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

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.equals(buffer)).toBe(true);
  });

  it('should throw invalid_union error for invalid input with unified message', () => {
    const invalidInputs = [
      'not bytes',
      123,
      true,
      null,
      undefined,
      { key: 'value' },
      [1, 2, 3],
    ];

    for (const input of invalidInputs) {
      try {
        bytesSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        // Verify it's a ZodError
        expect(error).toBeInstanceOf(z.ZodError);

        // Check the unified error message
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Bytes: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.'
        );
      }
    }
  });

  it('should handle empty Buffer and Uint8Array', () => {
    const emptyBuffer = Buffer.from([]);
    const emptyUint8Array = new Uint8Array([]);

    const result1 = bytesSchema.parse(emptyBuffer);
    const result2 = bytesSchema.parse(emptyUint8Array);

    expect(Buffer.isBuffer(result1)).toBe(true);
    expect(Buffer.isBuffer(result2)).toBe(true);
    expect(result1.length).toBe(0);
    expect(result2.length).toBe(0);
  });

  it('should handle large Buffer and Uint8Array', () => {
    const largeBuffer = Buffer.alloc(1000, 1);
    const largeUint8Array = new Uint8Array(1000).fill(1);

    const result1 = bytesSchema.parse(largeBuffer);
    const result2 = bytesSchema.parse(largeUint8Array);

    expect(Buffer.isBuffer(result1)).toBe(true);
    expect(Buffer.isBuffer(result2)).toBe(true);
    expect(result1.length).toBe(1000);
    expect(result2.length).toBe(1000);
  });
});
