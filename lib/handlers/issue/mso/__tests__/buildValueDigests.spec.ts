import { describe, expect, it, vi } from 'vitest';
import { buildValueDigests } from '../buildValueDigests';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { IssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { calculateDigest } from '@/utils/calculateDigest';
import { createTag24 } from '@/cbor/createTag24';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';

// Helper to create a deterministic IssuerSignedItem Tag24
const createIssuerSignedItemTag24 = (
  digestID: number,
  elementIdentifier = 'given_name',
  elementValue: unknown = 'JOHN'
): ReturnType<typeof createTag24> => {
  const issuerSignedItem: IssuerSignedItem = {
    digestID,
    random: new Uint8Array(16),
    elementIdentifier,
    elementValue,
  };
  return createTag24(issuerSignedItem);
};

describe('buildValueDigests', () => {
  it('should calculate value digests for namespaces', async () => {
    const tags = [
      createIssuerSignedItemTag24(1),
      createIssuerSignedItemTag24(2),
    ];
    const nameSpaces: IssuerNameSpaces = new Map([['org.iso.18013.5.1', tags]]);

    const digest1 = await calculateDigest('SHA-256', tags[0]);
    const digest2 = await calculateDigest('SHA-256', tags[1]);

    const valueDigests = await buildValueDigests({
      nameSpaces,
      digestAlgorithm: 'SHA-256',
    });

    expect(valueDigests instanceof Map).toBe(true);
    const ns = valueDigests.get('org.iso.18013.5.1');
    expect(ns instanceof Map).toBe(true);
    expect(ns?.get(1)).toEqual(digest1);
    expect(ns?.get(2)).toEqual(digest2);
  });

  it('should handle multiple namespaces', async () => {
    const tags1 = [createIssuerSignedItemTag24(1)];
    const tags2 = [
      createIssuerSignedItemTag24(2),
      createIssuerSignedItemTag24(3),
    ];
    const nameSpaces: IssuerNameSpaces = new Map([
      ['org.iso.18013.5.1', tags1],
      ['org.iso.18013.5.2', tags2],
    ]);

    const digest1 = await calculateDigest('SHA-256', tags1[0]);
    const digest2 = await calculateDigest('SHA-256', tags2[0]);
    const digest3 = await calculateDigest('SHA-256', tags2[1]);

    const valueDigests = await buildValueDigests({
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

  it('should handle empty namespaces', async () => {
    const nameSpaces: IssuerNameSpaces = new Map();

    const valueDigests = await buildValueDigests({
      nameSpaces,
      digestAlgorithm: 'SHA-256' as DigestAlgorithm,
    });

    expect(valueDigests.size).toBe(0);
  });

  it('should handle empty tags array in namespace', async () => {
    const nameSpaces: IssuerNameSpaces = new Map([['org.iso.18013.5.1', []]]);

    const valueDigests = await buildValueDigests({
      nameSpaces,
      digestAlgorithm: 'SHA-256' as DigestAlgorithm,
    });

    expect(valueDigests.size).toBe(1);
    const ns = valueDigests.get('org.iso.18013.5.1');
    expect(ns?.size).toBe(0);
  });
});
