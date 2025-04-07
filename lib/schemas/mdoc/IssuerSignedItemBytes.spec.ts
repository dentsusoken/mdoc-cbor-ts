import { TypedMap } from '@jfromaniello/typedmap';
import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { ByteString } from '../../cbor';
import {
  IssuerSignedItemBytes,
  issuerSignedItemBytesSchema,
} from './IssuerSignedItemBytes';

describe('IssuerSignedItemBytes', () => {
  it('should accept valid CBOR tag', () => {
    const validItems: IssuerSignedItemBytes[] = [
      new ByteString(
        new TypedMap([
          ['digestID', 1],
          ['random', Buffer.from([])],
          ['elementIdentifier', 'given_name'],
          ['elementValue', 'John'],
        ])
      ),
      new ByteString(
        new TypedMap([
          ['digestID', 2],
          ['random', Buffer.from([])],
          ['elementIdentifier', 'age'],
          ['elementValue', 30],
        ])
      ),
      new ByteString(
        new TypedMap([
          ['digestID', 3],
          ['random', Buffer.from([])],
          ['elementIdentifier', 'photo'],
          ['elementValue', new Tag(24, 0)],
        ])
      ),
    ];
    validItems.forEach((item) => {
      expect(() => issuerSignedItemBytesSchema.parse(item)).not.toThrow();
      const result = issuerSignedItemBytesSchema.parse(item);
      expect(result).toBeInstanceOf(ByteString);
      expect(result.data).toEqual(item.data);
    });
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      Buffer.from([]),
      { tag: 24, value: 0 },
    ];

    invalidInputs.forEach((input) => {
      expect(() => issuerSignedItemBytesSchema.parse(input)).toThrow();
    });
  });
});
