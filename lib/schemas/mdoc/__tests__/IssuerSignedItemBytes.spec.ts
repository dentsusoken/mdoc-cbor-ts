import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createTag24 } from '@/cbor/createTag24';
import { issuerSignedItemBytesSchema } from '../IssuerSignedItemBytes';
import { requiredMessage } from '@/schemas/common/Required';
import { tag24InvalidTypeMessage } from '@/schemas/common/Tag24';

describe('IssuerSignedItemBytes', () => {
  describe('valid Tag24 inputs', () => {
    it('should accept item with string elementValue', () => {
      const inner = {
        digestID: 1,
        random: Uint8Array.from([]),
        elementIdentifier: 'given_name',
        elementValue: 'John',
      };
      const tag = createTag24(inner);
      const result = issuerSignedItemBytesSchema.parse(tag);
      expect(result).toBeInstanceOf(Tag);
      expect(result.value).toEqual(tag.value);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const target = 'IssuerSignedItemBytes';
    const invalidTypeMsg = tag24InvalidTypeMessage(target);
    const requiredMsg = requiredMessage(target);
    const testCases: Array<{
      name: string;
      input: unknown;
      expectedMessage: string;
    }> = [
      { name: 'null input', input: null, expectedMessage: requiredMsg },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: requiredMsg,
      },
      { name: 'boolean input', input: true, expectedMessage: invalidTypeMsg },
      { name: 'number input', input: 123, expectedMessage: invalidTypeMsg },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: invalidTypeMsg,
      },
      {
        name: 'Buffer input',
        input: Buffer.from([]),
        expectedMessage: invalidTypeMsg,
      },
      {
        name: 'plain object input',
        input: { tag: 24, value: 0 },
        expectedMessage: invalidTypeMsg,
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          issuerSignedItemBytesSchema.parse(input);
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
