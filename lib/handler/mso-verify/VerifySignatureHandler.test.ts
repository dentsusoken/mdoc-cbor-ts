import { describe, it, expect, vi } from 'vitest';
import { createDefaultVerifySignatureHandler } from './VerifySignatureHandler';
import { X509Parser } from '../../middleware/x509';
import { Headers, Sign1 } from '@auth0/cose';

describe('VerifySignatureHandler', () => {
  const mockPublicKey = new Uint8Array([1, 2, 3]);
  const mockCert = {
    publicKey: {
      export: vi.fn().mockResolvedValue(mockPublicKey),
    },
  };

  const mockX509Parser = {
    parse: vi.fn().mockReturnValue(mockCert),
  } as unknown as X509Parser;

  const mockSign1 = {
    protectedHeaders: new Map([
      [Headers.X5Chain.toString(), new Uint8Array([4, 5, 6])],
    ]),
    unprotectedHeaders: new Map(),
    verify: vi.fn().mockResolvedValue(undefined),
  } as unknown as Sign1;

  it('should verify signature successfully', async () => {
    const handler = createDefaultVerifySignatureHandler(mockX509Parser);
    await expect(handler(mockSign1)).resolves.toBeUndefined();

    expect(mockX509Parser.parse).toHaveBeenCalledWith(
      new Uint8Array([4, 5, 6])
    );
    expect(mockCert.publicKey.export).toHaveBeenCalled();
    expect(mockSign1.verify).toHaveBeenCalledWith(mockPublicKey);
  });

  it('should handle array of certificates', async () => {
    const mockSign1WithMultipleCerts = {
      ...mockSign1,
      protectedHeaders: new Map([
        [
          Headers.X5Chain.toString(),
          [new Uint8Array([4, 5, 6]), new Uint8Array([7, 8, 9])],
        ],
      ]),
    } as unknown as Sign1;

    const handler = createDefaultVerifySignatureHandler(mockX509Parser);
    await handler(mockSign1WithMultipleCerts);

    expect(mockX509Parser.parse).toHaveBeenCalledWith(
      new Uint8Array([4, 5, 6])
    );
    expect(mockX509Parser.parse).toHaveBeenCalledWith(
      new Uint8Array([7, 8, 9])
    );
  });

  it('should throw error when verification fails', async () => {
    const mockSign1WithError = {
      ...mockSign1,
      verify: vi.fn().mockRejectedValue(new Error('Verification failed')),
    } as unknown as Sign1;

    const handler = createDefaultVerifySignatureHandler(mockX509Parser);
    await expect(handler(mockSign1WithError)).rejects.toThrow(
      'Verification failed'
    );
  });
});
