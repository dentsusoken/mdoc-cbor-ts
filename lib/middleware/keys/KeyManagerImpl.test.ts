import { COSEKey } from '@auth0/cose';
import { JWK } from '../../schemas/keys';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { KeyManagerImpl } from './KeyManagerImpl';
import { KeyConverterImpl } from './KeyConverterImpl';
import { KeyPair } from './types';

describe('KeyManagerImpl', () => {
  let mockCryptoKey: CryptoKey;
  let mockCOSEKey: COSEKey;

  const mockJWK: JWK = {
    kty: 'EC',
    crv: 'P-256',
    x: 'test-x',
    y: 'test-y',
    d: 'test-d',
    alg: 'ES256',
    kid: 'test-kid',
  };

  const mockKeyConverter = {
    convertToCryptoKey: vi.fn(),
    convertToJWK: vi.fn(),
    convertToCoseKey: vi.fn(),
  };

  const mockRandomUUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(mockRandomUUID);

    // Generate actual CryptoKey
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign']
    );
    mockCryptoKey = keyPair.privateKey;

    // Generate actual COSEKey
    mockCOSEKey = await COSEKey.fromJWK(mockJWK);

    (mockKeyConverter.convertToCryptoKey as any).mockResolvedValue(
      mockCryptoKey
    );
    (mockKeyConverter.convertToJWK as any).mockResolvedValue(mockJWK);
    (mockKeyConverter.convertToCoseKey as any).mockResolvedValue(mockCOSEKey);
  });

  it('should generate kid when not provided in JWK', () => {
    const jwkWithoutKid = { ...mockJWK };
    delete jwkWithoutKid.kid;
    const manager = new KeyManagerImpl(
      jwkWithoutKid,
      mockKeyConverter as KeyConverterImpl
    );
    expect(crypto.randomUUID).toHaveBeenCalled();
  });

  it('should use existing kid from JWK', () => {
    const manager = new KeyManagerImpl(
      mockJWK,
      mockKeyConverter as KeyConverterImpl
    );
    expect(crypto.randomUUID).not.toHaveBeenCalled();
  });

  it('should generate kid for CryptoKey', () => {
    const manager = new KeyManagerImpl(
      mockCryptoKey,
      mockKeyConverter as KeyConverterImpl
    );
    expect(crypto.randomUUID).toHaveBeenCalled();
  });

  it('should use existing kid from COSEKey', async () => {
    const manager = new KeyManagerImpl(
      mockCOSEKey,
      mockKeyConverter as KeyConverterImpl
    );
    expect(crypto.randomUUID).not.toHaveBeenCalled();
  });

  it('should generate kid when not provided in COSEKey', async () => {
    const jwkWithoutKid = { ...mockJWK };
    delete jwkWithoutKid.kid;
    const coseKeyWithoutKid = await COSEKey.fromJWK(jwkWithoutKid);
    const manager = new KeyManagerImpl(
      coseKeyWithoutKid,
      mockKeyConverter as KeyConverterImpl
    );
    expect(crypto.randomUUID).toHaveBeenCalled();
  });

  it('should load private key', () => {
    const manager = new KeyManagerImpl(
      mockJWK,
      mockKeyConverter as KeyConverterImpl
    );
    manager.loadPrivateKey(mockCryptoKey);
    // Private key is loaded internally, we'll test its effect through other methods
  });

  it('should get CryptoKey pair', async () => {
    const manager = new KeyManagerImpl(
      mockJWK,
      mockKeyConverter as KeyConverterImpl
    );
    const result = await manager.getCryptoKeyPair();

    expect(mockKeyConverter.convertToCryptoKey).toHaveBeenCalledTimes(2);
    expect(mockKeyConverter.convertToCryptoKey).toHaveBeenCalledWith(
      mockJWK,
      'private',
      mockJWK.kid
    );
    expect(mockKeyConverter.convertToCryptoKey).toHaveBeenCalledWith(
      mockJWK,
      'public',
      mockJWK.kid
    );

    const expected: KeyPair<CryptoKey> = {
      privateKey: mockCryptoKey,
      publicKey: mockCryptoKey,
    };
    expect(result).toEqual(expected);
  });

  it('should get JWK pair', async () => {
    const manager = new KeyManagerImpl(
      mockJWK,
      mockKeyConverter as KeyConverterImpl
    );
    const result = await manager.getJWKPair();

    expect(mockKeyConverter.convertToJWK).toHaveBeenCalledTimes(2);
    expect(mockKeyConverter.convertToJWK).toHaveBeenCalledWith(
      mockJWK,
      'private',
      mockJWK.kid
    );
    expect(mockKeyConverter.convertToJWK).toHaveBeenCalledWith(
      mockJWK,
      'public',
      mockJWK.kid
    );

    const expected: KeyPair<JsonWebKey> = {
      privateKey: mockJWK,
      publicKey: mockJWK,
    };
    expect(result).toEqual(expected);
  });

  it('should get COSE key pair', async () => {
    const manager = new KeyManagerImpl(
      mockJWK,
      mockKeyConverter as KeyConverterImpl
    );
    const result = await manager.getCoseKeyPair();

    expect(mockKeyConverter.convertToCoseKey).toHaveBeenCalledTimes(2);
    expect(mockKeyConverter.convertToCoseKey).toHaveBeenCalledWith(
      mockJWK,
      'private',
      mockJWK.kid
    );
    expect(mockKeyConverter.convertToCoseKey).toHaveBeenCalledWith(
      mockJWK,
      'public',
      mockJWK.kid
    );

    const expected: KeyPair<COSEKey> = {
      privateKey: mockCOSEKey,
      publicKey: mockCOSEKey,
    };
    expect(result).toEqual(expected);
  });

  it('should handle key conversion errors', async () => {
    const manager = new KeyManagerImpl(
      mockJWK,
      mockKeyConverter as KeyConverterImpl
    );
    (mockKeyConverter.convertToCryptoKey as any).mockRejectedValue(
      new Error('Conversion failed')
    );

    await expect(manager.getCryptoKeyPair()).rejects.toThrow(
      'Conversion failed'
    );
  });
});
