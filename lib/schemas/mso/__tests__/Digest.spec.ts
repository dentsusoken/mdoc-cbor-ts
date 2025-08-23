import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { digestSchema } from '../Digest';
import { bytesInvalidTypeMessage } from '@/schemas/common/Bytes';
import { requiredMessage } from '@/schemas/common/Required';

describe('Digest', () => {
  describe('valid digest values', () => {
    it('should accept Buffer (empty)', () => {
      const input = Buffer.from([]);
      const result = digestSchema.parse(input);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(Buffer.from(result)).toEqual(input);
    });

    it('should accept Buffer (non-empty)', () => {
      const input = Buffer.from([1, 2, 3]);
      const result = digestSchema.parse(input);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(Buffer.from(result)).toEqual(input);
    });

    it('should accept Uint8Array', () => {
      const input = new Uint8Array([1, 2, 3]);
      const result = digestSchema.parse(input);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result).toEqual(input);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const invalidTypeMes = bytesInvalidTypeMessage('Digest');
    const requiredMes = requiredMessage('Digest');
    const testCases: Array<{ name: string; input: unknown; expected: string }> =
      [
        { name: 'string', input: 'not bytes', expected: invalidTypeMes },
        { name: 'number', input: 123, expected: invalidTypeMes },
        { name: 'boolean', input: true, expected: invalidTypeMes },
        { name: 'null', input: null, expected: requiredMes },
        { name: 'undefined', input: undefined, expected: requiredMes },
        {
          name: 'plain object',
          input: { key: 'value' },
          expected: invalidTypeMes,
        },
        { name: 'array', input: [1, 2, 3], expected: invalidTypeMes },
      ];

    testCases.forEach(({ name, input, expected }) => {
      it(`should throw error for ${name}`, () => {
        try {
          digestSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });
});
