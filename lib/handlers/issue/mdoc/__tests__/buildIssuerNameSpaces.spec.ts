import { Tag } from 'cbor-x';
import { buildIssuerNameSpaces } from '../buildIssuerNameSpaces';
import { createTag24 } from '@/cbor/createTag24';
import type { RandomBytes } from '@/types';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';

describe('buildIssuerNameSpaces', () => {
  const mockRandomBytes: RandomBytes = (byteLength = 32) => {
    return new Uint8Array(byteLength);
  };

  describe('valid cases', () => {
    it('should build IssuerNameSpaces with Tag(24) items for each element', () => {
      const input = {
        'org.iso.18013.5.1': {
          given_name: 'John',
          family_name: 'Doe',
        },
        'org.iso.18013.5.2': {
          document_number: '1234567890',
        },
      };

      const result = buildIssuerNameSpaces(input, mockRandomBytes);

      const expected = new Map<string, Tag[]>([
        [
          'org.iso.18013.5.1',
          [
            createTag24(
              createIssuerSignedItem([
                ['digestID', 0],
                ['random', mockRandomBytes(32)],
                ['elementIdentifier', 'given_name'],
                ['elementValue', 'John'],
              ])
            ),
            createTag24(
              createIssuerSignedItem([
                ['digestID', 1],
                ['random', mockRandomBytes(32)],
                ['elementIdentifier', 'family_name'],
                ['elementValue', 'Doe'],
              ])
            ),
          ],
        ],
        [
          'org.iso.18013.5.2',
          [
            createTag24(
              createIssuerSignedItem([
                ['digestID', 0],
                ['random', mockRandomBytes(32)],
                ['elementIdentifier', 'document_number'],
                ['elementValue', '1234567890'],
              ])
            ),
          ],
        ],
      ]);
      expect(result).toEqual(expected);
    });
  });

  describe('invalid cases', () => {
    it('should throw when an inner namespace has no elements', () => {
      const input = {
        'org.iso.18013.5.1': {},
      };

      expect(() => buildIssuerNameSpaces(input, mockRandomBytes)).toThrowError(
        'No issuer signed items for namespace org.iso.18013.5.1'
      );
    });

    it('should throw when there are no namespaces', () => {
      const input = {};
      expect(() => buildIssuerNameSpaces(input, mockRandomBytes)).toThrowError(
        'No issuer name spaces'
      );
    });
  });
});
