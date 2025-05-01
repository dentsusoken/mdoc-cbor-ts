import {
  Algorithms,
  COSEKey,
  Headers,
  ProtectedHeaders,
  Sign1,
} from '@auth0/cose';
import { describe, expect, it, vi } from 'vitest';
import { createDeviceSignedBuilder } from './BuildDeviceSigned';

describe('createDeviceSignedBuilder', async () => {
  const mockSign1 = {
    getContentForEncoding: () => Buffer.from('test-device-signature'),
  } as unknown as Sign1;

  const mockBuildProtectedHeaders = vi.fn().mockReturnValue({
    get: vi
      .fn()
      .mockReturnValue(
        new ProtectedHeaders([[Headers.Algorithm, Algorithms.ES256]])
      ), // ES256
  });

  const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
    crv: 'P-256',
  });

  const jwk = { ...privateKey.toJWK(), kid: 'test-kid' };

  beforeEach(() => {
    vi.spyOn(Sign1, 'sign').mockResolvedValue(mockSign1);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create device signed data', async () => {
    const coseKey = COSEKey.fromJWK(jwk);

    const builder = createDeviceSignedBuilder({
      buildProtectedHeaders: mockBuildProtectedHeaders,
    });

    const deviceSigned = await builder(coseKey);

    expect(deviceSigned).toEqual({
      nameSpaces: expect.any(Object),
      deviceAuth: {
        deviceSignature: Buffer.from('test-device-signature'),
      },
    });

    expect(mockBuildProtectedHeaders).toHaveBeenCalledWith(coseKey);
    expect(Sign1.sign).toHaveBeenCalledWith(
      mockBuildProtectedHeaders(coseKey),
      new Map(),
      null,
      expect.any(Object)
    );
  });

  it('should handle different COSE keys', async () => {
    const coseKey = COSEKey.fromJWK(jwk);

    const builder = createDeviceSignedBuilder({
      buildProtectedHeaders: mockBuildProtectedHeaders,
    });

    const deviceSigned = await builder(coseKey);

    expect(deviceSigned).toEqual({
      nameSpaces: expect.any(Object),
      deviceAuth: {
        deviceSignature: Buffer.from('test-device-signature'),
      },
    });

    expect(mockBuildProtectedHeaders).toHaveBeenCalledWith(coseKey);
    expect(Sign1.sign).toHaveBeenCalledWith(
      mockBuildProtectedHeaders(coseKey),
      new Map(),
      null,
      expect.any(Object)
    );
  });
});
