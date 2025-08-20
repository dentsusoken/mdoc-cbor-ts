import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { signatureSchema } from '../Signature';
import { bytesInvalidTypeMessage } from '@/schemas/common/Bytes';

describe('Signature', () => {
  describe('should accept valid byte inputs', () => {
    it('should accept Uint8Array and return the same Uint8Array', () => {
      const input = Uint8Array.from([0x12, 0x34, 0x56, 0x78]);
      const result = signatureSchema.parse(input);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result).toEqual(input);
    });

    it('should accept Buffer and return Uint8Array', () => {
      const buffer = Buffer.from([0xde, 0xad, 0xbe, 0xef]);
      const result = signatureSchema.parse(buffer);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result).toEqual(Uint8Array.from([0xde, 0xad, 0xbe, 0xef]));
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const expectedMessage = bytesInvalidTypeMessage('Signature');
    const cases: Array<{ name: string; input: unknown }> = [
      { name: 'null input', input: null },
      { name: 'undefined input', input: undefined },
      { name: 'boolean input', input: true },
      { name: 'number input', input: 123 },
      { name: 'string input', input: 'string' },
      { name: 'array input', input: [] },
      { name: 'plain object input', input: {} },
      { name: 'set input', input: new Set([1, 2]) },
    ];

    cases.forEach(({ name, input }) => {
      it(`should reject ${name}`, () => {
        try {
          signatureSchema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });
});
