import { describe, expect, it } from 'vitest';
import { createBytesSchema, bytesInvalidTypeMessage } from '../Bytes';
import { requiredMessage } from '../Required';
import { z } from 'zod';

describe('Bytes', () => {
  const bytesSchema = createBytesSchema('Bytes');
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
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toBe(expectedLength);
      });
    });
  });

  describe('should throw error for invalid inputs', () => {
    const testCases = [
      {
        name: 'string input',
        input: 'not bytes',
        expectedMessage: bytesInvalidTypeMessage('Bytes'),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: bytesInvalidTypeMessage('Bytes'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: bytesInvalidTypeMessage('Bytes'),
      },
      {
        name: 'null input',
        input: null,
        expectedMessage: requiredMessage('Bytes'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: requiredMessage('Bytes'),
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expectedMessage: bytesInvalidTypeMessage('Bytes'),
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expectedMessage: bytesInvalidTypeMessage('Bytes'),
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
    describe('should create schema with custom target prefix', () => {
      it('should throw message prefixed by target and fixed suffix for invalid input', () => {
        const customSchema = createBytesSchema('CustomTarget');

        try {
          customSchema.parse('invalid');
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(
            bytesInvalidTypeMessage('CustomTarget')
          );
        }
      });
    });

    describe('should accept valid inputs with custom schema', () => {
      it('should accept Buffer with custom schema', () => {
        const customSchema = createBytesSchema('CustomTarget');
        const input = Buffer.from([1, 2, 3]);
        const result = customSchema.parse(input);
        expect(result).toBeInstanceOf(Uint8Array);
        const expected = new Uint8Array(
          input.buffer,
          input.byteOffset,
          input.byteLength
        );
        expect(result).toEqual(expected);
      });

      it('should accept Uint8Array with custom schema', () => {
        const customSchema = createBytesSchema('CustomTarget');
        const input = new Uint8Array([1, 2, 3]);
        const result = customSchema.parse(input);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result).toEqual(input);
      });
    });
  });
});
