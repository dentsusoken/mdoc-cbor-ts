import { COSEKey } from '@auth0/cose';
import { JWK } from '../../schemas/keys/jwk';
import { describe, expect, it, vi } from 'vitest';
import { defaultConvertToJWK } from './ConvertToJWK';

describe('defaultConvertToJWK', () => {
  const mockJWK: JWK = {
    kty: 'EC',
    crv: 'P-256',
    x: 'test-x',
    y: 'test-y',
    d: 'test-d',
    alg: 'ES256',
  };

  let cryptoKey: CryptoKey;
  let coseKey: COSEKey;

  beforeAll(async () => {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign', 'verify']
    );
    cryptoKey = keyPair.privateKey;

    // COSEKeyを生成するために必要な最小限のJWK
    const jwk = {
      kty: 'EC',
      crv: 'P-256',
      x: 'test-x',
      y: 'test-y',
      d: 'test-d',
    };
    coseKey = await COSEKey.fromJWK(jwk);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should convert CryptoKey to private JWK', async () => {
    const result = await defaultConvertToJWK(cryptoKey, 'private');
    expect(result).toHaveProperty('kty');
    expect(result).toHaveProperty('crv');
    expect(result).toHaveProperty('x');
    expect(result).toHaveProperty('y');
    expect(result).toHaveProperty('d');
  });

  it('should convert CryptoKey to public JWK', async () => {
    const result = await defaultConvertToJWK(cryptoKey, 'public');
    expect(result).toHaveProperty('kty');
    expect(result).toHaveProperty('crv');
    expect(result).toHaveProperty('x');
    expect(result).toHaveProperty('y');
    expect(result).not.toHaveProperty('d');
  });

  it('should convert COSEKey to private JWK', async () => {
    const result = await defaultConvertToJWK(coseKey, 'private');
    expect(result).toHaveProperty('kty', 'EC');
    expect(result).toHaveProperty('crv', 'P-256');
    expect(result).toHaveProperty('x');
    expect(result).toHaveProperty('y');
    expect(result).toHaveProperty('d');
  });

  it('should convert COSEKey to public JWK', async () => {
    const result = await defaultConvertToJWK(coseKey, 'public');
    expect(result).toHaveProperty('kty', 'EC');
    expect(result).toHaveProperty('crv', 'P-256');
    expect(result).toHaveProperty('x');
    expect(result).toHaveProperty('y');
    expect(result).not.toHaveProperty('d');
  });

  it('should pass through JWK for private key', async () => {
    const result = await defaultConvertToJWK(mockJWK, 'private');
    expect(result).toEqual(mockJWK);
  });

  it('should pass through JWK and remove private components for public key', async () => {
    const result = await defaultConvertToJWK(mockJWK, 'public');
    const { d, p, q, dp, dq, qi, ...publicJWK } = mockJWK;
    expect(result).toEqual(publicJWK);
  });

  it('should throw error when conversion fails', async () => {
    const invalidKey = {} as CryptoKey;
    await expect(defaultConvertToJWK(invalidKey, 'private')).rejects.toThrow(
      'Failed to convert to JWK.'
    );
  });
});
