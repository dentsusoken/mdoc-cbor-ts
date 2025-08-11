import { TypedMap } from '@jfromaniello/typedmap';
import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ByteString } from '@/cbor/ByteString';
import { issuerSignedItemBytesSchema } from '../IssuerSignedItemBytes';

describe('IssuerSignedItemBytes', () => {
  describe('valid ByteString inputs', () => {
    it('should accept item with string elementValue', () => {
      const item = new ByteString(
        new TypedMap([
          ['digestID', 1],
          ['random', Buffer.from([])],
          ['elementIdentifier', 'given_name'],
          ['elementValue', 'John'],
        ])
      );
      const result = issuerSignedItemBytesSchema.parse(item);
      expect(result).toBeInstanceOf(ByteString);
      expect(result.data).toEqual(item.data);
    });

    it('should accept item with number elementValue', () => {
      const item = new ByteString(
        new TypedMap([
          ['digestID', 2],
          ['random', Buffer.from([])],
          ['elementIdentifier', 'age'],
          ['elementValue', 30],
        ])
      );
      const result = issuerSignedItemBytesSchema.parse(item);
      expect(result).toBeInstanceOf(ByteString);
      expect(result.data).toEqual(item.data);
    });

    it('should accept item with tagged elementValue', () => {
      const item = new ByteString(
        new TypedMap([
          ['digestID', 3],
          ['random', Buffer.from([])],
          ['elementIdentifier', 'photo'],
          ['elementValue', new Tag(0, 24)],
        ])
      );
      const result = issuerSignedItemBytesSchema.parse(item);
      expect(result).toBeInstanceOf(ByteString);
      expect(result.data).toEqual(item.data);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const schemaMessage =
      'IssuerSignedItemBytes: Expected a ByteString instance containing issuer-signed item. Please provide a valid CBOR-encoded issuer-signed item.';
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
