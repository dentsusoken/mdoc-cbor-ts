import { COSEKey } from '@auth0/cose';
import { ConvertToJWK, createDefaultConvertToJWK } from './ConvertToJWK';
import { KeyConverterConfig } from './KeyConverterImpl';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { JWK } from '../../schemas/keys';

describe('ConvertToJWK', () => {
  const config: KeyConverterConfig = {
    KEY_ALGORITHM: 'ES256',
    NAMED_CURVE: 'P-256',
    HASH_ALGORITHM: 'SHA-256',
  };

  const validJWK: JWK = {
    kty: 'EC',
    crv: 'P-256',
    x: 'PTTjIY84aLtaZCxLTrG_d8I4ytqWVHu_GS8BNKU0GFk',
    y: '-frkxg_PF6-l3lXk07GJxSemX3QcVZtM-dx7TUqw0lY',
    d: 'N3Hm1LXA210YVGGsXw_GklMwcLu_bMgnzDese-RLPls',
  };

  let mockCryptoKey: CryptoKey;
  let mockCOSEKey: COSEKey;
  const convertToJWK: ConvertToJWK = createDefaultConvertToJWK(config);

  beforeEach(async () => {
    vi.clearAllMocks();

    // CryptoKeyの生成
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign', 'verify']
    );
    mockCryptoKey = (keyPair as CryptoKeyPair).privateKey;

    // COSEKeyの生成
    mockCOSEKey = await COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      x: 'PTTjIY84aLtaZCxLTrG_d8I4ytqWVHu_GS8BNKU0GFk',
      y: '-frkxg_PF6-l3lXk07GJxSemX3QcVZtM-dx7TUqw0lY',
      d: 'N3Hm1LXA210YVGGsXw_GklMwcLu_bMgnzDese-RLPls',
    });
  });

  it('should convert CryptoKey to private JWK with correct properties', async () => {
    const kid = 'test-kid';
    const result = await convertToJWK(mockCryptoKey, 'private', kid);

    expect(result).toEqual(
      expect.objectContaining({
        kty: 'EC',
        crv: config.NAMED_CURVE,
        kid,
        alg: config.KEY_ALGORITHM,
        use: 'sig',
        key_ops: ['sign'],
      })
    );
    expect(result).toHaveProperty('x');
    expect(result).toHaveProperty('y');
    expect(result).toHaveProperty('d');
  });

  it('should convert CryptoKey to public JWK and remove private components', async () => {
    const kid = 'test-kid';
    const result = await convertToJWK(mockCryptoKey, 'public', kid);

    expect(result).toEqual(
      expect.objectContaining({
        kty: 'EC',
        crv: config.NAMED_CURVE,
        kid,
        alg: config.KEY_ALGORITHM,
        use: 'sig',
        key_ops: ['verify'],
      })
    );
    expect(result).toHaveProperty('x');
    expect(result).toHaveProperty('y');
    expect(result).not.toHaveProperty('d');
  });

  it('should convert COSEKey to JWK', async () => {
    const kid = 'test-kid';
    const result = await convertToJWK(mockCOSEKey, 'private', kid);

    expect(result).toEqual(
      expect.objectContaining({
        kty: 'EC',
        crv: config.NAMED_CURVE,
        kid,
        alg: config.KEY_ALGORITHM,
        use: 'sig',
        key_ops: ['sign'],
      })
    );
    expect(result).toHaveProperty('x');
    expect(result).toHaveProperty('y');
    expect(result).toHaveProperty('d');
  });

  it('should pass through valid JWK and add required properties', async () => {
    const kid = 'test-kid';
    const result = await convertToJWK(validJWK, 'private', kid);

    expect(result).toEqual({
      ...validJWK,
      kid,
      alg: config.KEY_ALGORITHM,
      crv: config.NAMED_CURVE,
      use: 'sig',
      key_ops: ['sign'],
    });
  });

  it('should throw error when input JWK is invalid', async () => {
    const invalidJWK = {} as JWK; // Missing required 'kty' field
    await expect(
      convertToJWK(invalidJWK, 'private', 'test-kid')
    ).rejects.toThrow('Failed to convert to JWK.');
  });

  it('should throw error when COSEKey conversion fails', async () => {
    vi.spyOn(mockCOSEKey, 'toJWK').mockImplementation(() => {
      throw new Error('Conversion failed');
    });
    await expect(
      convertToJWK(mockCOSEKey, 'private', 'test-kid')
    ).rejects.toThrow('Failed to convert to JWK.');
  });
});
