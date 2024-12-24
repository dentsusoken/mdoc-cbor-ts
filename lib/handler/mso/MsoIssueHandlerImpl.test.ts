import { describe, expect, it, vi } from 'vitest';
import { MsoIssueHandlerImpl } from './MsoIssueHandlerImpl';
import { KeyManager } from '../../middleware/keys';
import { X509Generator } from '../../middleware/x509';
import { NameSpace } from '../../schemas';
import { COSEKey, Sign1, COSEKeyParam } from '@auth0/cose';
import { encode } from 'cbor-x';
import { Tag } from 'cbor-x';

describe('MsoIssueHandlerImpl', () => {
  const mockConfig = {
    HASH_ALGORITHM: 'SHA-256' as const,
    EXPIRATION_DELTA_HOURS: 24,
  };

  const mockNameSpace: NameSpace = {
    'org.iso.18013.5.1': [
      new Tag(
        {
          digestID: 1,
          random: Buffer.from('random1'),
          elementIdentifier: 'test-element-1',
          elementValue: 'test-value-1',
        },
        24
      ),
    ],
  };

  const mockCryptoKey = {
    type: 'private',
    algorithm: { name: 'ECDSA', namedCurve: 'P-256' },
    extractable: true,
    usages: ['sign'],
  } as CryptoKey;

  const mockCOSEKey = new COSEKey();
  mockCOSEKey.set(COSEKeyParam.Algorithm, -7); // ES256
  mockCOSEKey.set(COSEKeyParam.KeyID, new Uint8Array([1, 2, 3, 4]));

  const mockKeyManager: KeyManager = {
    getCryptoKeyPair: vi.fn().mockResolvedValue({
      privateKey: mockCryptoKey,
      publicKey: mockCryptoKey,
    }),
    getCoseKeyPair: vi.fn().mockResolvedValue({
      privateKey: mockCOSEKey,
      publicKey: mockCOSEKey,
    }),
    getJWKPair: vi.fn(),
    loadPrivateKey: vi.fn(),
  };

  const mockX509Generator: X509Generator = {
    generate: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
  };

  const mockSign1 = {
    sign: vi.fn().mockResolvedValue(new Uint8Array([5, 6, 7, 8])),
  };
  vi.spyOn(Sign1, 'sign').mockImplementation(mockSign1.sign);

  it('should issue MSO with default generators', async () => {
    const handler = new MsoIssueHandlerImpl(
      mockKeyManager,
      mockX509Generator,
      mockConfig
    );

    const result = await handler.issue(mockNameSpace);

    // KeyManagerからキーペアを取得していることを確認
    expect(mockKeyManager.getCoseKeyPair).toHaveBeenCalled();
    expect(mockKeyManager.getCryptoKeyPair).toHaveBeenCalled();

    // X509証明書を生成していることを確認
    expect(mockX509Generator.generate).toHaveBeenCalledWith('der');

    // Sign1.signが正しい引数で呼び出されていることを確認
    expect(mockSign1.sign).toHaveBeenCalled();
    expect(result).toEqual(new Uint8Array([5, 6, 7, 8]));
  });

  it('should issue MSO with custom validFrom', async () => {
    const handler = new MsoIssueHandlerImpl(
      mockKeyManager,
      mockX509Generator,
      mockConfig
    );

    const validFrom = new Date('2024-01-02T00:00:00Z');
    const result = await handler.issue(mockNameSpace, validFrom);

    // KeyManagerからキーペアを取得していることを確認
    expect(mockKeyManager.getCoseKeyPair).toHaveBeenCalled();
    expect(mockKeyManager.getCryptoKeyPair).toHaveBeenCalled();

    // X509証明書を生成していることを確認
    expect(mockX509Generator.generate).toHaveBeenCalledWith('der');

    // Sign1.signが正しい引数で呼び出されていることを確認
    expect(mockSign1.sign).toHaveBeenCalled();
    expect(result).toEqual(new Uint8Array([5, 6, 7, 8]));
  });

  it('should use custom generators when provided', async () => {
    const mockHashMapGenerator = vi.fn().mockResolvedValue({});
    const mockMsoPayloadGenerator = vi.fn().mockResolvedValue({});
    const mockProtectHeaderGenerator = {
      generate: vi.fn().mockReturnValue({}),
    };
    const mockUnprotectHeaderGenerator = {
      generate: vi.fn().mockResolvedValue({}),
    };

    const handler = new MsoIssueHandlerImpl(
      mockKeyManager,
      mockX509Generator,
      mockConfig,
      {
        hashMapGenerator: mockHashMapGenerator,
        msoPayloadGenerator: mockMsoPayloadGenerator,
        protectHeaderGenerator: mockProtectHeaderGenerator,
        unprotectHeaderGenerator: mockUnprotectHeaderGenerator,
      }
    );

    await handler.issue(mockNameSpace);

    // カスタムジェネレータが使用されていることを確認
    expect(mockHashMapGenerator).toHaveBeenCalledWith(mockNameSpace);
    expect(mockMsoPayloadGenerator).toHaveBeenCalled();
    expect(mockProtectHeaderGenerator.generate).toHaveBeenCalled();
    expect(mockUnprotectHeaderGenerator.generate).toHaveBeenCalled();
  });

  it('should handle errors from generators', async () => {
    const mockHashMapGenerator = vi
      .fn()
      .mockRejectedValue(new Error('Generator failed'));

    const handler = new MsoIssueHandlerImpl(
      mockKeyManager,
      mockX509Generator,
      mockConfig,
      {
        hashMapGenerator: mockHashMapGenerator,
      }
    );

    await expect(handler.issue(mockNameSpace)).rejects.toThrow(
      'Generator failed'
    );
  });
});
