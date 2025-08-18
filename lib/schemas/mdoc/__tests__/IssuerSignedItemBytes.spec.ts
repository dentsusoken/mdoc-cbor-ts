import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createTag24 } from '@/cbor';
import { issuerSignedItemBytesSchema } from '../IssuerSignedItemBytes';

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

    it('should accept item with number elementValue', () => {
      const inner = {
        digestID: 2,
        random: Uint8Array.from([]),
        elementIdentifier: 'age',
        elementValue: 30,
      };
      const tag = createTag24(inner);
      const result = issuerSignedItemBytesSchema.parse(tag);
      expect(result).toBeInstanceOf(Tag);
      expect(result.value).toEqual(tag.value);
    });

    it('should accept item with tagged elementValue', () => {
      const inner = {
        digestID: 3,
        random: Uint8Array.from([]),
        elementIdentifier: 'photo',
        elementValue: new Tag(0, 24),
      };
      const tag = createTag24(inner);
      const result = issuerSignedItemBytesSchema.parse(tag);
      expect(result).toBeInstanceOf(Tag);
      expect(result.value).toEqual(tag.value);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const schemaMessage =
      'IssuerSignedItemBytes: Please provide a Tag 24 with value type Uint8Array.';
    const testCases: Array<{
      name: string;
      input: unknown;
      expectedMessage: string;
    }> = [
      { name: 'null input', input: null, expectedMessage: schemaMessage },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: schemaMessage,
      },
      { name: 'boolean input', input: true, expectedMessage: schemaMessage },
      { name: 'number input', input: 123, expectedMessage: schemaMessage },
      { name: 'string input', input: 'string', expectedMessage: schemaMessage },
      {
        name: 'Buffer input',
        input: Buffer.from([]),
        expectedMessage: schemaMessage,
      },
      {
        name: 'plain object input',
        input: { tag: 24, value: 0 },
        expectedMessage: schemaMessage,
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
