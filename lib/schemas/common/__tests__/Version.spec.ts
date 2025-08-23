import { describe, expect, it } from 'vitest';
import { versionSchema, VERSION_INVALID_VALUE_MESSAGE } from '../Version';
import { z } from 'zod';

describe('Version', () => {
  describe('should accept valid version strings', () => {
    it('should accept "1.0"', () => {
      const result = versionSchema.parse('1.0');
      expect(result).toBe('1.0');
    });
  });

  describe('should throw error for invalid inputs', () => {
    const testCases = [
      {
        name: 'number input',
        input: 123,
        expectedMessage: VERSION_INVALID_VALUE_MESSAGE,
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: VERSION_INVALID_VALUE_MESSAGE,
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expectedMessage: VERSION_INVALID_VALUE_MESSAGE,
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expectedMessage: VERSION_INVALID_VALUE_MESSAGE,
      },
      {
        name: 'null input',
        input: null,
        expectedMessage: VERSION_INVALID_VALUE_MESSAGE,
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: VERSION_INVALID_VALUE_MESSAGE,
      },
      {
        name: 'empty string',
        input: '',
        expectedMessage: VERSION_INVALID_VALUE_MESSAGE,
      },
      {
        name: 'different version string',
        input: '2.0',
        expectedMessage: VERSION_INVALID_VALUE_MESSAGE,
      },
      {
        name: 'version with extra spaces',
        input: ' 1.0 ',
        expectedMessage: VERSION_INVALID_VALUE_MESSAGE,
      },
      {
        name: 'version with different format',
        input: '1',
        expectedMessage: VERSION_INVALID_VALUE_MESSAGE,
      },
      {
        name: 'version with extra digits',
        input: '1.0.0',
        expectedMessage: VERSION_INVALID_VALUE_MESSAGE,
      },
      {
        name: 'version with letters',
        input: '1.0a',
        expectedMessage: VERSION_INVALID_VALUE_MESSAGE,
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          versionSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });

  describe('safeParse should return success for valid input', () => {
    it('should return success for "1.0"', () => {
      const result = versionSchema.safeParse('1.0');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('1.0');
      }
    });
  });

  describe('safeParse should return error for invalid input', () => {
    it('should return error for "2.0"', () => {
      const result = versionSchema.safeParse('2.0');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          VERSION_INVALID_VALUE_MESSAGE
        );
      }
    });

    it('should return error for empty string', () => {
      const result = versionSchema.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          VERSION_INVALID_VALUE_MESSAGE
        );
      }
    });
  });
});
