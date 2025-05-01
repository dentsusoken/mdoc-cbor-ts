import { TypedMap } from '@jfromaniello/typedmap';
import { describe, expect, it } from 'vitest';
import { ByteString } from '../../cbor';
import { issuerNameSpacesSchema } from './IssuerNameSpaces';

describe('IssuerNameSpaces', () => {
  it('should accept valid issuer name spaces records', () => {
    const validRecords = [
      new Map([
        [
          'org.iso.18013.5.1',
          [
            new ByteString(
              new TypedMap([
                ['digestID', 1],
                ['random', Buffer.from([])],
                ['elementIdentifier', 'given_name'],
                ['elementValue', 'John'],
              ])
            ),
          ],
        ],
      ]),
      new Map([
        [
          'com.example.namespace',
          [
            new ByteString(
              new TypedMap([
                ['digestID', 1],
                ['random', Buffer.from([])],
                ['elementIdentifier', 'given_name'],
                ['elementValue', 'John'],
              ])
            ),
          ],
        ],
      ]),
      new Map([
        [
          'test.namespace',
          [
            new ByteString(
              new TypedMap([
                ['digestID', 1],
                ['random', Buffer.from([])],
                ['elementIdentifier', 'given_name'],
                ['elementValue', 'John'],
              ])
            ),
          ],
        ],
      ]),
    ];

    validRecords.forEach((record) => {
      expect(() => issuerNameSpacesSchema.parse(record)).not.toThrow();
      const result = issuerNameSpacesSchema.parse(record);
      expect(result).toEqual(Object.fromEntries(record));
    });
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [],
      {},
      {
        'org.iso.18013.5.1': [],
      },
      {
        'org.iso.18013.5.1': null,
      },
      {
        'org.iso.18013.5.1': undefined,
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => issuerNameSpacesSchema.parse(input)).toThrow();
    });
  });
});
