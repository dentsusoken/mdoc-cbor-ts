import { COSEKey, COSEKeyParam, Headers, ProtectedHeaders } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { buildProtectedHeaders } from './BuildProtectedHeaders';

describe('buildProtectedHeaders', () => {
  it('should create protected headers with algorithm and key ID', () => {
    const coseKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      x: 'test-x',
      y: 'test-y',
      d: 'test-d',
    });
    coseKey.set(COSEKeyParam.Algorithm, -7); // ES256
    coseKey.set(COSEKeyParam.KeyID, Buffer.from('test-key-id'));

    const headers = buildProtectedHeaders(coseKey);
    expect(headers).toBeInstanceOf(ProtectedHeaders);
    expect(headers.get(Headers.Algorithm)).toBe(-7);
    expect(headers.get(Headers.KeyID)).toEqual(Buffer.from('test-key-id'));
  });

  it('should throw error when algorithm is missing', () => {
    const coseKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      x: 'test-x',
      y: 'test-y',
      d: 'test-d',
    });
    coseKey.set(COSEKeyParam.KeyID, Buffer.from('test-key-id'));

    expect(() => buildProtectedHeaders(coseKey)).toThrow('Algorithm not found');
  });

  it('should throw error when key ID is missing', () => {
    const coseKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      x: 'test-x',
      y: 'test-y',
      d: 'test-d',
    });
    coseKey.set(COSEKeyParam.Algorithm, -7); // ES256

    expect(() => buildProtectedHeaders(coseKey)).toThrow('Key ID not found');
  });
});
