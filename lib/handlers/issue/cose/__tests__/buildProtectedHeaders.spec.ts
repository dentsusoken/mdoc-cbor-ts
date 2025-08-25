import { COSEKey, Headers, ProtectedHeaders } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { Algorithms } from '@auth0/cose';
import { buildProtectedHeaders } from '../buildProtectedHeaders';

describe('buildProtectedHeaders', () => {
  it('should create protected headers with algorithm and key ID', () => {
    const coseKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      d: '2j24AjEPsTO8N9I6gN_WwRel_3c744Mp8P0jkIqIfuE',
      x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
      y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
      alg: 'ES256',
      kid: 'key-123',
    });

    const headers = buildProtectedHeaders(coseKey);
    console.log(headers);

    expect(headers).toBeInstanceOf(ProtectedHeaders);
    expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES256);
    expect(headers.get(Headers.KeyID)).toBe('key-123');
  });

  it('should create protected headers with algorithm only when no key ID', () => {
    const coseKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      d: '2j24AjEPsTO8N9I6gN_WwRel_3c744Mp8P0jkIqIfuE',
      x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
      y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
      alg: 'ES256',
      // No kid parameter
    });

    const headers = buildProtectedHeaders(coseKey);

    expect(headers).toBeInstanceOf(ProtectedHeaders);
    expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES256);
    expect(headers.get(Headers.KeyID)).toBeUndefined();
  });

  it('should create protected headers with different algorithms', () => {
    const coseKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-384',
      d: '2j24AjEPsTO8N9I6gN_WwRel_3c744Mp8P0jkIqIfuE',
      x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
      y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
      alg: 'ES384',
      kid: 'key-456',
    });

    const headers = buildProtectedHeaders(coseKey);

    expect(headers).toBeInstanceOf(ProtectedHeaders);
    expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES384);
    expect(headers.get(Headers.KeyID)).toBe('key-456');
  });

  it('should throw error when algorithm is missing and curve is not supported', () => {
    const coseKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-xxx',
      d: '2j24AjEPsTO8N9I6gN_WwRel_3c744Mp8P0jkIqIfuE',
      x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
      y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
      // No alg parameter
      kid: 'key-123',
    });

    expect(() => buildProtectedHeaders(coseKey)).toThrow(
      'Algorithm not found in COSE key'
    );
  });

  it('should handle RSA keys with algorithm and key ID', () => {
    const coseKey = COSEKey.fromJWK({
      kty: 'RSA',
      n: 'test-n-value',
      e: 'AQAB',
      d: 'test-d-value',
      p: 'test-p-value',
      q: 'test-q-value',
      dp: 'test-dp-value',
      dq: 'test-dq-value',
      qi: 'test-qi-value',
      alg: 'PS256',
      kid: 'rsa-key-789',
    });

    const headers = buildProtectedHeaders(coseKey);

    expect(headers).toBeInstanceOf(ProtectedHeaders);
    expect(headers.get(Headers.Algorithm)).toBe(Algorithms.PS256);
    expect(headers.get(Headers.KeyID)).toBe('rsa-key-789');
  });

  it('should handle empty key ID string', () => {
    const coseKey = COSEKey.fromJWK({
      kty: 'EC',
      crv: 'P-256',
      d: '2j24AjEPsTO8N9I6gN_WwRel_3c744Mp8P0jkIqIfuE',
      x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
      y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
      alg: 'ES256',
      kid: '', // Empty string
    });

    const headers = buildProtectedHeaders(coseKey);

    expect(headers).toBeInstanceOf(ProtectedHeaders);
    expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES256);
    expect(headers.get(Headers.KeyID)).toBeUndefined();
  });
});
