import { describe, it, expect } from 'vitest';
import { bytesSchema } from '../Bytes';
import { z } from 'zod';
import { valueInvalidTypeMessage } from '@/schemas/messages/valueInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';

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
    const expectedMessage = (v: unknown): string =>
      valueInvalidTypeMessage({
        expected: 'Uint8Array or Buffer',
        received: getTypeName(v),
      });
    const invalidCases: Array<{
      name: string;
      input: unknown;
      expectedMessage: string;
    }> = [
      {
        name: 'string',
        input: 'foo',
        expectedMessage: expectedMessage('foo'),
      },
      {
        name: 'number',
        input: 123,
        expectedMessage: expectedMessage(123),
      },
      {
        name: 'boolean',
        input: false,
        expectedMessage: expectedMessage(false),
      },
      {
        name: 'array',
        input: [1, 2],
        expectedMessage: expectedMessage([1, 2]),
      },
      {
        name: 'object',
        input: { a: 1 },
        expectedMessage: expectedMessage({ a: 1 }),
      },
      {
        name: 'date',
        input: new Date('2020-01-01'),
        expectedMessage: expectedMessage(new Date('2020-01-01')),
      },
      {
        name: 'map',
        input: new Map(),
        expectedMessage: expectedMessage(new Map()),
      },
      {
        name: 'set',
        input: new Set(),
        expectedMessage: expectedMessage(new Set()),
      },
      {
        name: 'null',
        input: null,
        expectedMessage: expectedMessage(null),
      },
      {
        name: 'undefined',
        input: undefined,
        expectedMessage: expectedMessage(undefined),
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
