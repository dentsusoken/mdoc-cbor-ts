import { describe, expect, it, vi } from 'vitest';
import { buildValueDigests } from '../buildValueDigests';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { calculateDigest } from '@/utils/calculateDigest';
import { createTag24 } from '@/cbor/createTag24';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';

// Mock the calculateDigest function
vi.mock('@/utils/calculateDigest');
const mockCalculateDigest = vi.mocked(calculateDigest);

// Helper to create a deterministic IssuerSignedItem Tag24
const createIssuerSignedItemTag24 = (
  digestID: number,
  elementIdentifier = 'given_name',
  elementValue: unknown = 'JOHN'
): ReturnType<typeof createTag24> => {
  const issuerSignedItem = new Map<string, unknown>();
  issuerSignedItem.set('digestID', digestID);
  issuerSignedItem.set('random', new Uint8Array(16));
  issuerSignedItem.set('elementIdentifier', elementIdentifier);
  issuerSignedItem.set('elementValue', elementValue);
  return createTag24(issuerSignedItem);
};

describe('buildValueDigests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate value digests for namespaces', async () => {
    const tags = [
      createIssuerSignedItemTag24(1),
      createIssuerSignedItemTag24(2),
    ];
    const nameSpaces: IssuerNameSpaces = new Map([['org.iso.18013.5.1', tags]]);

    // Mock the calculateDigest function to return predictable values
    const mockDigest1 = new Uint8Array([1, 2, 3, 4]);
    const mockDigest2 = new Uint8Array([5, 6, 7, 8]);
    mockCalculateDigest
      .mockResolvedValueOnce(mockDigest1)
      .mockResolvedValueOnce(mockDigest2);

    const valueDigests = await buildValueDigests({
      nameSpaces,
      digestAlgorithm: 'SHA-256' as DigestAlgorithm,
    });

    expect(valueDigests instanceof Map).toBe(true);
    const ns = valueDigests.get('org.iso.18013.5.1');
    expect(ns instanceof Map).toBe(true);
    expect(ns?.get(1)).toEqual(mockDigest1);
    expect(ns?.get(2)).toEqual(mockDigest2);

    // Verify calculateDigest was called with correct parameters
    expect(mockCalculateDigest).toHaveBeenCalledTimes(2);
    expect(mockCalculateDigest).toHaveBeenNthCalledWith(1, 'SHA-256', tags[0]);
    expect(mockCalculateDigest).toHaveBeenNthCalledWith(2, 'SHA-256', tags[1]);
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

    // Mock the calculateDigest function to return predictable values
    const mockDigest1 = new Uint8Array([1, 2, 3, 4]);
    const mockDigest2 = new Uint8Array([5, 6, 7, 8]);
    const mockDigest3 = new Uint8Array([9, 10, 11, 12]);
    mockCalculateDigest
      .mockResolvedValueOnce(mockDigest1)
      .mockResolvedValueOnce(mockDigest2)
      .mockResolvedValueOnce(mockDigest3);

    const valueDigests = await buildValueDigests({
      nameSpaces,
      digestAlgorithm: 'SHA-256' as DigestAlgorithm,
    });

    expect(valueDigests.size).toBe(2);

    const ns1 = valueDigests.get('org.iso.18013.5.1');
    expect(ns1?.get(1)).toEqual(mockDigest1);

    const ns2 = valueDigests.get('org.iso.18013.5.2');
    expect(ns2?.get(2)).toEqual(mockDigest2);
    expect(ns2?.get(3)).toEqual(mockDigest3);

    // Verify calculateDigest was called with correct parameters
    expect(mockCalculateDigest).toHaveBeenCalledTimes(3);
    expect(mockCalculateDigest).toHaveBeenNthCalledWith(1, 'SHA-256', tags1[0]);
    expect(mockCalculateDigest).toHaveBeenNthCalledWith(2, 'SHA-256', tags2[0]);
    expect(mockCalculateDigest).toHaveBeenNthCalledWith(3, 'SHA-256', tags2[1]);
  });

  it('should handle empty namespaces', async () => {
    const nameSpaces: IssuerNameSpaces = new Map();

    const valueDigests = await buildValueDigests({
      nameSpaces,
      digestAlgorithm: 'SHA-256' as DigestAlgorithm,
    });

    expect(valueDigests.size).toBe(0);
    expect(mockCalculateDigest).not.toHaveBeenCalled();
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
    expect(mockCalculateDigest).not.toHaveBeenCalled();
  });

  it('should use the provided digest algorithm', async () => {
    const tags = [createIssuerSignedItemTag24(1)];
    const nameSpaces: IssuerNameSpaces = new Map([['org.iso.18013.5.1', tags]]);

    const mockDigest = new Uint8Array([1, 2, 3, 4]);
    mockCalculateDigest.mockResolvedValue(mockDigest);

    await buildValueDigests({
      nameSpaces,
      digestAlgorithm: 'SHA-384' as DigestAlgorithm,
    });

    expect(mockCalculateDigest).toHaveBeenCalledWith('SHA-384', tags[0]);
  });
});
