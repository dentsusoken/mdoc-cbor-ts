import { describe, expect, it } from 'vitest';
import { createBytesSchema, BYTES_INVALID_TYPE_MESSAGE_SUFFIX } from '../Bytes';
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
        expectedMessage: `Bytes: ${BYTES_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: `Bytes: ${BYTES_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: `Bytes: ${BYTES_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'null input',
        input: null,
        expectedMessage: `Bytes: ${BYTES_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: `Bytes: ${BYTES_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expectedMessage: `Bytes: ${BYTES_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expectedMessage: `Bytes: ${BYTES_INVALID_TYPE_MESSAGE_SUFFIX}`,
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
            `CustomTarget: ${BYTES_INVALID_TYPE_MESSAGE_SUFFIX}`
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
        expect(result).toEqual(input);
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
