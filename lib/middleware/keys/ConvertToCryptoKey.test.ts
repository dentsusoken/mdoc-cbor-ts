import { COSEKey } from '@auth0/cose';
import {
  ConvertToCryptoKey,
  createDefaultConvertToCryptoKey,
} from './ConvertToCryptoKey';
import { createDefaultConvertToJWK } from './ConvertToJWK';
import { KeyConverterConfig } from './KeyConverterImpl';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { JWK } from '../../schemas/keys';

describe('ConvertToCryptoKey', () => {
  const config: KeyConverterConfig = {
    KEY_ALGORITHM: 'ES256',
    NAMED_CURVE: 'P-256',
    HASH_ALGORITHM: 'SHA-256',
  };

  let mockCryptoKey: CryptoKey;
  let mockCOSEKey: COSEKey;
  const convertToJWK = createDefaultConvertToJWK(config);
  const convertToCryptoKey: ConvertToCryptoKey =
    createDefaultConvertToCryptoKey(convertToJWK);

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
    const jwk: JWK = {
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
    mockCOSEKey = await COSEKey.fromJWK(jwk);
  });

  it('should convert JWK to private CryptoKey', async () => {
    const kid = 'test-kid';
    const exportedJwk = await crypto.subtle.exportKey('jwk', mockCryptoKey);
    const jwk: JWK = {
      kty: exportedJwk.kty!,
      crv: exportedJwk.crv!,
      x: exportedJwk.x!,
      y: exportedJwk.y!,
      d: exportedJwk.d,
      alg: config.KEY_ALGORITHM,
      use: 'sig',
      key_ops: ['sign'],
    };
    const result = await convertToCryptoKey(jwk, 'private', kid);

    expect(result).toBeInstanceOf(CryptoKey);
    expect(result.type).toBe('private');
    expect(result.algorithm).toEqual({
      name: 'ECDSA',
      namedCurve: 'P-256',
    });
    expect(result.extractable).toBe(true);
    expect(result.usages).toEqual(['sign']);
  });

  it('should convert JWK to public CryptoKey', async () => {
    const kid = 'test-kid';
    const exportedJwk = await crypto.subtle.exportKey('jwk', mockCryptoKey);
    const jwk: JWK = {
      kty: exportedJwk.kty!,
      crv: exportedJwk.crv!,
      x: exportedJwk.x!,
      y: exportedJwk.y!,
      alg: config.KEY_ALGORITHM,
      use: 'sig',
      key_ops: ['verify'],
    };
    const result = await convertToCryptoKey(jwk, 'public', kid);

    expect(result).toBeInstanceOf(CryptoKey);
    expect(result.type).toBe('public');
    expect(result.algorithm).toEqual({
      name: 'ECDSA',
      namedCurve: 'P-256',
    });
    expect(result.extractable).toBe(true);
    expect(result.usages).toEqual(['verify']);
  });

  it('should convert COSEKey to CryptoKey', async () => {
    const kid = 'test-kid';
    const result = await convertToCryptoKey(mockCOSEKey, 'private', kid);

    expect(result).toBeInstanceOf(CryptoKey);
    expect(result.type).toBe('private');
    expect(result.algorithm).toEqual({
      name: 'ECDSA',
      namedCurve: 'P-256',
    });
    expect(result.extractable).toBe(true);
    expect(result.usages).toEqual(['sign']);
  });

  it('should pass through CryptoKey and update its properties', async () => {
    const kid = 'test-kid';
    const result = await convertToCryptoKey(mockCryptoKey, 'private', kid);

    expect(result).toBeInstanceOf(CryptoKey);
    expect(result.type).toBe('private');
    expect(result.algorithm).toEqual({
      name: 'ECDSA',
      namedCurve: 'P-256',
    });
    expect(result.extractable).toBe(true);
    expect(result.usages).toEqual(['sign']);
  });

  it('should throw error when JWK is invalid', async () => {
    const invalidJWK = {} as JWK; // Missing required 'kty' field
    await expect(
      convertToCryptoKey(invalidJWK, 'private', 'test-kid')
    ).rejects.toThrow('Failed to convert to CryptoKey.');
  });

  it('should throw error when COSEKey conversion fails', async () => {
    vi.spyOn(mockCOSEKey, 'toJWK').mockImplementation(() => {
      throw new Error('Conversion failed');
    });
    await expect(
      convertToCryptoKey(mockCOSEKey, 'private', 'test-kid')
    ).rejects.toThrow('Failed to convert to CryptoKey.');
  });
});
