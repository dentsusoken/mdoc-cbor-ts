import { COSEKey } from '@auth0/cose';
import { JWK } from '../../schemas/keys';
import { describe, expect, it, vi } from 'vitest';
import { defaultConvertToCoseKey } from './ConvertToCoseKey';
import * as jwkModule from './ConvertToJWK';

describe('defaultConvertToCoseKey', () => {
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
    vi.spyOn(COSEKey, 'fromJWK').mockReturnValue(mockCOSEKey);
    vi.spyOn(jwkModule, 'defaultConvertToJWK').mockResolvedValue(mockJWK);
  });

  it('should convert JWK to private COSEKey', async () => {
    const result = await defaultConvertToCoseKey(mockJWK, 'private');
    expect(jwkModule.defaultConvertToJWK).toHaveBeenCalledWith(
      mockJWK,
      'private'
    );
    expect(COSEKey.fromJWK).toHaveBeenCalledWith(mockJWK);
    expect(result).toEqual(mockCOSEKey);
  });

  it('should convert JWK to public COSEKey', async () => {
    const result = await defaultConvertToCoseKey(mockJWK, 'public');
    expect(jwkModule.defaultConvertToJWK).toHaveBeenCalledWith(
      mockJWK,
      'public'
    );
    expect(COSEKey.fromJWK).toHaveBeenCalled();
    expect(result).toEqual(mockCOSEKey);
  });

  it('should convert CryptoKey to COSEKey', async () => {
    const result = await defaultConvertToCoseKey(mockCryptoKey, 'private');
    expect(jwkModule.defaultConvertToJWK).toHaveBeenCalledWith(
      mockCryptoKey,
      'private'
    );
    expect(COSEKey.fromJWK).toHaveBeenCalled();
    expect(result).toEqual(mockCOSEKey);
  });

  it('should pass through COSEKey for private key', async () => {
    const result = await defaultConvertToCoseKey(mockCOSEKey, 'private');
    expect(jwkModule.defaultConvertToJWK).toHaveBeenCalledWith(
      mockCOSEKey,
      'private'
    );
    expect(result).toEqual(mockCOSEKey);
  });

  it('should pass through COSEKey for public key', async () => {
    const result = await defaultConvertToCoseKey(mockCOSEKey, 'public');
    expect(jwkModule.defaultConvertToJWK).toHaveBeenCalledWith(
      mockCOSEKey,
      'public'
    );
    expect(result).toEqual(mockCOSEKey);
  });

  it('should throw error when conversion fails', async () => {
    vi.spyOn(COSEKey, 'fromJWK').mockImplementation(() => {
      throw new Error('Mock error');
    });
    await expect(defaultConvertToCoseKey(mockJWK, 'private')).rejects.toThrow(
      'Failed to convert to CoseKey.'
    );
  });
});
