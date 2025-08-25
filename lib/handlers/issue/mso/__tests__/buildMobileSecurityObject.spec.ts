import { COSEKey } from '@auth0/cose';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { buildMobileSecurityObject } from '../buildMobileSecurityObject';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { createTag24 } from '@/cbor/createTag24';
import { toISODateTimeString } from '@/utils/toISODateTimeString';

// Mock the dependent functions
vi.mock('../buildValueDigests');
vi.mock('../buildValidityInfo');

const mockBuildValueDigests = vi.mocked(
  await import('../buildValueDigests')
).buildValueDigests;
const mockBuildValidityInfo = vi.mocked(
  await import('../buildValidityInfo')
).buildValidityInfo;

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

describe('buildMobileSecurityObject', () => {
  const baseTime = new Date('2024-01-01T00:00:00Z');
  const validFrom = 0;
  const validUntil = validFrom + 24 * 60 * 60; // +1 day
  const expectedUpdate = validFrom + 60 * 60; // +1 hour

  const mockValueDigests = new Map<string, Map<number, Uint8Array>>([
    ['org.iso.18013.5.1', new Map([[1, new Uint8Array([1, 2, 3, 4])]])],
  ]);

  const mockValidityInfo = {
    signed: toISODateTimeString(baseTime),
    validFrom: toISODateTimeString(baseTime),
    validUntil: toISODateTimeString(
      new Date(baseTime.getTime() + 24 * 60 * 60 * 1000)
    ),
    expectedUpdate: toISODateTimeString(
      new Date(baseTime.getTime() + 60 * 60 * 1000)
    ),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildValueDigests.mockResolvedValue(mockValueDigests);
    mockBuildValidityInfo.mockReturnValue(mockValidityInfo);
  });

  it('should create a mobile security object with all required fields', async () => {
    const docType = 'org.iso.18013.5.1.mDL';
    const nameSpaces: IssuerNameSpaces = new Map([
      ['org.iso.18013.5.1', [createIssuerSignedItemTag24(1)]],
    ]);

    const deviceKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
      y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
      alg: 'ES256',
    });

    const mso = await buildMobileSecurityObject({
      docType,
      nameSpaces,
      deviceKey,
      digestAlgorithm: 'SHA-256',
      validFrom,
      validUntil,
      expectedUpdate,
    });

    expect(mso).toEqual({
      version: '1.0',
      docType,
      digestAlgorithm: 'SHA-256',
      valueDigests: mockValueDigests,
      validityInfo: mockValidityInfo,
      deviceKeyInfo: {
        deviceKey,
      },
    });

    expect(mockBuildValueDigests).toHaveBeenCalledWith({
      nameSpaces,
      digestAlgorithm: 'SHA-256',
    });
    expect(mockBuildValidityInfo).toHaveBeenCalledWith({
      validFrom,
      validUntil,
      expectedUpdate,
    });
  });

  it('should create a mobile security object without expectedUpdate', async () => {
    const docType = 'org.iso.18013.5.1.mDL';
    const nameSpaces: IssuerNameSpaces = new Map([
      ['org.iso.18013.5.1', [createIssuerSignedItemTag24(1)]],
    ]);

    const deviceKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
      y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
      alg: 'ES256',
    });

    const mso = await buildMobileSecurityObject({
      docType,
      nameSpaces,
      deviceKey,
      digestAlgorithm: 'SHA-256',
      validFrom,
      validUntil,
      // expectedUpdate omitted
    });

    expect(mso).toEqual({
      version: '1.0',
      docType,
      digestAlgorithm: 'SHA-256',
      valueDigests: mockValueDigests,
      validityInfo: mockValidityInfo,
      deviceKeyInfo: {
        deviceKey,
      },
    });

    expect(mockBuildValidityInfo).toHaveBeenCalledWith({
      validFrom,
      validUntil,
      expectedUpdate: undefined,
    });
  });
});
