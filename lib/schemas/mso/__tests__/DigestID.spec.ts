import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { digestIDSchema } from '../DigestID';
import {
  uintInvalidTypeMessage,
  uintRequiredMessage,
} from '@/schemas/common/Uint';

describe('DigestID', () => {
  describe('valid inputs', () => {
    it('should accept positive integer number', () => {
      const input = 42;
      const result = digestIDSchema.parse(input);
      expect(typeof result).toBe('number');
      expect(result).toBe(42);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    [
      {
        name: 'boolean',
        value: true,
        expectedMessage: uintInvalidTypeMessage('DigestID'),
      },
      {
        name: 'null',
        value: null,
        expectedMessage: uintInvalidTypeMessage('DigestID'),
      },
      {
        name: 'object',
        value: { a: 1 },
        expectedMessage: uintInvalidTypeMessage('DigestID'),
      },
      {
        name: 'array',
        value: [1, 2] as unknown,
        expectedMessage: uintInvalidTypeMessage('DigestID'),
      },
      {
        name: 'undefined (required)',
        value: undefined,
        expectedMessage: uintRequiredMessage('DigestID'),
      },
    ].forEach(({ name, value, expectedMessage }) => {
      it(`should throw for ${name}`, () => {
        try {
          digestIDSchema.parse(value);
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
