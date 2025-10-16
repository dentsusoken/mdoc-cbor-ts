import { describe, it, expect } from 'vitest';
import { bytesSchema } from '../Bytes';
import { z } from 'zod';

describe('bytesSchema', () => {
  describe('valid inputs', () => {
    it('converts Buffer to Uint8Array view', () => {
      const buf = Buffer.from([1, 2, 3]);
      const result = bytesSchema.parse(buf);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result).toEqual(Uint8Array.from(buf));
    });

    it('keeps Uint8Array as is', () => {
      const input = new Uint8Array([4, 5, 6]);
      const result = bytesSchema.parse(input);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result).toEqual(input);
    });
  });

  describe('invalid inputs', () => {
    const invalidCases: Array<{
      name: string;
      input: unknown;
      expectedMessage: string;
    }> = [
      {
        name: 'string',
        input: 'foo',
        expectedMessage: 'Expected Buffer or Uint8Array, received string',
      },
      {
        name: 'number',
        input: 123,
        expectedMessage: 'Expected Buffer or Uint8Array, received number',
      },
      {
        name: 'boolean',
        input: false,
        expectedMessage: 'Expected Buffer or Uint8Array, received boolean',
      },
      {
        name: 'array',
        input: [1, 2],
        expectedMessage: 'Expected Buffer or Uint8Array, received array',
      },
      {
        name: 'object',
        input: { a: 1 },
        expectedMessage: 'Expected Buffer or Uint8Array, received object',
      },
      {
        name: 'date',
        input: new Date('2020-01-01'),
        expectedMessage: 'Expected Buffer or Uint8Array, received date',
      },
      {
        name: 'map',
        input: new Map(),
        expectedMessage: 'Expected Buffer or Uint8Array, received map',
      },
      {
        name: 'set',
        input: new Set(),
        expectedMessage: 'Expected Buffer or Uint8Array, received set',
      },
      {
        name: 'null',
        input: null,
        expectedMessage: 'Expected Buffer or Uint8Array, received null',
      },
      {
        name: 'undefined',
        input: undefined,
        expectedMessage: 'Expected Buffer or Uint8Array, received undefined',
      },
    ];

    invalidCases.forEach(({ name, input, expectedMessage }) => {
      it(`reports correct message for ${name}`, () => {
        try {
          bytesSchema.parse(input);
          throw new Error('Expected parse to throw');
        } catch (err) {
          expect(err).toBeInstanceOf(z.ZodError);
          const zerr = err as z.ZodError;
          expect(zerr.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });
});
