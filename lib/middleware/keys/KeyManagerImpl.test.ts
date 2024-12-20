import { COSEKey } from '@auth0/cose';
import { JWK } from '../../schemas/keys';
import { describe, expect, it, vi } from 'vitest';
import { KeyManagerImpl } from './KeyManagerImpl';
import { KeyPair } from './types';

describe('KeyManagerImpl', () => {
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

  const mockKeyConverter = {
    convertToCryptoKey: vi.fn(),
    convertToJWK: vi.fn(),
    convertToCoseKey: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockKeyConverter.convertToCryptoKey.mockResolvedValue(mockCryptoKey);
    mockKeyConverter.convertToJWK.mockResolvedValue(mockJWK);
    mockKeyConverter.convertToCoseKey.mockResolvedValue(mockCOSEKey);
  });

  it('should load private key', () => {
    const manager = new KeyManagerImpl(mockJWK, { ...mockKeyConverter });
    manager.loadPrivateKey(mockCryptoKey);
    // Private key is loaded internally, we'll test its effect through other methods
  });

  it('should get CryptoKey pair', async () => {
    const manager = new KeyManagerImpl(mockJWK, { ...mockKeyConverter });
    const result = await manager.getCryptoKeyPair();

    expect(mockKeyConverter.convertToCryptoKey).toHaveBeenCalledTimes(2);
    expect(mockKeyConverter.convertToCryptoKey).toHaveBeenCalledWith(
      mockJWK,
      'private'
    );
    expect(mockKeyConverter.convertToCryptoKey).toHaveBeenCalledWith(
      mockJWK,
      'public'
    );

    const expected: KeyPair<CryptoKey> = {
      privateKey: mockCryptoKey,
      publicKey: mockCryptoKey,
    };
    expect(result).toEqual(expected);
  });

  it('should get JWK pair', async () => {
    const manager = new KeyManagerImpl(mockJWK, { ...mockKeyConverter });
    const result = await manager.getJWKPair();

    expect(mockKeyConverter.convertToJWK).toHaveBeenCalledTimes(2);
    expect(mockKeyConverter.convertToJWK).toHaveBeenCalledWith(
      mockJWK,
      'private'
    );
    expect(mockKeyConverter.convertToJWK).toHaveBeenCalledWith(
      mockJWK,
      'public'
    );

    const expected: KeyPair<JsonWebKey> = {
      privateKey: mockJWK,
      publicKey: mockJWK,
    };
    expect(result).toEqual(expected);
  });

  it('should get COSE key pair', async () => {
    const manager = new KeyManagerImpl(mockJWK, { ...mockKeyConverter });
    const result = await manager.getCoseKeyPair();

    expect(mockKeyConverter.convertToCoseKey).toHaveBeenCalledTimes(2);
    expect(mockKeyConverter.convertToCoseKey).toHaveBeenCalledWith(
      mockJWK,
      'private'
    );
    expect(mockKeyConverter.convertToCoseKey).toHaveBeenCalledWith(
      mockJWK,
      'public'
    );

    const expected: KeyPair<COSEKey> = {
      privateKey: mockCOSEKey,
      publicKey: mockCOSEKey,
    };
    expect(result).toEqual(expected);
  });

  it('should handle key conversion errors', async () => {
    const manager = new KeyManagerImpl(mockJWK, { ...mockKeyConverter });
    mockKeyConverter.convertToCryptoKey.mockRejectedValue(
      new Error('Conversion failed')
    );

    await expect(manager.getCryptoKeyPair()).rejects.toThrow(
      'Conversion failed'
    );
  });
});
