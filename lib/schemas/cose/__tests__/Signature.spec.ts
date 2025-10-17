import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { signatureSchema } from '../Signature';
import { bytesInvalidTypeMessage } from '@/schemas/cbor/Bytes';
import { requiredMessage } from '@/schemas/common/Required';

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
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: requiredMessage('Signature'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: requiredMessage('Signature'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: bytesInvalidTypeMessage('Signature'),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: bytesInvalidTypeMessage('Signature'),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: bytesInvalidTypeMessage('Signature'),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: bytesInvalidTypeMessage('Signature'),
      },
      {
        name: 'plain object input',
        input: {},
        expectedMessage: bytesInvalidTypeMessage('Signature'),
      },
      {
        name: 'set input',
        input: new Set([1, 2]),
        expectedMessage: bytesInvalidTypeMessage('Signature'),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
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
