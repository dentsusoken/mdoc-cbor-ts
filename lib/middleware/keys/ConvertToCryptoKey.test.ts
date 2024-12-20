import { COSEKey } from '@auth0/cose';
import { JWK } from '../../schemas/keys';
import { describe, expect, it, vi } from 'vitest';
import { defaultConvertToCryptoKey } from './ConvertToCryptoKey';
import * as jwkModule from './ConvertToJWK';

describe('defaultConvertToCryptoKey', () => {
  const mockJWK: JWK = {
    kty: 'EC',
    crv: 'P-256',
    x: 'test-x',
    y: 'test-y',
    d: 'test-d',
    alg: 'ES256',
  };

  const mockCryptoKey = {
    type: 'private',
    algorithm: { name: 'ECDSA', namedCurve: 'P-256' },
    extractable: true,
    usages: ['sign'],
  } as CryptoKey;

  const mockCOSEKey = {
    toJWK: () => mockJWK,
  } as unknown as COSEKey;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(crypto.subtle, 'importKey').mockResolvedValue(mockCryptoKey);
    vi.spyOn(jwkModule, 'defaultConvertToJWK').mockResolvedValue(mockJWK);
  });

  it('should convert JWK to private CryptoKey', async () => {
    const result = await defaultConvertToCryptoKey(mockJWK, 'private');
    expect(crypto.subtle.importKey).toHaveBeenCalledWith(
      'jwk',
      mockJWK,
      'ES256',
      true,
      ['sign']
    );
    expect(result).toEqual(mockCryptoKey);
  });

  it('should convert JWK to public CryptoKey', async () => {
    const result = await defaultConvertToCryptoKey(mockJWK, 'public');
    expect(crypto.subtle.importKey).toHaveBeenCalledWith(
      'jwk',
      mockJWK,
      'ES256',
      true,
      ['verify']
    );
    expect(result).toEqual(mockCryptoKey);
  });

  it('should convert COSEKey to CryptoKey', async () => {
    const result = await defaultConvertToCryptoKey(mockCOSEKey, 'private');
    expect(jwkModule.defaultConvertToJWK).toHaveBeenCalledWith(
      mockCOSEKey,
      'private'
    );
    expect(crypto.subtle.importKey).toHaveBeenCalled();
    expect(result).toEqual(mockCryptoKey);
  });

  it('should pass through CryptoKey', async () => {
    const result = await defaultConvertToCryptoKey(mockCryptoKey, 'private');
    expect(jwkModule.defaultConvertToJWK).toHaveBeenCalledWith(
      mockCryptoKey,
      'private'
    );
    expect(result).toEqual(mockCryptoKey);
  });

  it('should throw error when alg is undefined', async () => {
    const jwkWithoutAlg = { ...mockJWK, alg: undefined };
    vi.spyOn(jwkModule, 'defaultConvertToJWK').mockResolvedValue(jwkWithoutAlg);
    await expect(defaultConvertToCryptoKey(mockJWK, 'private')).rejects.toThrow(
      'alg is undefined.'
    );
  });

  it('should throw error when conversion fails', async () => {
    vi.spyOn(crypto.subtle, 'importKey').mockRejectedValue(
      new Error('Mock error')
    );
    await expect(defaultConvertToCryptoKey(mockJWK, 'private')).rejects.toThrow(
      'Failed to convert to CryptoKey.'
    );
  });
});
