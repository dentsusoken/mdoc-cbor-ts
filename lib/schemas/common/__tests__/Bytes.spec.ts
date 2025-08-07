import { describe, expect, it } from 'vitest';
import { bytesSchema, createBytesSchema } from '../Bytes';
import { z } from 'zod';

describe('Bytes', () => {
  describe('should accept valid bytes', () => {
    const testCases = [
      {
        name: 'Uint8Array to Buffer',
        input: new Uint8Array([1, 2, 3]),
        expectedLength: 3,
      },
      {
        name: 'Buffer as is',
        input: Buffer.from([1, 2, 3]),
        expectedLength: 3,
      },
      {
        name: 'empty Buffer',
        input: Buffer.from([]),
        expectedLength: 0,
      },
      {
        name: 'empty Uint8Array',
        input: new Uint8Array([]),
        expectedLength: 0,
      },
      {
        name: 'large Buffer',
        input: Buffer.alloc(1000, 1),
        expectedLength: 1000,
      },
      {
        name: 'large Uint8Array',
        input: new Uint8Array(1000).fill(1),
        expectedLength: 1000,
      },
    ];

    testCases.forEach(({ name, input, expectedLength }) => {
      it(`should accept ${name}`, () => {
        const result = bytesSchema.parse(input);

        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.length).toBe(expectedLength);
      });
    });
  });

  describe('should throw error for invalid inputs', () => {
    const testCases = [
      {
        name: 'string input',
        input: 'not bytes',
        expectedMessage:
          'Bytes: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage:
          'Bytes: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'Bytes: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'Bytes: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'Bytes: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expectedMessage:
          'Bytes: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expectedMessage:
          'Bytes: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          bytesSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });

  describe('createBytesSchema', () => {
    describe('should create schema with custom error message', () => {
      it('should throw custom error message for invalid input', () => {
        const customSchema = createBytesSchema('Custom error message');

        try {
          customSchema.parse('invalid');
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe('Custom error message');
        }
      });
    });

    describe('should accept valid inputs with custom schema', () => {
      const testCases = [
        {
          name: 'Buffer with custom schema',
          input: Buffer.from([1, 2, 3]),
        },
        {
          name: 'Uint8Array with custom schema',
          input: new Uint8Array([1, 2, 3]),
        },
      ];

      testCases.forEach(({ name, input }) => {
        it(`should accept ${name}`, () => {
          const customSchema = createBytesSchema('Custom error message');
          const result = customSchema.parse(input);

          expect(Buffer.isBuffer(result)).toBe(true);
          expect(result.equals(Buffer.from([1, 2, 3]))).toBe(true);
        });
      });
    });
  });
});
