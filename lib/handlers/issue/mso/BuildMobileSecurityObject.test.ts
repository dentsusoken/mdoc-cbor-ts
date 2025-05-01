import { COSEKey } from '@auth0/cose';
import { TypedMap } from '@jfromaniello/typedmap';
import { describe, expect, it, vi } from 'vitest';
import { ByteString } from '../../../cbor';
import { Configuration } from '../../../conf/Configuration';
import { IssuerNameSpaces, IssuerSignedItemBytes } from '../../../schemas/mdoc';
import { createMobileSecurityObjectBuilder } from './BuildMobileSecurityObject';

describe('createMobileSecurityObjectBuilder', () => {
  const mockDigest = Buffer.from('test-digest');
  const mockValidityInfo = {
    signed: new Date(1000000000000),
    validFrom: new Date(1000000000000),
    validUntil: new Date(1000000000000 + 86400000),
  };

  const mockBuildValueDigests = vi.fn().mockResolvedValue({
    'org.iso.18013.5.1': {
      1: mockDigest,
    },
  });

  const mockBuildValidityInfo = vi.fn().mockReturnValue(mockValidityInfo);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a mobile security object', async () => {
    const configuration = new Configuration({
      digestAlgorithm: 'SHA-256',
    });

    const docType = 'org.iso.18013.5.1.mDL';
    const nameSpaces = {
      'org.iso.18013.5.1': [
        new ByteString(
          new TypedMap(
            Object.entries({
              digestID: 1,
              random: Buffer.from('test-random'),
              elementIdentifier: 'test-element',
              elementValue: 'test-value',
            })
          )
        ) as IssuerSignedItemBytes,
      ],
    } as IssuerNameSpaces;

    const deviceKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      x: 'test-x',
      y: 'test-y',
      d: 'test-d',
    });

    const builder = createMobileSecurityObjectBuilder({
      configuration,
      buildValueDigests: mockBuildValueDigests,
      buildValidityInfo: mockBuildValidityInfo,
    });

    const mso = await builder(docType, nameSpaces, deviceKey);

    expect(mso.esMap).toEqual(
      new TypedMap(
        Object.entries({
          docType,
          version: '1.0',
          digestAlgorithm: 'SHA-256',
          valueDigests: {
            'org.iso.18013.5.1': {
              1: mockDigest,
            },
          },
          validityInfo: mockValidityInfo,
          deviceKeyInfo: {
            deviceKey: Object.fromEntries(deviceKey.entries()),
          },
        })
      ).esMap
    );

    expect(mockBuildValueDigests).toHaveBeenCalledWith(nameSpaces, 'SHA-256');
    expect(mockBuildValidityInfo).toHaveBeenCalled();
  });

  it('should handle multiple namespaces', async () => {
    const configuration = new Configuration({
      digestAlgorithm: 'SHA-256',
    });

    const docType = 'org.iso.18013.5.1.mDL';
    const nameSpaces = {
      'org.iso.18013.5.1': [
        new ByteString(
          new TypedMap(
            Object.entries({
              digestID: 1,
              random: Buffer.from('test-random-1'),
              elementIdentifier: 'test-element-1',
              elementValue: 'test-value-1',
            })
          )
        ) as IssuerSignedItemBytes,
      ],
      'org.iso.18013.5.2': [
        new ByteString(
          new TypedMap(
            Object.entries({
              digestID: 1,
              random: Buffer.from('test-random-2'),
              elementIdentifier: 'test-element-2',
              elementValue: 'test-value-2',
            })
          )
        ) as IssuerSignedItemBytes,
      ],
    } as IssuerNameSpaces;

    const deviceKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      x: 'test-x',
      y: 'test-y',
      d: 'test-d',
    });

    const mockValueDigests = {
      'org.iso.18013.5.1': {
        1: mockDigest,
      },
      'org.iso.18013.5.2': {
        1: mockDigest,
      },
    };

    mockBuildValueDigests.mockResolvedValueOnce(mockValueDigests);

    const builder = createMobileSecurityObjectBuilder({
      configuration,
      buildValueDigests: mockBuildValueDigests,
      buildValidityInfo: mockBuildValidityInfo,
    });

    const mso = await builder(docType, nameSpaces, deviceKey);

    expect(mso.esMap).toEqual(
      new TypedMap(
        Object.entries({
          docType,
          version: '1.0',
          digestAlgorithm: 'SHA-256',
          valueDigests: mockValueDigests,
          validityInfo: mockValidityInfo,
          deviceKeyInfo: {
            deviceKey: Object.fromEntries(deviceKey.entries()),
          },
        })
      ).esMap
    );

    expect(mockBuildValueDigests).toHaveBeenCalledWith(nameSpaces, 'SHA-256');
    expect(mockBuildValidityInfo).toHaveBeenCalled();
  });
});
