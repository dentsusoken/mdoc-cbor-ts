import { describe, expect, it, vi } from 'vitest';
import { MsoVerifyHandlerImpl } from './MsoVerifyHandlerImpl';
import { X509Parser } from '../../middleware/x509/X509Parser';
import { Sign1, Headers } from '@auth0/cose';
import { encode } from 'cbor-x';
import { TypedTag } from '../../cbor';
import { Buffer } from 'buffer';
import { RawIssuerSigned } from '../../schemas/issuerSignedSchema';

describe('MsoVerifyHandlerImpl', () => {
  const mockCert = {
    publicKey: {
      export: vi.fn().mockReturnValue({
        kty: 'EC',
        crv: 'P-256',
        x: 'test',
        y: 'test',
      }),
    },
  };

  const mockX509Parser: X509Parser = {
    parse: vi.fn().mockResolvedValue(mockCert),
  };

  const mockVerifyError = new Error('Signature verification failed');
  const mockError = new Error('Unknown error');

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
    protectedHeaders: new Map<number | string, Uint8Array>([
      [1, new Uint8Array([1, 2, 3])],
      [Headers.X5Chain.toString(), new Uint8Array([4, 5, 6])],
    ]),
    unprotectedHeaders: new Map(),
    payload: mockPayload,
    signature: new Uint8Array([1, 2, 3]),
    verify: vi.fn().mockResolvedValue(undefined),
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

  const mockNameSpaces = {
    testNamespace: [mockDisclosureItem],
  };

  const mockIssuerSigned: RawIssuerSigned = {
    nameSpaces: mockNameSpaces,
    issuerAuth: mockSign1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should verify successfully when all checks pass', async () => {
    const handler = new MsoVerifyHandlerImpl(mockX509Parser, {});
    const result = await handler.verify(mockIssuerSigned);
    expect(result).toEqual({ verified: true });
  });

  it('should return failure when signature verification fails', async () => {
    mockX509Parser.parse = vi.fn().mockRejectedValue(mockVerifyError);
    const handler = new MsoVerifyHandlerImpl(mockX509Parser, {});
    const result = await handler.verify(mockIssuerSigned);
    expect(result).toEqual({ verified: false, error: mockVerifyError });
  });

  it('should use custom handlers when provided', async () => {
    const mockVerifySignatureHandler = vi.fn().mockResolvedValue(undefined);
    const mockVerifyDigestHandler = vi.fn().mockResolvedValue(undefined);
    const handler = new MsoVerifyHandlerImpl(mockX509Parser, {
      verifySignatureHandler: mockVerifySignatureHandler,
      verifyDigestHandler: mockVerifyDigestHandler,
    });
    await handler.verify(mockIssuerSigned);
    expect(mockVerifySignatureHandler).toHaveBeenCalledWith(mockSign1);
    expect(mockVerifyDigestHandler).toHaveBeenCalledWith(
      mockSign1,
      mockNameSpaces
    );
  });

  it('should handle unknown errors', async () => {
    mockX509Parser.parse = vi.fn().mockRejectedValue(mockError);
    const handler = new MsoVerifyHandlerImpl(mockX509Parser, {});
    const result = await handler.verify(mockIssuerSigned);
    expect(result).toEqual({ verified: false, error: mockError });
  });
});
