import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { protectedHeadersSchema } from '../ProtectedHeaders';
import { bytesInvalidTypeMessage } from '@/schemas/common/values/Bytes';
import { requiredMessage } from '@/schemas/common/Required';

describe('ProtectedHeaders', () => {
  describe('should accept valid byte inputs', () => {
    it('should accept Uint8Array and return the same Uint8Array', () => {
      const input = Uint8Array.from([0xa1, 0x01, 0x26]);
      const result = protectedHeadersSchema.parse(input);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual(Array.from(input));
    });

    it('should accept Buffer and return Uint8Array', () => {
      const buffer = Buffer.from([0x01, 0x02, 0x03]);
      const result = protectedHeadersSchema.parse(buffer);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([0x01, 0x02, 0x03]);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: requiredMessage('ProtectedHeaders'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: requiredMessage('ProtectedHeaders'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: bytesInvalidTypeMessage('ProtectedHeaders'),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: bytesInvalidTypeMessage('ProtectedHeaders'),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: bytesInvalidTypeMessage('ProtectedHeaders'),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: bytesInvalidTypeMessage('ProtectedHeaders'),
      },
      {
        name: 'plain object input',
        input: {},
        expectedMessage: bytesInvalidTypeMessage('ProtectedHeaders'),
      },
      {
        name: 'set input',
        input: new Set([1, 2]),
        expectedMessage: bytesInvalidTypeMessage('ProtectedHeaders'),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should reject ${name}`, () => {
        try {
          protectedHeadersSchema.parse(input as never);
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
