import { describe, expect, it, vi } from 'vitest';
import { defaultVerifyDigestHandler } from './VerifyDigestHandler';
import { Sign1 } from '@auth0/cose';
import { TypedTag } from '../../cbor';
import { Buffer } from 'buffer';
import { RawNameSpaces } from '../../schemas';
import { encode } from 'cbor-x';

describe('VerifyDigestHandler', () => {
  const mockDigest = new Uint8Array([1, 2, 3]);
  const mockSubtleDigest = vi
    .spyOn(crypto.subtle, 'digest')
    .mockResolvedValue(mockDigest.buffer);

  const mockPayload = encode({
    version: '1.0',
    docType: 'org.iso.18013.5.1',
    digestAlgorithm: 'SHA-256',
    validityInfo: {
      signed: Buffer.from('2024-01-01'),
      validFrom: Buffer.from('2024-01-01'),
      validUntil: Buffer.from('2024-12-31'),
    },
    valueDigests: {
      testNamespace: {
        '1': mockDigest.buffer,
      },
    },
  });

  const mockSign1: Sign1 = {
    protectedHeaders: new Map([[1, new Uint8Array([1, 2, 3])]]),
    unprotectedHeaders: new Map(),
    payload: mockPayload,
    signature: new Uint8Array([1, 2, 3]),
  } as unknown as Sign1;

  const mockDisclosureItem = new TypedTag(
    {
      random: Buffer.from([1, 2, 3]),
      digestID: 1,
      elementIdentifier: 'test',
      elementValue: 'test',
    },
    24
  );

  const mockNameSpaces: RawNameSpaces = {
    testNamespace: [mockDisclosureItem],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should verify digests successfully', async () => {
    await expect(
      defaultVerifyDigestHandler(mockSign1, mockNameSpaces)
    ).resolves.toBeUndefined();

    expect(crypto.subtle.digest).toHaveBeenCalledWith(
      'SHA-256',
      expect.any(Uint8Array)
    );
  });

  it('should throw error when digest is not found', async () => {
    const mockPayloadWithoutDigest = encode({
      version: '1.0',
      docType: 'org.iso.18013.5.1',
      digestAlgorithm: 'SHA-256',
      validityInfo: {
        signed: Buffer.from('2024-01-01'),
        validFrom: Buffer.from('2024-01-01'),
        validUntil: Buffer.from('2024-12-31'),
      },
      valueDigests: {
        testNamespace: {},
      },
    });

    const mockSign1WithoutDigest = {
      ...mockSign1,
      payload: mockPayloadWithoutDigest,
    } as unknown as Sign1;

    await expect(
      defaultVerifyDigestHandler(mockSign1WithoutDigest, mockNameSpaces)
    ).rejects.toThrow('Digest for 1 not found');
  });

  it('should throw error when digests do not match', async () => {
    const differentDigest = new Uint8Array([4, 5, 6]);
    const mockPayloadWithDifferentDigest = encode({
      version: '1.0',
      docType: 'org.iso.18013.5.1',
      digestAlgorithm: 'SHA-256',
      validityInfo: {
        signed: Buffer.from('2024-01-01'),
        validFrom: Buffer.from('2024-01-01'),
        validUntil: Buffer.from('2024-12-31'),
      },
      valueDigests: {
        testNamespace: {
          '1': differentDigest.buffer,
        },
      },
    });

    const mockSign1WithDifferentDigest = {
      ...mockSign1,
      payload: mockPayloadWithDifferentDigest,
    } as unknown as Sign1;

    await expect(
      defaultVerifyDigestHandler(mockSign1WithDifferentDigest, mockNameSpaces)
    ).rejects.toThrow('Digest mismatch for 1');
  });

  it('should handle multiple namespaces and values', async () => {
    const mockDisclosureItem2 = new TypedTag(
      {
        random: Buffer.from([4, 5, 6]),
        digestID: 2,
        elementIdentifier: 'test2',
        elementValue: 'test2',
      },
      24
    );

    const mockNameSpacesMultiple: RawNameSpaces = {
      namespace1: [mockDisclosureItem],
      namespace2: [mockDisclosureItem2],
    };

    const mockPayloadMultiple = encode({
      version: '1.0',
      docType: 'org.iso.18013.5.1',
      digestAlgorithm: 'SHA-256',
      validityInfo: {
        signed: Buffer.from('2024-01-01'),
        validFrom: Buffer.from('2024-01-01'),
        validUntil: Buffer.from('2024-12-31'),
      },
      valueDigests: {
        namespace1: {
          '1': mockDigest.buffer,
        },
        namespace2: {
          '2': mockDigest.buffer,
        },
      },
    });

    const mockSign1Multiple = {
      ...mockSign1,
      payload: mockPayloadMultiple,
    } as unknown as Sign1;

    await expect(
      defaultVerifyDigestHandler(mockSign1Multiple, mockNameSpacesMultiple)
    ).resolves.toBeUndefined();

    expect(crypto.subtle.digest).toHaveBeenCalledTimes(2);
  });
});
