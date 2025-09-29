import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { payloadSchema } from '../Payload';
import { bytesInvalidTypeMessage } from '@/schemas/common/Bytes';

describe('Payload', () => {
  describe('should accept valid byte inputs', () => {
    it('should accept Uint8Array and return the same Uint8Array', () => {
      const input = Uint8Array.from([0x01, 0x02, 0x03]);
      const result = payloadSchema.parse(input);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result!)).toEqual([0x01, 0x02, 0x03]);
    });

    it('should accept Buffer and return Uint8Array', () => {
      const buffer = Buffer.from([0xaa, 0xbb]);
      const result = payloadSchema.parse(buffer);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result!)).toEqual([0xaa, 0xbb]);
    });

    it('should accept null and return null', () => {
      const result = payloadSchema.parse(null);
      expect(result).toBeNull();
    });

    it('should reject undefined (nullable, not nullish)', () => {
      expect(() =>
        payloadSchema.parse(undefined as unknown as never)
      ).toThrow();
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'boolean input',
        input: true,
        expectedMessage: bytesInvalidTypeMessage('Payload'),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: bytesInvalidTypeMessage('Payload'),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: bytesInvalidTypeMessage('Payload'),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: bytesInvalidTypeMessage('Payload'),
      },
      {
        name: 'plain object input',
        input: {},
        expectedMessage: bytesInvalidTypeMessage('Payload'),
      },
      {
        name: 'set input',
        input: new Set([1, 2]),
        expectedMessage: bytesInvalidTypeMessage('Payload'),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should reject ${name}`, () => {
        try {
          payloadSchema.parse(input as never);
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
