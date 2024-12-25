import { describe, expect, it, vi } from 'vitest';
import { createDefaultHashMapGenerator } from './HashMapGenerator';
import { RawNameSpaces } from '../../schemas';
import { encode, Tag } from 'cbor-x';
import { MsoIssuerConfig } from './MsoIssueHandlerImpl';

describe('HashMapGenerator', () => {
  const mockConfig: MsoIssuerConfig = {
    HASH_ALGORITHM: 'SHA-256',
    EXPIRATION_DELTA_HOURS: 24,
  };

  const mockNameSpaces: RawNameSpaces = {
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
      new Tag(
        {
          digestID: 2,
          random: Buffer.from('random2'),
          elementIdentifier: 'test-element-2',
          elementValue: 'test-value-2',
        },
        24
      ),
    ],
  };

  it('should generate hash map correctly', async () => {
    const mockDigest = new Uint8Array([1, 2, 3, 4]);
    const mockSubtleDigest = vi
      .spyOn(crypto.subtle, 'digest')
      .mockResolvedValue(mockDigest);

    const hashMapGenerator = createDefaultHashMapGenerator(mockConfig);
    const result = await hashMapGenerator(mockNameSpaces);

    // 各エントリに対してハッシュが生成されていることを確認
    expect(mockSubtleDigest).toHaveBeenCalledTimes(2);

    // 各エントリのハッシュ値を確認
    expect(result['org.iso.18013.5.1'][1]).toEqual(mockDigest);
    expect(result['org.iso.18013.5.1'][2]).toEqual(mockDigest);

    // digestの呼び出し引数を確認
    mockNameSpaces['org.iso.18013.5.1'].forEach((item) => {
      expect(mockSubtleDigest).toHaveBeenCalledWith(
        mockConfig.HASH_ALGORITHM,
        encode(new Tag(encode(item.value), 24))
      );
    });
  });

  it('should handle empty NameSpaces', async () => {
    const hashMapGenerator = createDefaultHashMapGenerator(mockConfig);
    const result = await hashMapGenerator({});

    expect(result).toEqual({});
  });

  it('should handle NameSpaces with empty arrays', async () => {
    const hashMapGenerator = createDefaultHashMapGenerator(mockConfig);
    const result = await hashMapGenerator({ 'org.iso.18013.5.1': [] });

    expect(result).toEqual({ 'org.iso.18013.5.1': {} });
  });

  it('should handle digest errors', async () => {
    vi.spyOn(crypto.subtle, 'digest').mockRejectedValue(
      new Error('Digest failed')
    );

    const hashMapGenerator = createDefaultHashMapGenerator(mockConfig);
    await expect(hashMapGenerator(mockNameSpaces)).rejects.toThrow(
      'Digest failed'
    );
  });
});
