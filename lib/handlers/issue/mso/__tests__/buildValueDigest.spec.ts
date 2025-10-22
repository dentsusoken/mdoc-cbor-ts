import { describe, expect, it } from 'vitest';
import { buildValueDigest } from '../buildValueDigest';
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
    ['random', new Uint8Array(32)], // Fixed size random for consistent testing
    ['elementIdentifier', elementIdentifier],
    ['elementValue', elementValue],
  ]);
  return createTag24(issuerSignedItem);
};

describe('buildValueDigest', () => {
  it('should return digestID and digest for an issuer signed item', () => {
    const digestID = 42;
    const issuerSignedItemTag = createIssuerSignedItemTag24(
      digestID,
      'given_name',
      'JOHN'
    );
    const digestAlgorithm = 'SHA-256';

    const result = buildValueDigest({
      issuerSignedItemTag,
      digestAlgorithm,
    });

    expect(result.digestID).toBe(digestID);
    expect(result.digest).toBeInstanceOf(Uint8Array);
    expect(result.digest).toEqual(
      calculateDigest(digestAlgorithm, issuerSignedItemTag)
    );
  });
});
