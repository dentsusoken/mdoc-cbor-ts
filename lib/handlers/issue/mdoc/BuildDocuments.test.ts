import { COSEKey } from '@auth0/cose';
import { describe, expect, it, vi } from 'vitest';
import { MSOIssueHandler } from '../mso';
import { createDocumentsBuilder } from './BuildDocuments';

describe('createDocumentsBuilder', () => {
  const mockIssuerAuth = {
    getContentForEncoding: vi
      .fn()
      .mockReturnValue(Buffer.from('test-issuer-auth')),
  };

  const mockIssuerNameSpaces1 = {
    'org.iso.18013.5.1': [
      {
        data: {
          digestID: 1,
          random: Buffer.from('test-random'),
          elementIdentifier: 'test-element',
          elementValue: 'test-value',
        },
      },
    ],
  };

  const mockIssuerNameSpaces2 = {
    'org.iso.18013.5.2': [
      {
        data: {
          digestID: 1,
          random: Buffer.from('test-random-2'),
          elementIdentifier: 'test-element-2',
          elementValue: 'test-value-2',
        },
      },
    ],
  };

  const mockBuildIssuerNameSpaces = vi
    .fn()
    .mockReturnValue(mockIssuerNameSpaces1);

  const mockBuildDeviceSigned = vi.fn().mockResolvedValue({
    nameSpaces: {
      'org.iso.18013.5.1': {
        data: {
          digestID: 1,
          random: Buffer.from('test-random'),
          elementIdentifier: 'test-element',
          elementValue: 'test-value',
        },
      },
    },
    deviceAuth: Buffer.from('test-device-auth'),
  });

  const mockMsoIssueHandler = {
    issue: vi.fn().mockResolvedValue(mockIssuerAuth),
  } as unknown as MSOIssueHandler;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create documents', async () => {
    const data = {
      'org.iso.18013.5.1.mDL': {
        'org.iso.18013.5.1': {
          data: {
            digestID: 1,
            random: Buffer.from('test-random'),
            elementIdentifier: 'test-element',
            elementValue: 'test-value',
          },
        },
      },
    };

    const deviceKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      x: 'test-x',
      y: 'test-y',
      d: 'test-d',
    });

    const privateKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      x: 'test-x',
      y: 'test-y',
      d: 'test-d',
    });

    const builder = createDocumentsBuilder({
      buildIssuerNameSpaces: mockBuildIssuerNameSpaces,
      buildDeviceSigned: mockBuildDeviceSigned,
      msoIssueHandler: mockMsoIssueHandler,
    });

    const documents = await builder(data, deviceKey, privateKey);

    expect(documents).toHaveLength(1);
    expect(documents[0]).toEqual({
      docType: 'org.iso.18013.5.1.mDL',
      issuerSigned: {
        nameSpaces: mockIssuerNameSpaces1,
        issuerAuth: mockIssuerAuth,
      },
      deviceSigned: await mockBuildDeviceSigned(privateKey),
    });

    expect(mockBuildIssuerNameSpaces).toHaveBeenCalledWith(
      data['org.iso.18013.5.1.mDL']
    );
    expect(mockMsoIssueHandler.issue).toHaveBeenCalledWith(
      'org.iso.18013.5.1.mDL',
      mockIssuerNameSpaces1,
      deviceKey
    );
    expect(mockBuildDeviceSigned).toHaveBeenCalledWith(privateKey);
  });

  it('should handle multiple documents', async () => {
    const data = {
      'org.iso.18013.5.1.mDL': {
        'org.iso.18013.5.1': {
          data: {
            digestID: 1,
            random: Buffer.from('test-random-1'),
            elementIdentifier: 'test-element-1',
            elementValue: 'test-value-1',
          },
        },
      },
      'org.iso.18013.5.2.mDL': {
        'org.iso.18013.5.2': {
          data: {
            digestID: 1,
            random: Buffer.from('test-random-2'),
            elementIdentifier: 'test-element-2',
            elementValue: 'test-value-2',
          },
        },
      },
    };

    const deviceKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      x: 'test-x',
      y: 'test-y',
      d: 'test-d',
    });

    const privateKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      x: 'test-x',
      y: 'test-y',
      d: 'test-d',
    });

    mockBuildIssuerNameSpaces
      .mockReturnValueOnce(mockIssuerNameSpaces1)
      .mockReturnValueOnce(mockIssuerNameSpaces2);

    const builder = createDocumentsBuilder({
      buildIssuerNameSpaces: mockBuildIssuerNameSpaces,
      buildDeviceSigned: mockBuildDeviceSigned,
      msoIssueHandler: mockMsoIssueHandler,
    });

    const documents = await builder(data, deviceKey, privateKey);

    expect(documents).toHaveLength(2);
    expect(documents[0].docType).toBe('org.iso.18013.5.1.mDL');
    expect(documents[1].docType).toBe('org.iso.18013.5.2.mDL');

    expect(mockBuildIssuerNameSpaces).toHaveBeenCalledTimes(2);
    expect(mockMsoIssueHandler.issue).toHaveBeenCalledTimes(2);
    expect(mockBuildDeviceSigned).toHaveBeenCalledTimes(2);
  });
});
