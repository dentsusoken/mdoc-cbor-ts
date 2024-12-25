import { COSEKey } from '@auth0/cose';
import {
  ConvertToCoseKey,
  createDefaultConvertToCoseKey,
} from './ConvertToCoseKey';
import { createDefaultConvertToJWK } from './ConvertToJWK';
import { KeyConverterConfig } from './KeyConverterImpl';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { JWK } from '../../schemas/keys';

describe('ConvertToCoseKey', () => {
  const config: KeyConverterConfig = {
    KEY_ALGORITHM: 'ES256',
    NAMED_CURVE: 'P-256',
    HASH_ALGORITHM: 'SHA-256',
  };

  let mockCryptoKey: CryptoKey;
  let mockJWK: JWK;
  let mockCOSEKey: COSEKey;
  const convertToJWK = createDefaultConvertToJWK(config);
  const convertToCoseKey: ConvertToCoseKey =
    createDefaultConvertToCoseKey(convertToJWK);

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

    // JWKの生成
    const exportedJwk = await crypto.subtle.exportKey('jwk', mockCryptoKey);
    mockJWK = {
      kty: exportedJwk.kty!,
      crv: exportedJwk.crv!,
      x: exportedJwk.x!,
      y: exportedJwk.y!,
      d: exportedJwk.d,
      alg: config.KEY_ALGORITHM,
      use: 'sig',
      key_ops: ['sign'],
    };

    // COSEKeyの生成
    mockCOSEKey = await COSEKey.fromJWK(mockJWK);
  });

  it('should convert CryptoKey to COSEKey', async () => {
    const kid = 'test-kid';
    const result = await convertToCoseKey(mockCryptoKey, 'private', kid);

    expect(result).toBeInstanceOf(COSEKey);
    const jwk = await result.toJWK();
    expect(jwk.kty).toBe('EC');
    expect(jwk.alg).toBe('ES256');
    expect(jwk.crv).toBe('P-256');
    expect(jwk.kid).toBe(Buffer.from(kid).toString('base64url'));
    expect(jwk.x).toBeDefined();
    expect(jwk.y).toBeDefined();
    expect(jwk.d).toBeDefined();
  });

  it('should convert JWK to COSEKey', async () => {
    const kid = 'test-kid';
    const result = await convertToCoseKey(mockJWK, 'private', kid);

    expect(result).toBeInstanceOf(COSEKey);
    const jwk = await result.toJWK();
    expect(jwk.kty).toBe('EC');
    expect(jwk.alg).toBe('ES256');
    expect(jwk.crv).toBe('P-256');
    expect(jwk.kid).toBe(Buffer.from(kid).toString('base64url'));
    expect(jwk.x).toBeDefined();
    expect(jwk.y).toBeDefined();
    expect(jwk.d).toBeDefined();
  });

  it('should convert JWK to public COSEKey', async () => {
    const kid = 'test-kid';
    const publicJWK = { ...mockJWK };
    delete publicJWK.d;
    publicJWK.key_ops = ['verify'];

    const result = await convertToCoseKey(publicJWK, 'public', kid);

    expect(result).toBeInstanceOf(COSEKey);
    const jwk = await result.toJWK();
    expect(jwk.kty).toBe('EC');
    expect(jwk.alg).toBe('ES256');
    expect(jwk.crv).toBe('P-256');
    expect(jwk.kid).toBe(Buffer.from(kid).toString('base64url'));
    expect(jwk.x).toBeDefined();
    expect(jwk.y).toBeDefined();
    expect(jwk.d).toBeUndefined();
  });

  it('should pass through COSEKey and update its properties', async () => {
    const kid = 'test-kid';
    const result = await convertToCoseKey(mockCOSEKey, 'private', kid);

    expect(result).toBeInstanceOf(COSEKey);
    const jwk = await result.toJWK();
    expect(jwk.kty).toBe('EC');
    expect(jwk.alg).toBe('ES256');
    expect(jwk.crv).toBe('P-256');
    expect(jwk.kid).toBe(Buffer.from(kid).toString('base64url'));
    expect(jwk.x).toBeDefined();
    expect(jwk.y).toBeDefined();
    expect(jwk.d).toBeDefined();
  });

  it('should throw error when JWK is invalid', async () => {
    const invalidJWK = {} as JWK; // Missing required fields
    await expect(
      convertToCoseKey(invalidJWK, 'private', 'test-kid')
    ).rejects.toThrow('Failed to convert to CoseKey.');
  });

  it('should throw error when CryptoKey conversion fails', async () => {
    const invalidCryptoKey = {} as CryptoKey;
    await expect(
      convertToCoseKey(invalidCryptoKey, 'private', 'test-kid')
    ).rejects.toThrow('Failed to convert to CoseKey.');
  });
});
