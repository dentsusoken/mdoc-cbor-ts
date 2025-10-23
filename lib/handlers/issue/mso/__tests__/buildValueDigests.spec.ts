import { describe, expect, it } from 'vitest';
import { buildValueDigests } from '../buildValueDigests';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { calculateDigest } from '@/utils/calculateDigest';
import { createTag24 } from '@/cbor/createTag24';

// Helper to create a deterministic IssuerSignedItem Tag24
const createIssuerSignedItemTag24 = (
  digestID: number,
  elementIdentifier = 'given_name',
  elementValue: unknown = 'JOHN'
): ReturnType<typeof createTag24> => {
  const issuerSignedItem = createIssuerSignedItem([
    ['digestID', digestID],
    ['random', new Uint8Array(16)],
    ['elementIdentifier', elementIdentifier],
    ['elementValue', elementValue],
  ]);
  return createTag24(issuerSignedItem);
};

describe('buildValueDigests', () => {
  describe('successful cases', () => {
    it('should calculate value digests for namespaces', () => {
      const tags = [
        createIssuerSignedItemTag24(1),
        createIssuerSignedItemTag24(2),
      ];
      const nameSpaces: IssuerNameSpaces = new Map([
        ['org.iso.18013.5.1', tags],
      ]);

      const digest1 = calculateDigest('SHA-256', tags[0]);
      const digest2 = calculateDigest('SHA-256', tags[1]);

      const valueDigests = buildValueDigests({
        nameSpaces,
        digestAlgorithm: 'SHA-256',
      });

      expect(valueDigests).toBeInstanceOf(Map);
      const ns = valueDigests.get('org.iso.18013.5.1');
      expect(ns).toBeInstanceOf(Map);
      expect(ns?.get(1)).toEqual(digest1);
      expect(ns?.get(2)).toEqual(digest2);
    });

    it('should handle multiple namespaces', () => {
      const tags1 = createIssuerSignedItemTag24(1);
      const tags2 = createIssuerSignedItemTag24(2);
      const tags3 = createIssuerSignedItemTag24(3);

      const nameSpaces: IssuerNameSpaces = new Map([
        ['org.iso.18013.5.1', [tags1]],
        ['org.iso.18013.5.2', [tags2, tags3]],
      ]);

      const digest1 = calculateDigest('SHA-256', tags1);
      const digest2 = calculateDigest('SHA-256', tags2);
      const digest3 = calculateDigest('SHA-256', tags3);

      const valueDigests = buildValueDigests({
        nameSpaces,
        digestAlgorithm: 'SHA-256',
      });

      expect(valueDigests.size).toBe(2);

      const ns1 = valueDigests.get('org.iso.18013.5.1');
      expect(ns1?.get(1)).toEqual(digest1);

      const ns2 = valueDigests.get('org.iso.18013.5.2');
      expect(ns2?.get(2)).toEqual(digest2);
      expect(ns2?.get(3)).toEqual(digest3);
    });
  });

  describe('error cases', () => {
    it('should throw when nameSpaces is empty', () => {
      const nameSpaces: IssuerNameSpaces = new Map();
      expect(() =>
        buildValueDigests({ nameSpaces, digestAlgorithm: 'SHA-256' })
      ).toThrowError('No namespaces provided');
    });

    it('should throw when a namespace has no issuer signed items', () => {
      const nameSpaces: IssuerNameSpaces = new Map([['org.iso.18013.5.1', []]]);
      expect(() =>
        buildValueDigests({ nameSpaces, digestAlgorithm: 'SHA-256' })
      ).toThrowError('No issuer signed items for namespace org.iso.18013.5.1');
    });
  });
});
